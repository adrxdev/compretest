const db = require('../src/config/db');

const migrate = async () => {
    try {
        console.log('Migrating events table for Manual Phase Control...');

        // Add attendance_phase column
        await db.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS attendance_phase VARCHAR(20) DEFAULT 'CLOSED';
        `);

        console.log('✅ Events table updated with attendance_phase.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    }
};

migrate();
