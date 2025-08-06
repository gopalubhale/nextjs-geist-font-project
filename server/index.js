require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mysql = require('mysql2/promise');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'advertising_panel',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use timestamp + original name to avoid collisions
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Utility functions
async function generateUniqueLinkCode() {
  while (true) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const [rows] = await pool.query('SELECT id FROM links WHERE link_code = ?', [code]);
    if (rows.length === 0) {
      return code;
    }
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Routes

// Register customer
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!(name && email && password)) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login customer
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const [rows] = await pool.query('SELECT id, password_hash FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload media (images, videos, ppt)
app.post('/api/media/upload', authenticateToken, upload.array('files'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const groupId = req.body.groupId || null;

    const insertValues = files.map(file => [userId, file.mimetype.split('/')[0], file.filename, groupId]);
    await pool.query('INSERT INTO media (user_id, type, file_path, group_id) VALUES ?', [insertValues]);

    // Notify real-time update
    io.to(`user_${userId}`).emit('mediaUpdated', { groupId });

    res.json({ message: 'Files uploaded successfully' });
  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List media for logged-in customer
app.get('/api/media/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [rows] = await pool.query('SELECT * FROM media WHERE user_id = ?', [userId]);
    res.json({ media: rows });
  } catch (error) {
    console.error('Media list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate unique 4-digit link for a group
app.post('/api/link/generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId } = req.body;
    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }
    const code = await generateUniqueLinkCode();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days expiry
    await pool.query('INSERT INTO links (user_id, link_code, group_id, created_at, expires_at) VALUES (?, ?, ?, NOW(), ?)', [userId, code, groupId, expiresAt]);
    res.json({ link: `${process.env.DOMAIN || 'http://localhost:4000'}/${code}` });
  } catch (error) {
    console.error('Link generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get media content for link playback
app.get('/api/link/:code/content', async (req, res) => {
  try {
    const { code } = req.params;
    const [links] = await pool.query('SELECT * FROM links WHERE link_code = ? AND expires_at > NOW()', [code]);
    if (links.length === 0) {
      return res.status(404).json({ error: 'Link not found or expired' });
    }
    const link = links[0];
    const [media] = await pool.query('SELECT * FROM media WHERE group_id = ? AND user_id = ?', [link.group_id, link.user_id]);
    res.json({ media });
  } catch (error) {
    console.error('Link content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WebSocket connection for real-time updates and live preview
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join room for user updates
  socket.on('joinUserRoom', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
