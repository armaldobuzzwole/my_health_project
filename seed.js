const db = require('./database');
db.serialize(() => {
    const stmt = db.prepare("INSERT INTO health_logs (log_date, sleep_hours, steps, mood_score) VALUES (?, ?, ?, ?)");
    for (let i = 0; i < 90; i++) {
        // 設定規律：0-29 高風險, 30-59 中風險, 60-89 低風險
        let s = (i < 30) ? 4 : (i < 60 ? 6.5 : 8);
        let st = (i < 30) ? 2000 : (i < 60 ? 5000 : 9000);
        let m = (i < 30) ? 3 : (i < 60 ? 6 : 9);
        stmt.run(`2026-06-${(i % 28) + 1}`, s, st, m);
    }
    stmt.finalize();
    console.log('90 筆資料匯入完畢，現在決策樹有資料可以分類了！');
});