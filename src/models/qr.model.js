const db = require('../config/db');

const createSession = async ({ event_id, token, expires_at }) => {
  const query = `
    INSERT INTO qr_sessions (event_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [event_id, token, expires_at];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const getLatestSession = async (event_id) => {
  const query = `
    SELECT * FROM qr_sessions
    WHERE event_id = $1
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const { rows } = await db.query(query, [event_id]);
  return rows[0];
};

const findValidSession = async (token) => {
  const query = `
    SELECT * FROM qr_sessions
    WHERE token = $1 AND expires_at > NOW();
  `;
  const { rows } = await db.query(query, [token]);
  return rows[0];
};

const verifyToken = async (event_id, token) => {
  try {
    const query = `
          SELECT 1 FROM qr_sessions 
          WHERE token = $1 AND event_id = $2 AND expires_at > NOW()
          LIMIT 1;
      `;
    const { rowCount } = await db.query(query, [token, event_id]);
    return rowCount > 0;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false; // Fail safe
  }
};

const getSessionByToken = async (event_id, token) => {
  try {
    const query = 'SELECT * FROM qr_sessions WHERE event_id = $1 AND token = $2 LIMIT 1';
    const { rows } = await db.query(query, [event_id, token]);
    return rows[0];
  } catch (error) {
    return null;
  }
};

const cleanupOrphanedSessions = async () => {
  try {
    // Delete sessions where the linked event no longer exists
    // (This handles cases where ON DELETE CASCADE might have been missed or disabled)
    const query = `
      DELETE FROM qr_sessions 
      WHERE event_id NOT IN (SELECT id FROM events)
      RETURNING *;
    `;
    const { rowCount } = await db.query(query);
    if (rowCount > 0) {
      console.log(`[QR Model] 🧹 Cleaned up ${rowCount} orphaned QR sessions.`);
    }
    return rowCount;
  } catch (error) {
    console.error('[QR Model] Error cleaning up orphaned sessions:', error.message);
    return 0;
  }
};

module.exports = {
  createSession,
  getLatestSession,
  findValidSession,
  verifyToken,
  getSessionByToken,
  cleanupOrphanedSessions
};
