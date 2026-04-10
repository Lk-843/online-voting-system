// routes/votes.js - Voting and results
const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// POST /api/votes - cast a vote
router.post('/', authenticate, async (req, res) => {
  const { election_id, candidate_id } = req.body;
  if (!election_id || !candidate_id)
    return res.status(400).json({ error: 'Election and candidate are required.' });

  try {
    // Check election is active
    const [[election]] = await db.query(
      "SELECT * FROM elections WHERE id = ? AND status = 'active'",
      [election_id]
    );
    if (!election) return res.status(400).json({ error: 'Election is not active.' });

    // Check candidate belongs to this election
    const [[candidate]] = await db.query(
      'SELECT id FROM candidates WHERE id = ? AND election_id = ?',
      [candidate_id, election_id]
    );
    if (!candidate) return res.status(400).json({ error: 'Invalid candidate.' });

    // Insert vote (UNIQUE constraint prevents duplicates)
    await db.query(
      'INSERT INTO votes (user_id, election_id, candidate_id) VALUES (?, ?, ?)',
      [req.user.id, election_id, candidate_id]
    );
    res.status(201).json({ message: 'Vote cast successfully!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'You have already voted in this election.' });
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/votes/results/:electionId - get vote results
router.get('/results/:electionId', authenticate, async (req, res) => {
  try {
    // Check if results are published (admins can always see)
    const [[election]] = await db.query('SELECT results_published FROM elections WHERE id = ?', [req.params.electionId]);
    if (!election) return res.status(404).json({ error: 'Election not found.' });
    if (!election.results_published && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Results have not been published yet.' });

    const [results] = await db.query(
      `SELECT c.id, c.name, c.party, COUNT(v.id) AS vote_count
       FROM candidates c
       LEFT JOIN votes v ON v.candidate_id = c.id
       WHERE c.election_id = ?
       GROUP BY c.id ORDER BY vote_count DESC`,
      [req.params.electionId]
    );
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM votes WHERE election_id = ?',
      [req.params.electionId]
    );
    res.json({ results, total });
  } catch { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;
