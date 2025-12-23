const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function resetEvents() {
    const client = await pool.connect();

    try {
        console.log('🗑️  Starting event reset process...');

        await client.query('BEGIN');

        // Delete all attendance logs first (foreign key constraint)
        const attendanceResult = await client.query('DELETE FROM attendance_logs');
        console.log(`✅ Deleted ${attendanceResult.rowCount} attendance logs`);

        // Delete all events
        const eventsResult = await client.query('DELETE FROM events');
        console.log(`✅ Deleted ${eventsResult.rowCount} events`);

        // Reset the sequence to start from 1
        await client.query('ALTER SEQUENCE events_id_seq RESTART WITH 1');
        console.log('✅ Reset event ID sequence to start from 1');

        await client.query('COMMIT');

        console.log('🎉 Event reset completed successfully!');
        console.log('📝 Next event created will have ID: 1');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error resetting events:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

resetEvents()
    .then(() => {
        console.log('\n✨ All done! Database is clean and ready.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n💥 Failed to reset events:', err);
        process.exit(1);
    });
