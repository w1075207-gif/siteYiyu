const express = require("express");
const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");
const { initDb } = require("./db");

const app = express();
// When behind Apache: PORT=3000, bind 127.0.0.1. Standalone: PORT=8090, bind all.
const PORT = process.env.PORT || 8090;
const HOST = process.env.HOST || (PORT === 8090 ? "0.0.0.0" : "127.0.0.1");

const scriptPath = path.join(__dirname, "scripts", "sync_calendar.py");
const pythonPath = fs.existsSync(path.join(__dirname, ".venv", "bin", "python"))
  ? path.join(__dirname, ".venv", "bin", "python")
  : "python3";
const notesPath = path.join(__dirname, "notes", "notes.json");

const profile = {
  name: "YiyuBot 的空间",
  welcome: "欢迎来到 Yiyu 的私人空间",
  tagline: "持续迭代、可拓展",
  sections: [
    {
      title: "最新计划",
      detail: "把握最热剧集、最新日程和提醒。",
      link: "#schedule",
    },
    {
      title: "写作与灵感",
      detail: "记录想法、展示景象、连接外部资源。",
      link: "#notes",
    },
    {
      title: "工具箱",
      detail: "可扩展的 API、个人素材、协作入口。",
      link: "#tools",
    },
  ],
};

let scheduleDb = null;

app.use(express.json());

function calDAVEnabled() {
  return (
    fs.existsSync(scriptPath) &&
    !!process.env.ICLOUD_EMAIL &&
    !!process.env.ICLOUD_APP_PASSWORD
  );
}

function runCalDAVScript(args) {
  const proc = spawnSync(pythonPath, args, {
    cwd: __dirname,
    env: { ...process.env },
    encoding: "utf8",
  });
  if (proc.error) {
    console.error("CalDAV helper failed:", proc.error);
    return null;
  }
  if (proc.status !== 0) {
    console.error("CalDAV helper exited", proc.status, proc.stderr);
    return null;
  }
  const output = proc.stdout.trim();
  if (!output) return null;
  try {
    return JSON.parse(output);
  } catch (err) {
    console.error("CalDAV helper returned invalid JSON:", output, err);
    return null;
  }
}

function syncScheduleToCalDAV(item, existing) {
  if (!calDAVEnabled()) return null;
  const args = [scriptPath, "--action", "push", "--date", item.date, "--summary", item.title];
  if (item.time) {
    args.push("--time", item.time);
  }
  if (item.note) {
    args.push("--note", item.note);
  }
  if (existing?.cal_event_href) {
    args.push("--event-href", existing.cal_event_href);
  }
  if (existing?.cal_uid) {
    args.push("--uid", existing.cal_uid);
  }
  const result = runCalDAVScript(args);
  if (!result) return null;
  return {
    cal_uid: result.cal_uid,
    cal_calendar_url: result.cal_calendar_url,
    cal_event_href: result.cal_event_href,
  };
}

function deleteCalDAVEvent(existing) {
  if (!calDAVEnabled() || !existing?.cal_event_href) return;
  const args = [scriptPath, "--action", "delete", "--event-href", existing.cal_event_href];
  runCalDAVScript(args);
}

function loadNotes() {
  try {
    const raw = fs.readFileSync(notesPath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load notes:", err);
    return { sections: [] };
  }
}

app.get("/api/profile", (req, res) => {
  const schedule = scheduleDb ? scheduleDb.getSchedule() : [];
  res.json({ profile, schedule });
});

app.get("/api/schedule", (req, res) => {
  const schedule = scheduleDb ? scheduleDb.getSchedule() : [];
  res.json(schedule);
});

app.get("/api/notes", (req, res) => {
  const notes = loadNotes();
  res.json(notes);
});

app.post("/api/schedule", (req, res) => {
  const { date, title, note, time } = req.body || {};
  if (!date || !title) {
    return res.status(400).json({ error: "date and title required" });
  }
  if (!scheduleDb) return res.status(503).json({ error: "database not ready" });
  const item = scheduleDb.createSchedule({ date, title, note, time });
  const calInfo = syncScheduleToCalDAV(item, null);
  const finalItem = calInfo ? scheduleDb.updateSchedule(item.id, calInfo) : item;
  res.status(201).json(finalItem || item);
});

app.put("/api/schedule/:id", (req, res) => {
  const id = req.params.id;
  const { date, title, note, time } = req.body || {};
  if (!scheduleDb) return res.status(503).json({ error: "database not ready" });
  const existing = scheduleDb.getScheduleById(id);
  if (!existing) return res.status(404).json({ error: "not found" });
  const updated = scheduleDb.updateSchedule(id, { date, title, note, time });
  if (!updated) return res.status(404).json({ error: "not found" });
  const calInfo = syncScheduleToCalDAV(updated, existing);
  const finalItem = calInfo ? scheduleDb.updateSchedule(id, calInfo) : updated;
  res.json(finalItem || updated);
});

app.delete("/api/schedule/:id", (req, res) => {
  const id = req.params.id;
  if (!scheduleDb) return res.status(503).json({ error: "database not ready" });
  const existing = scheduleDb.getScheduleById(id);
  deleteCalDAVEvent(existing);
  const ok = scheduleDb.deleteSchedule(id);
  if (!ok) return res.status(404).json({ error: "not found" });
  res.status(200).json({ ok: true });
});

// Production: serve React build from dist
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// Fallback for SPA (and dev when dist does not exist)
app.use((req, res) => {
  const indexPath = path.join(distPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(500).send("Build not found. Run: npm run build");
    }
  });
});

try {
  scheduleDb = initDb();
  app.listen(PORT, HOST, () => {
    console.log(`Personal site running on http://${HOST}:${PORT} (SQLite)`);
  });
} catch (err) {
  console.error("DB init failed:", err);
  process.exit(1);
}
