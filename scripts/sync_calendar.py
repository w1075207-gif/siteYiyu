#!/usr/bin/env python3
import argparse
import json
import os
import sqlite3
import sys
import uuid
from datetime import datetime, date, timedelta, timezone
from zoneinfo import ZoneInfo

from icalendar import Calendar, Event
from caldav import DAVClient

# Configuration
CALDAV_URL = "https://caldav.icloud.com"
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "site.db")
TARGET_TZ = ZoneInfo(os.environ.get("YIYU_CALENDAR_TZ", "Europe/Berlin"))
DAYS_AHEAD = int(os.environ.get("YIYU_CAL_SYNC_DAYS", "30"))
CALENDAR_NAME_HINT = os.environ.get("ICLOUD_CALENDAR_NAME", "个人")
CALENDAR_URL_HINT = os.environ.get("ICLOUD_CALENDAR_URL")
ICLOUD_EMAIL = os.environ.get("ICLOUD_EMAIL")
ICLOUD_APP_PASSWORD = os.environ.get("ICLOUD_APP_PASSWORD")


def fatal(message):
    print(message, file=sys.stderr)
    sys.exit(1)


def ensure_credentials():
    if not ICLOUD_EMAIL or not ICLOUD_APP_PASSWORD:
        fatal("CalDAV credentials missing. Set ICLOUD_EMAIL and ICLOUD_APP_PASSWORD.")


def connect_client():
    ensure_credentials()
    return DAVClient(CALDAV_URL, username=ICLOUD_EMAIL, password=ICLOUD_APP_PASSWORD)


def normalize_url(value):
    if not value:
        return None
    return value.rstrip("/")


def select_calendar(client, calendar_url=None):
    calendars = client.principal().calendars()
    if not calendars:
        fatal("No calendars found for this account.")
    target_url = normalize_url(calendar_url or CALENDAR_URL_HINT)
    if target_url:
        for cal in calendars:
            try:
                cal_url = str(cal.url.canonical()).rstrip("/")
            except Exception:
                cal_url = None
            if cal_url and cal_url == target_url:
                return cal
    if CALENDAR_NAME_HINT:
        hint = CALENDAR_NAME_HINT.lower()
        for cal in calendars:
            name = getattr(cal, "name", None)
            if not name:
                try:
                    name = cal.get_display_name()
                except Exception:
                    name = None
            if name and hint in name.lower():
                return cal
    return calendars[-1]


def parse_date_time(date_str, time_str):
    if not date_str:
        fatal("--date is required")
    try:
        date_obj = datetime.fromisoformat(date_str).date()
    except ValueError:
        fatal(f"Invalid date: {date_str}")
    if time_str:
        try:
            time_parts = time_str.split(":")
            hours = int(time_parts[0])
            minutes = int(time_parts[1])
        except Exception:
            fatal(f"Invalid time: {time_str}")
        dt = datetime(
            date_obj.year,
            date_obj.month,
            date_obj.day,
            hours,
            minutes,
            tzinfo=TARGET_TZ,
        )
        return dt
    return date_obj


def build_event_calendar(uid, start, summary, note):
    cal = Calendar()
    cal.add("prodid", "-//YiyuSite//CalDAV Sync//C")
    cal.add("version", "2.0")
    event = Event()
    event.add("uid", uid)
    event.add("dtstamp", datetime.now(timezone.utc))
    if isinstance(start, datetime):
        dt_end = start + timedelta(hours=1)
    else:
        dt_end = start + timedelta(days=1)
    event.add("dtstart", start)
    event.add("dtend", dt_end)
    event.add("summary", summary)
    if note:
        event.add("description", note)
    cal.add_component(event)
    return cal


def format_note(dt, location, description):
    parts = []
    if location:
        parts.append(str(location).strip())
    if description:
        first_line = str(description).splitlines()[0].strip()
        if first_line:
            parts.append(first_line)
    return " · ".join(parts)


def event_identifier(uid, dt):
    stamp = ""
    if isinstance(dt, datetime):
        stamp = dt.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    elif isinstance(dt, date):
        stamp = datetime(dt.year, dt.month, dt.day, tzinfo=timezone.utc).strftime(
            "%Y%m%dT000000Z"
        )
    safe_uid = uid.replace("/", "_").replace("\\", "_")
    return f"cal-{safe_uid}-{stamp}"


