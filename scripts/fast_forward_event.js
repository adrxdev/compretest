const db = require('../src/config/db');

const eventId = process.argv[2];

if (!eventId) {
    console.error('Usage: node scripts/fast_forward_event.js <EVENT_ID>');
    process.exit(1);
}

const fastForward = async () => {
    try {
        console.log(`Fast-forwarding Event ${eventId}...`);

        // Set:
        // Start Time: 1 hour ago
        // End Time: 1 minute from NOW
        // This puts us nicely in the "End" phase

        const now = new Date();
        const newStart = new Date(now.getTime() - 60 * 60000); // Started 1 hr ago
        const newEnd = new Date(now.getTime() + 1 * 60000); // Ends in 1 min

        await db.query(`
            UPDATE events 
            SET start_time = $1, end_time = $2
            WHERE id = $3
        `, [newStart, newEnd, eventId]);

        console.log('✅ Event updated. Exit window is OPEN.');
        console.log('You have ~3 minutes (1 min until end + 2 min window) to scan.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Failed:', e);
        process.exit(1);
    }
};

fastForward();
