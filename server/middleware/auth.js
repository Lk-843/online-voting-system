// middleware/auth.js - JWT verification middleware
const jwt = require('jsonwebtoken');

// Verify any logged-in user
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Restrict to admin role only
const adminOnly = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role !== 'admin')
      return res.status(403).json({ error: 'Admin access required.' });
    next();
  });
};

module.exports = { authenticate, adminOnly };
