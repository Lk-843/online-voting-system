// server.js - Express application entry point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'))); // serve frontend

// API Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/elections', require('./routes/elections'));
// app.use('/api/candidates', require('./routes/candidates'));
// app.use('/api/votes', require('./routes/votes'));

// Admin - get all voters
const { adminOnly } = require('./middleware/auth');
// const db = require('./db');
// app.get('/api/users', adminOnly, async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       `SELECT u.id, u.name, u.email, u.role, u.created_at,
//         (SELECT COUNT(*) FROM votes v WHERE v.user_id = u.id) AS total_votes
//        FROM users u ORDER BY u.created_at DESC`
//     );
//     res.json(rows);
//   } catch { res.status(500).json({ error: 'Server error.' }); }
// });

// Serve frontend pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/dashboard.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../public/admin.html')));
app.get('/results', (req, res) => res.sendFile(path.join(__dirname, '../public/results.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