def parse_event_resource(obj, calendar):
    try:
        vevent = obj.icalendar_instance.walk("VEVENT")[0]
    except Exception:
        return None
    summary = str(vevent.get("SUMMARY")) if vevent.get("SUMMARY") else ""
    uid = str(vevent.get("UID")) if vevent.get("UID") else str(uuid.uuid4())
    dtstart = vevent.decoded("DTSTART")
    time_value = ""
    if isinstance(dtstart, datetime):
        time_value = dtstart.strftime("%H:%M")
        local_date = dtstart.astimezone(TARGET_TZ).date().isoformat()
    else:
        local_date = dtstart.isoformat()
    note = format_note(
        dtstart,
        vevent.get("LOCATION"),
        vevent.get("DESCRIPTION"),
    )
    event_id = event_identifier(uid, dtstart)
    href = str(obj.url.canonical()) if obj.url else None
    cal_url = str(calendar.url.canonical())
    return {
        "id": event_id,
        "date": local_date,
        "title": summary,
        "note": note,
        "time": time_value,
        "cal_uid": uid,
        "cal_event_href": href,
        "cal_calendar_url": cal_url,
    }


def sync_events(days=DAYS_AHEAD):
    ensure_db_dir()
    client = connect_client()
    calendar = select_calendar(client)
    now = datetime.now(timezone.utc)
    end = now + timedelta(days=days)
    objects = calendar.search(start=now, end=end)
    parsed = {}
    for obj in objects:
        event = parse_event_resource(obj, calendar)
        if event:
            parsed[event["id"]] = event
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(schedule)")
    cols = {row["name"] for row in cursor.fetchall()}
    required = {"id", "date", "title", "note", "time", "cal_uid", "cal_calendar_url", "cal_event_href"}
    if not required.issubset(cols):
        fatal("Database schema is not ready yet. Run the server or ensure migrations completed.")
    cursor.execute("SELECT id FROM schedule WHERE id LIKE 'cal-%'")
    existing = {row[0] for row in cursor.fetchall()}
    insert = cursor.execute
    cursor_ = conn.cursor()
    upsert = cursor_.execute
    insert_stmt = "INSERT OR REPLACE INTO schedule (id, date, title, note, time, cal_uid, cal_calendar_url, cal_event_href) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    for event in parsed.values():
        upsert(
            insert_stmt,
            (
                event["id"],
                event["date"],
                event["title"],
                event["note"],
                event["time"],
                event["cal_uid"],
                event["cal_calendar_url"],
                event["cal_event_href"],
            ),
        )
    to_remove = existing - set(parsed.keys())
    for rid in to_remove:
        cursor_.execute("DELETE FROM schedule WHERE id = ?", (rid,))
    conn.commit()
    conn.close()
    print(f"Synced {len(parsed)} calendar reminders (removed {len(to_remove)} stale entries).")


def ensure_db_dir():
    directory = os.path.dirname(DB_PATH)
    if not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)


def push_event(date_str, summary, note=None, time_str=None, uid=None, href=None, calendar_url=None):
    ensure_db_dir()
    client = connect_client()
    calendar = select_calendar(client, calendar_url)
    parsed_start = parse_date_time(date_str, time_str)
    uid_value = uid or str(uuid.uuid4())
    ical_calendar = build_event_calendar(uid_value, parsed_start, summary, note)
    if href:
        event = calendar.event_by_url(href)
        event._icalendar_instance = ical_calendar
        event.save()
    else:
        event = calendar.add_event(ical_calendar.to_ical())
    result = {
        "cal_uid": uid_value,
        "cal_event_href": str(event.url.canonical()),
        "cal_calendar_url": str(calendar.url.canonical()),
    }
    print(json.dumps(result))


def delete_event(href, calendar_url=None):
    if not href:
        fatal("--event-href is required for delete")
    client = connect_client()
    calendar = select_calendar(client, calendar_url)
    event = calendar.event_by_url(href)
    event.delete()
    print(json.dumps({"deleted": True}))


def main():
    parser = argparse.ArgumentParser(description="CalDAV sync helper for YiyuSite")
    parser.add_argument("--action", choices=["sync", "push", "delete"], default="sync")
    parser.add_argument("--date")
    parser.add_argument("--time")
    parser.add_argument("--summary")
    parser.add_argument("--note")
    parser.add_argument("--uid")
    parser.add_argument("--event-href")
    parser.add_argument("--calendar-url")
    parser.add_argument("--days", type=int)
    args = parser.parse_args()
    try:
        if args.action == "sync":
            sync_events(args.days if args.days else DAYS_AHEAD)
        elif args.action == "push":
            if not args.date or not args.summary:
                fatal("--date and --summary are required for push")
            push_event(
                args.date,
                args.summary,
                note=args.note,
                time_str=args.time,
                uid=args.uid,
                href=args.event_href,
                calendar_url=args.calendar_url,
            )
        elif args.action == "delete":
            delete_event(args.event_href, calendar_url=args.calendar_url)
    except Exception as exc:
        fatal(f"CalDAV script error: {exc}")


if __name__ == "__main__":
    main()
