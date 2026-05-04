const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const isGoogleConfigured = () =>
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here';

// Redirect to Google
router.get('/', (req, res, next) => {
  if (!isGoogleConfigured()) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    return res.redirect(`${frontendUrl}/auth?error=google_not_configured`);
  }
  const passport = require('passport');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google callback
router.get('/callback', (req, res, next) => {
  if (!isGoogleConfigured()) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    return res.redirect(`${frontendUrl}/auth?error=google_not_configured`);
  }
  const passport = require('passport');
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/auth?error=google_failed`,
  })(req, res, (err) => {
    if (err) return next(err);
    try {
      const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
      res.redirect(
        `${frontendUrl}/auth/callback?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}&id=${req.user.id}`
      );
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/auth?error=token_failed`);
    }
  });
});

module.exports = router;
