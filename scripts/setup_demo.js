const db = require('../src/config/db');
const userModel = require('../src/models/user.model');
const eventModel = require('../src/models/event.model');
const qrModel = require('../src/models/qr.model');

const setup = async () => {
    try {
        console.log('--- Setting up Demo Environment ---');

        // 1. Ensure Student Exists
        let student = await db.query("SELECT * FROM users WHERE email = 'student@test.com'");
        if (student.rows.length === 0) {
            console.log('Creating student@test.com...');
            await userModel.createUser({
                name: 'Demo Student',
                email: 'student@test.com',
                enrollment_no: 'DEMO123',
                branch: 'CSE',
                role: 'student'
            });
        } else {
            // Ensure profile is complete
            if (!student.rows[0].enrollment_no) {
                await userModel.updateUser(student.rows[0].id, {
                    name: 'Demo Student',
                    enrollment_no: 'DEMO123',
                    branch: 'CSE'
                });
            }
        }
        console.log('✅ Student Ready: student@test.com (OTP: 123456)');

        // 2. Create Active Event
        const now = new Date();
        const event = await eventModel.createEvent({
            name: `Demo Session ${now.getHours()}:${now.getMinutes()}`,
            venue: 'Virtual Lab',
            start_time: now,
            end_time: new Date(now.getTime() + 60 * 60000), // 1 hour
            qr_refresh_interval: 10,
            created_by: 1, // Assume admin ID 1 exists
            entry_window_mins: 60, // Make it easy
            exit_window_mins: 60
        });
        console.log(`✅ Event Created: ID ${event.id}`);

        // 3. Generate Valid Token
        // Create a long-lived token for manual entry
        const manualToken = '111222';
        await qrModel.createSession({
            event_id: event.id,
            token: manualToken,
            expires_at: new Date(now.getTime() + 60 * 60000)
        });
        console.log(`✅ Valid Token Generated: ${manualToken}`);

        console.log('\n=============================================');
        console.log('   📋 DEMO CHEAT SHEET');
        console.log('=============================================');
        console.log('1. Login as Student:');
        console.log('   URL:   http://localhost:5173/student');
        console.log('   Email: student@test.com');
        console.log('   OTP:   123456');
        console.log('\n2. Go to "Manual Entry" and enter:');
        console.log(`   Event ID:  ${event.id}`);
        console.log(`   Token:     ${manualToken}`);
        console.log('\n3. OR Click this Magic Link:');
        console.log(`   http://localhost:5173/scan?event_id=${event.id}&token=${manualToken}`);
        console.log('=============================================\n');

        process.exit(0);
    } catch (e) {
        console.error('Setup failed:', e);
        process.exit(1);
    }
};

setup();
