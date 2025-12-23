const db = require('../src/config/db');

const migrate = async () => {
    try {
        console.log('Migrating events table for Session Control...');

        // Add session_state column
        await db.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS session_state VARCHAR(20) DEFAULT 'NOT_STARTED';
        `);

        console.log('✅ Events table updated with session_state.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    }
};

migrate();
