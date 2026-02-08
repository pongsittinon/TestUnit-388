const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// demo api
app.get('/api/demo', (req, res) => {
  const logMessage = `Request at ${new Date().toISOString()} : ${req.ip}\n`;

  fs.appendFile(
    path.join(logsDir, 'access.log'),
    logMessage,
    (err) => {
      if (err) {
        console.error('Log error:', err);
      }
    }
  );

  res.json({ message: 'demo ok' });
});

// error handling middleware (ตามโจทย์)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
