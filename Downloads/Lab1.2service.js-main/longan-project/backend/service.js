const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // เรียกใช้งาน config จาก .env

const app = express();
const PORT = process.env.PORT || 3000; // กำหนด Port 3000 ตามมาตรฐานบทเรียน

// --- Middleware ---
app.use(cors()); // อนุญาตให้ Frontend เข้าถึง API ได้
app.use(express.json());
app.use(express.static(__dirname)); // ส่งไฟล์ HTML (longan_map.html) ออกไปแสดงผล

// สร้างโฟลเดอร์ logs อัตโนมัติสำหรับเก็บข้อมูล log
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// --- API Endpoints ---

// 1. Endpoint ข้อมูลผู้พัฒนา (แก้ไขเป็นชื่อและรหัสของคุณแล้ว)
app.get('/api/user', (req, res) => {
    res.json({
        name: "สิธินนท์",
        id: "6604101388"
    });
});

// 2. Endpoint ข้อมูล Demo และการบันทึก Log ตามเอกสาร
app.get('/api/demo', (req, res) => {
    // บันทึก Request ลงใน logs/access.log
    const logMessage = `Request at ${new Date().toISOString()}: ${req.ip}\n`;
    fs.appendFileSync(path.join(logsDir, 'access.log'), logMessage);

    res.json({
        git: {
            title: 'Advanced Git Workflow',
            detail: 'ใช้ branch protection บน GitHub และ code review ใน PR'
        },
        docker: {
            title: 'Advanced Docker',
            detail: 'ใช้ multi-stage build, healthcheck และ Docker Compose'
        }
    });
});

// จัดการ Error พื้นฐาน
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); // แจ้งสถานะการรัน server
});