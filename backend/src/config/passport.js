const passport = require('passport');

// Only initialize Google strategy if credentials are configured
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here'
) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  const { query } = require('../db/neon');

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const name = profile.displayName;
          const googleId = profile.id;

          let result = await query('SELECT * FROM users WHERE email = $1', [email]);

          if (result.rows.length === 0) {
            result = await query(
              `INSERT INTO users (name, email, password_hash, google_id)
               VALUES ($1, $2, $3, $4)
               RETURNING id, name, email`,
              [name, email, null, googleId]
            );
          } else if (!result.rows[0].google_id) {
            await query('UPDATE users SET google_id = $1 WHERE email = $2', [googleId, email]);
          }

          return done(null, result.rows[0]);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  console.log('✅ Google OAuth strategy initialized');
} else {
  console.log('⚠️  Google OAuth not configured — add GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET to .env');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const { query } = require('../db/neon');
    const result = await query('SELECT id, name, email FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
