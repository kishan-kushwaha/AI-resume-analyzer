require('dotenv').config();
const { query } = require('./src/db/neon');

async function migrate() {
  try {
    // Add google_id column if it doesn't exist
    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
      ALTER COLUMN password_hash DROP NOT NULL;
    `);
    console.log('✅ Migration done: google_id column added, password_hash made optional');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
}

migrate();
