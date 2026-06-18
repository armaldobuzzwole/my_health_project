const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./health.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS health_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, log_date DATE NOT NULL, sleep_hours REAL NOT NULL, steps INTEGER NOT NULL, mood_score INTEGER NOT NULL)");
});

module.exports = db;