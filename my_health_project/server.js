const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 1. 首頁路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. 風險評估 API
app.get('/health-logs/risk', (req, res) => {
    const sleep = parseFloat(req.query.sleep);
    const steps = parseInt(req.query.steps);
    let risk = "低風險";
    if (sleep < 5.5) {
        risk = (steps < 3000) ? "高風險" : "中風險";
    } else if (sleep < 7.0) {
        risk = "中風險";
    }
    res.json({ risk_level: risk });
});

// 3. 取得所有紀錄
app.get('/health-logs', (req, res) => {
    db.all("SELECT * FROM health_logs", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 4. 新增紀錄 (已加入防空檢查與 0-24 小時限制)
app.post('/health-logs', (req, res) => {
    const { log_date, sleep_hours, steps, mood_score } = req.body;
    
    // 檢查欄位與範圍
    if (!log_date || sleep_hours === undefined || !steps || !mood_score) {
        return res.status(400).json({ error: "所有欄位皆為必填" });
    }
    if (sleep_hours < 0 || sleep_hours > 24) {
        return res.status(400).json({ error: "睡眠時數必須介於 0 與 24 之間" });
    }

    db.run("INSERT INTO health_logs (log_date, sleep_hours, steps, mood_score) VALUES (?,?,?,?)", 
           [log_date, sleep_hours, steps, mood_score], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

// 5. 修改紀錄 (已加入防空檢查與 0-24 小時限制)
app.put('/health-logs/:id', (req, res) => {
    const { sleep_hours, steps, mood_score } = req.body;

    // 檢查欄位與範圍
    if (sleep_hours === undefined || steps === undefined || mood_score === undefined) {
        return res.status(400).json({ error: "修改的欄位不能為空" });
    }
    if (sleep_hours < 0 || sleep_hours > 24) {
        return res.status(400).json({ error: "睡眠時數必須介於 0 與 24 之間" });
    }

    db.run("UPDATE health_logs SET sleep_hours = ?, steps = ?, mood_score = ? WHERE id = ?", 
           [sleep_hours, steps, mood_score, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: "success" });
    });
});

// 6. 刪除指定紀錄
app.delete('/health-logs/:id', (req, res) => {
    db.run("DELETE FROM health_logs WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: "deleted" });
    });
});

// 7. 清空資料庫並重置 ID 計數器
app.delete('/health-logs', (req, res) => {
    db.serialize(() => {
        db.run("DELETE FROM health_logs");
        db.run("DELETE FROM sqlite_sequence WHERE name='health_logs'");
    }, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: "all cleared and ID reset" });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
