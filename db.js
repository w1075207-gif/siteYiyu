const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "data", "site.db");
const scheduleJsonPath = path.join(__dirname, "data", "schedule.json");

let db = null;
let SQL = null;

function saveToFile() {
  if (!db) return;
  const data = db.export();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dbPath, Buffer.from(data), "binary");
}

function rowToItem(row) {
  return {
    id: row[0],
    date: row[1],
    title: row[2],
    note: row[3] || "",
  };
}

async function initDb() {
  if (db) return { getSchedule, createSchedule, updateSchedule, deleteSchedule };

  const initSqlJs = require("sql.js");
  SQL = await initSqlJs();

  let buffer;
  try {
    buffer = fs.readFileSync(dbPath);
  } catch (_) {
    buffer = null;
  }
  db = buffer ? new SQL.Database(new Uint8Array(buffer)) : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS schedule (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      note TEXT DEFAULT ''
    )
  `);

  const count = db.exec("SELECT COUNT(*) FROM schedule");
  const isEmpty = count.length && count[0].values[0][0] === 0;

  function runMigration() {
    if (!fs.existsSync(scheduleJsonPath)) return;
    try {
      const raw = fs.readFileSync(scheduleJsonPath, "utf8");
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return;
      const stmt = db.prepare(
        "INSERT OR IGNORE INTO schedule (id, date, title, note) VALUES (?, ?, ?, ?)"
      );
      for (const item of list) {
        if (item.id && item.date && item.title) {
          stmt.bind([item.id, item.date, item.title, item.note || ""]);
          stmt.step();
          stmt.reset();
        }
      }
      stmt.free();
      saveToFile();
    } catch (_) {}
  }

  if (isEmpty) runMigration();

  // If DB still has no rows (e.g. bad/corrupt file), re-migrate from JSON once
  const firstGet = db.exec("SELECT COUNT(*) FROM schedule");
  const stillEmpty = firstGet.length && firstGet[0].values[0][0] === 0;
  if (stillEmpty && fs.existsSync(scheduleJsonPath)) {
    runMigration();
  }

  function getSchedule() {
    const result = db.exec("SELECT id, date, title, note FROM schedule ORDER BY date, id");
    if (!result.length) return [];
    return result[0].values.map((row) => rowToItem(row));
  }

  function nextId() {
    return "s" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function createSchedule(item) {
    const id = nextId();
    const date = String(item.date).trim();
    const title = String(item.title).trim();
    const note = String(item.note ?? "").trim();
    const stmt = db.prepare(
      "INSERT INTO schedule (id, date, title, note) VALUES (?, ?, ?, ?)"
    );
    stmt.bind([id, date, title, note]);
    stmt.step();
    stmt.free();
    saveToFile();
    return { id, date, title, note };
  }

  function updateSchedule(id, updates) {
    const stmt = db.prepare("SELECT id, date, title, note FROM schedule WHERE id = ?");
    stmt.bind([id]);
    if (!stmt.step()) {
      stmt.free();
      return null;
    }
    const row = stmt.getAsObject();
    stmt.free();
    const current = {
      id: row.id,
      date: row.date,
      title: row.title,
      note: row.note || "",
    };
    const date = updates.date !== undefined ? String(updates.date).trim() : current.date;
    const title = updates.title !== undefined ? String(updates.title).trim() : current.title;
    const note = updates.note !== undefined ? String(updates.note).trim() : current.note;
    const upd = db.prepare(
      "UPDATE schedule SET date = ?, title = ?, note = ? WHERE id = ?"
    );
    upd.bind([date, title, note, id]);
    upd.step();
    upd.free();
    saveToFile();
    return { id, date, title, note };
  }

  function deleteSchedule(id) {
    const stmt = db.prepare("DELETE FROM schedule WHERE id = ?");
    stmt.bind([id]);
    stmt.step();
    const n = db.getRowsModified();
    stmt.free();
    saveToFile();
    return n > 0;
  }

  return { getSchedule, createSchedule, updateSchedule, deleteSchedule };
}

module.exports = { initDb };
