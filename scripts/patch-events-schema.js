const { Pool } = require('pg');
require('dotenv').config();

console.log('🚀 Starting Schema Patch: Syncing "events" table schema...');

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is missing from environment variables.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

const COLUMNS_TO_ADD = [
    { name: 'name', type: 'TEXT' },
    { name: 'entry_window_mins', type: 'INTEGER DEFAULT 15' },
    { name: 'exit_window_mins', type: 'INTEGER DEFAULT 15' },
    { name: 'attendance_phase', type: "VARCHAR(20) DEFAULT 'CLOSED'" },
    { name: 'session_state', type: "VARCHAR(20) DEFAULT 'NOT_STARTED'" }
];

const patchSchema = async () => {
    const client = await pool.connect();
    try {
        console.log('✅ Connected to database.');

        for (const col of COLUMNS_TO_ADD) {
            // 1. Check if column exists
            const checkQuery = `
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='events' AND column_name='${col.name}';
            `;
            const checkRes = await client.query(checkQuery);

            if (checkRes.rows.length > 0) {
                console.log(`ℹ️  Column "${col.name}" already exists.`);
            } else {
                // 2. Add column if missing
                console.log(`⚠️  Column "${col.name}" is MISSING. Adding it now...`);
                await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`);
                console.log(`✅  SUCCESS: Column "${col.name}" added.`);
            }
        }

    } catch (err) {
        console.error('❌ FAILED to patch schema:', err);
    } finally {
        client.release();
        await pool.end();
        console.log('👋 Connection closed.');
    }
};

patchSchema();
