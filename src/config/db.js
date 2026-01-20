const { Pool } = require('pg');
require('dotenv').config();

// Parse DATABASE_URL to handle password properly
const parseConnectionString = (url) => {
  const parsed = new URL(url);
  return {
    user: parsed.username,
    password: parsed.password || undefined,
    host: parsed.hostname,
    port: parseInt(parsed.port) || 5432,
    database: parsed.pathname.split('/')[1],
  };
};

const config = process.env.DATABASE_URL ? parseConnectionString(process.env.DATABASE_URL) : {};
const pool = new Pool(config);

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Export pool for graceful shutdown
};
