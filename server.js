const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8090;

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

const schedule = [
  { date: "2026-02-12", title: "取 jacket", note: "08:00 CET" }
];

app.use(express.json());
app.get("/api/profile", (req, res) => res.json({ profile, schedule }));

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

app.listen(PORT, () => {
  console.log(`Personal site running on http://localhost:${PORT}`);
});
