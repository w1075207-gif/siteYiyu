const express = require("express");
const path = require("path");
const { initDb } = require("./db");

const app = express();
// When behind Apache: PORT=3000, bind 127.0.0.1. Standalone: PORT=8090, bind all.
const PORT = process.env.PORT || 8090;
const HOST = process.env.HOST || (PORT === 8090 ? "0.0.0.0" : "127.0.0.1");

const profile = {
  name: "YiyuBot 的空间",
  welcome: "欢迎来到 Yiyu 的私人空间",
  tagline: "持续迭代、可拓展",
  sections: [
    {
      title: "最新计划",
      detail: "把握最热剧集、最新日程和提醒。",
      link: "#schedule"
    },
    {
      title: "写作与灵感",
      detail: "记录想法、展示景象、连接外部资源。",
      link: "#notes"
    },
    {
      title: "工具箱",
      detail: "可扩展的 API、个人素材、协作入口。",
      link: "#tools"
    }
  ]
};

let scheduleDb = null;

app.use(express.json());

app.get("/api/profile", (req, res) => {
  const schedule = scheduleDb ? scheduleDb.getSchedule() : [];
  res.json({ profile, schedule });
});

app.get("/api/schedule", (req, res) => {
  const schedule = scheduleDb ? scheduleDb.getSchedule() : [];
  res.json(schedule);
});

app.post("/api/schedule", (req, res) => {
  const { date, title, note } = req.body || {};
  if (!date || !title) {
    return res.status(400).json({ error: "date and title required" });
  }
  if (!scheduleDb) return res.status(503).json({ error: "database not ready" });
  const item = scheduleDb.createSchedule({ date, title, note });
  res.status(201).json(item);
});

app.put("/api/schedule/:id", (req, res) => {
  const id = req.params.id;
  const { date, title, note } = req.body || {};
  if (!scheduleDb) return res.status(503).json({ error: "database not ready" });
  const item = scheduleDb.updateSchedule(id, { date, title, note });
  if (!item) return res.status(404).json({ error: "not found" });
  res.json(item);
});

app.delete("/api/schedule/:id", (req, res) => {
  const id = req.params.id;
  if (!scheduleDb) return res.status(503).json({ error: "database not ready" });
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

initDb()
  .then((db) => {
    scheduleDb = db;
    app.listen(PORT, HOST, () => {
      console.log(`Personal site running on http://${HOST}:${PORT} (SQLite)`);
    });
  })
  .catch((err) => {
    console.error("DB init failed:", err);
    process.exit(1);
  });
