const db = require('../src/config/db');

const migrate = async () => {
    try {
        console.log('Migrating events table...');

        await db.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS entry_window_mins INTEGER DEFAULT 15,
            ADD COLUMN IF NOT EXISTS exit_window_mins INTEGER DEFAULT 15;
        `);

        console.log('✅ Events table updated.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    }
};

migrate();
