const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
// ทำให้เปิดหน้าเว็บ http://localhost:3000/longan_map.html ได้
app.use(express.static(__dirname));

// สร้างโฟลเดอร์ logs อัตโนมัติ (สำหรับ Docker Volume)
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// --- API Endpoints ---

// 1. ส่งชื่อและรหัสของคุณ (สิธินนท์ 6604101388)
app.get('/api/user', (req, res) => {
    res.json({
        name: "สิธินนท์",
        id: "6604101388"
    });
});

// 2. ข้อมูลระบบตามเอกสารหน้า 3 และบันทึก Log
app.get('/api/demo', (req, res) => {
    const logEntry = `[${new Date().toISOString()}] Access API Demo\n`;
    fs.appendFileSync(path.join(logsDir, 'access.log'), logEntry);

    res.json({
        git: { title: 'Advanced Git Workflow', detail: 'Branch Protection & PR' },
        docker: { title: 'Advanced Docker', detail: 'Multi-stage & Healthcheck' }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});