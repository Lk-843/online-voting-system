// routes/elections.js - Election management
const router = require('express').Router();
const db = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');

// Auto-close elections whose end_date has passed - runs every 60 seconds
async function autoCloseElections() {
  try {
    await db.query("UPDATE elections SET status='closed' WHERE status='active' AND end_date < NOW()");
  } catch (err) { console.error('Auto-close error:', err.message); }
}
setInterval(autoCloseElections, 60 * 1000);
autoCloseElections();

// GET /api/elections - list all elections
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, u.name AS created_by_name,
        (SELECT COUNT(*) FROM votes v WHERE v.election_id = e.id) AS total_votes
       FROM elections e LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.created_at DESC`
    );
    res.json(rows);
  } catch { res.status(500).json({ error: 'Server error.' }); }
});

// GET /api/elections/:id - single election with candidates
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [[election]] = await db.query('SELECT * FROM elections WHERE id = ?', [req.params.id]);
    if (!election) return res.status(404).json({ error: 'Election not found.' });

    const [candidates] = await db.query(
      `SELECT c.*, COUNT(v.id) AS vote_count
       FROM candidates c LEFT JOIN votes v ON v.candidate_id = c.id
       WHERE c.election_id = ? GROUP BY c.id ORDER BY vote_count DESC`,
      [req.params.id]
    );

    const [voted] = await db.query(
      'SELECT candidate_id FROM votes WHERE user_id = ? AND election_id = ?',
      [req.user.id, req.params.id]
    );

    res.json({ ...election, candidates, hasVoted: voted.length > 0, votedFor: voted[0]?.candidate_id || null });
  } catch { res.status(500).json({ error: 'Server error.' }); }
});

// POST /api/elections - create election (admin only)
router.post('/', adminOnly, async (req, res) => {
  const { title, description, start_date, end_date } = req.body;
  if (!title || !start_date || !end_date)
    return res.status(400).json({ error: 'Title, start date, and end date are required.' });

  try {
    const electionStatus = req.body.status || 'upcoming';
    const [result] = await db.query(
      'INSERT INTO elections (title, description, start_date, end_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, start_date, end_date, electionStatus, req.user.id]
    );
    res.status(201).json({ message: 'Election created.', id: result.insertId });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error.' }); }
});

// PUT /api/elections/:id - update status or publish results (admin only)
router.put('/:id', adminOnly, async (req, res) => {
  const { status, results_published } = req.body;
  try {
    if (results_published !== undefined) {
      await db.query('UPDATE elections SET results_published=? WHERE id=?', [results_published, req.params.id]);
      return res.json({ message: results_published ? 'Results published.' : 'Results unpublished.' });
    }
    if (!status) return res.status(400).json({ error: 'Status is required.' });
    await db.query('UPDATE elections SET status=? WHERE id=?', [status, req.params.id]);
    res.json({ message: 'Election updated.' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error.' }); }
});

// DELETE /api/elections/:id (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM elections WHERE id = ?', [req.params.id]);
    res.json({ message: 'Election deleted.' });
  } catch { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;
