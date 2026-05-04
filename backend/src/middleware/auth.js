const jwt = require('jsonwebtoken');
const { query } = require('../db/neon');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // Accept token from Authorization header OR query param (for iframe PDF preview)
    const token = (authHeader && authHeader.startsWith('Bearer '))
      ? authHeader.split(' ')[1]
      : req.query.token;

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB
    const result = await query('SELECT id, name, email FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = { authenticate };
