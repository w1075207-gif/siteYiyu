const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "data", "site.db");
const scheduleJsonPath = path.join(__dirname, "data", "schedule.json");

let db;

function ensureDbDirectory() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function ensureColumns() {
  const info = db.prepare("PRAGMA table_info(schedule)").all();
  const existing = new Set(info.map((row) => row.name));
  const extras = [
    { name: "time", definition: "TEXT DEFAULT ''" },
    { name: "cal_uid", definition: "TEXT" },
    { name: "cal_calendar_url", definition: "TEXT" },
    { name: "cal_event_href", definition: "TEXT" },
  ];
  extras.forEach((col) => {
    if (!existing.has(col.name)) {
      db.prepare(`ALTER TABLE schedule ADD COLUMN ${col.name} ${col.definition}`).run();
    }
  });
}

function migrateFromSeed() {
  if (!fs.existsSync(scheduleJsonPath)) return;
  let raw;
  try {
    raw = fs.readFileSync(scheduleJsonPath, "utf8");
  } catch (err) {
    return;
  }
  let list;
  try {
    list = JSON.parse(raw);
  } catch (err) {
    return;
  }
  if (!Array.isArray(list)) return;
  const insert = db.prepare(
    "INSERT OR IGNORE INTO schedule (id, date, title, note, time) VALUES (?, ?, ?, ?, ?)"
  );
  const count = db.prepare("SELECT COUNT(*) AS c FROM schedule").get().c;
  if (count > 0) return;
  const transaction = db.transaction((items) => {
    for (const item of items) {
      if (!item.id || !item.date || !item.title) continue;
      insert.run(item.id, item.date, item.title, item.note || "", item.time || "");
    }
  });
  transaction(list);
}

function initDb() {
  if (db) {
    return {
      getSchedule,
      getScheduleById,
      createSchedule,
      updateSchedule,
      deleteSchedule,
    };
  }
  ensureDbDirectory();
  db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS schedule (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      note TEXT DEFAULT '',
      time TEXT DEFAULT '',
      cal_uid TEXT,
      cal_calendar_url TEXT,
      cal_event_href TEXT
    )
  `);
  ensureColumns();
  migrateFromSeed();
  return {
    getSchedule,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}

function toScheduleRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    note: row.note || "",
    time: row.time || "",
    cal_uid: row.cal_uid || null,
    cal_calendar_url: row.cal_calendar_url || null,
    cal_event_href: row.cal_event_href || null,
  };
}

function getSchedule() {
  const rows = db.prepare(
    "SELECT id, date, title, note, time, cal_uid, cal_calendar_url, cal_event_href FROM schedule ORDER BY date, id"
  ).all();
  return rows.map(toScheduleRow);
}

function getScheduleById(id) {
  const row = db
    .prepare(
      "SELECT id, date, title, note, time, cal_uid, cal_calendar_url, cal_event_href FROM schedule WHERE id = ?"
    )
    .get(id);
  return toScheduleRow(row);
}

function nextId() {
  return "s" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

function createSchedule(item) {
  const id = item.id || nextId();
  const date = String(item.date).trim();
  const title = String(item.title).trim();
  const note = String(item.note ?? "").trim();
  const time = String(item.time ?? "").trim();
  const cal_uid = item.cal_uid || null;
  const cal_calendar_url = item.cal_calendar_url || null;
  const cal_event_href = item.cal_event_href || null;

  const stmt = db.prepare(
    "INSERT INTO schedule (id, date, title, note, time, cal_uid, cal_calendar_url, cal_event_href) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  stmt.run(id, date, title, note, time, cal_uid, cal_calendar_url, cal_event_href);
  return getScheduleById(id);
}

function updateSchedule(id, updates) {
  const current = getScheduleById(id);
  if (!current) return null;
  const date = updates.date !== undefined ? String(updates.date).trim() : current.date;
  const title = updates.title !== undefined ? String(updates.title).trim() : current.title;
  const note = updates.note !== undefined ? String(updates.note ?? "").trim() : current.note;
  const time = updates.time !== undefined ? String(updates.time ?? "").trim() : current.time;
  const cal_uid = updates.cal_uid !== undefined ? updates.cal_uid : current.cal_uid;
  const cal_calendar_url =
    updates.cal_calendar_url !== undefined ? updates.cal_calendar_url : current.cal_calendar_url;
  const cal_event_href =
    updates.cal_event_href !== undefined ? updates.cal_event_href : current.cal_event_href;
  const stmt = db.prepare(
    "UPDATE schedule SET date = ?, title = ?, note = ?, time = ?, cal_uid = ?, cal_calendar_url = ?, cal_event_href = ? WHERE id = ?"
  );
  stmt.run(date, title, note, time, cal_uid, cal_calendar_url, cal_event_href, id);
  return getScheduleById(id);
}

function deleteSchedule(id) {
  const stmt = db.prepare("DELETE FROM schedule WHERE id = ?");
  const info = stmt.run(id);
  return info.changes > 0;
}

module.exports = { initDb };
