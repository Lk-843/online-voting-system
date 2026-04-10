// routes/candidates.js - Candidate management (admin only)
const router = require('express').Router();
const db = require('../db');
const { adminOnly } = require('../middleware/auth');

// POST /api/candidates - add candidate to an election
router.post('/', adminOnly, async (req, res) => {
  const { election_id, name, party, bio } = req.body;
  if (!election_id || !name)
    return res.status(400).json({ error: 'Election ID and candidate name are required.' });

  try {
    const [result] = await db.query(
      'INSERT INTO candidates (election_id, name, party, bio) VALUES (?, ?, ?, ?)',
      [election_id, name, party, bio]
    );
    res.status(201).json({ message: 'Candidate added.', id: result.insertId });
  } catch { res.status(500).json({ error: 'Server error.' }); }
});

// DELETE /api/candidates/:id
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM candidates WHERE id = ?', [req.params.id]);
    res.json({ message: 'Candidate removed.' });
  } catch { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;
