const express = require("express");
const path = require("path");
const fs = require("fs");
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

const schedulePath = path.join(__dirname, "data", "schedule.json");

function readSchedule() {
  try {
    const raw = fs.readFileSync(schedulePath, "utf8");
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    return [];
  }
}

function writeSchedule(list) {
  const dir = path.dirname(schedulePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(schedulePath, JSON.stringify(list, null, 2), "utf8");
}

function nextId() {
  return "s" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

app.use(express.json());

app.get("/api/profile", (req, res) => {
  const schedule = readSchedule();
  res.json({ profile, schedule });
});

app.get("/api/schedule", (req, res) => {
  res.json(readSchedule());
});

app.post("/api/schedule", (req, res) => {
  const { date, title, note } = req.body || {};
  if (!date || !title) {
    return res.status(400).json({ error: "date and title required" });
  }
  const list = readSchedule();
  const item = {
    id: nextId(),
    date: String(date).trim(),
    title: String(title).trim(),
    note: String(note ?? "").trim()
  };
  list.push(item);
  writeSchedule(list);
  res.status(201).json(item);
});

app.put("/api/schedule/:id", (req, res) => {
  const id = req.params.id;
  const { date, title, note } = req.body || {};
  const list = readSchedule();
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  if (date !== undefined) list[idx].date = String(date).trim();
  if (title !== undefined) list[idx].title = String(title).trim();
  if (note !== undefined) list[idx].note = String(note).trim();
  writeSchedule(list);
  res.json(list[idx]);
});

app.delete("/api/schedule/:id", (req, res) => {
  const id = req.params.id;
  const list = readSchedule();
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  list.splice(idx, 1);
  writeSchedule(list);
  res.status(204).end();
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

app.listen(PORT, HOST, () => {
  console.log(`Personal site running on http://${HOST}:${PORT}`);
});
