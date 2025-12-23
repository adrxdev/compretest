const db = require('../src/config/db');
const userModel = require('../src/models/user.model');
const eventModel = require('../src/models/event.model');
const qrModel = require('../src/models/qr.model');
const attendanceController = require('../src/controllers/attendance.controller');
const crypto = require('crypto');

// Mock Express Objects
const mockReq = (body, user, headers) => ({
    body,
    user,
    headers: headers || {}
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const runTest = async () => {
    try {
        console.log('--- Starting Entry/Exit Verification ---');
        const suffix = Math.floor(Math.random() * 10000);

        // 1. Setup Data
        const organizer = await userModel.createUser({
            name: `TimeKeeper ${suffix}`,
            email: `time${suffix}@test.com`,
            enrollment_no: `TK${suffix}`,
            branch: 'CSE',
            role: 'admin'
        });

        const student = await userModel.createUser({
            name: `Student Enex ${suffix}`,
            email: `enex${suffix}@test.com`,
            enrollment_no: `EX${suffix}`,
            branch: 'CSE',
            role: 'student'
        });

        // 2. Create Event: Entry Open NOW, Exit Closed (Far future)
        const now = new Date();
        const startTime = new Date(now.getTime() - 5 * 60000); // Started 5 mins ago
        const endTime = new Date(now.getTime() + 60 * 60000); // Ends in 1 hour
        const entryWindow = 15; // Open for 15 mins (so currently OPEN)
        const exitWindow = 10; // Open only last 10 mins (so currently CLOSED)

        const event = await eventModel.createEvent({
            name: `EnEx Test ${suffix}`,
            venue: 'Lab',
            start_time: startTime,
            end_time: endTime,
            qr_refresh_interval: 10,
            created_by: organizer.id,
            entry_window_mins: entryWindow,
            exit_window_mins: exitWindow
        });
        console.log('Created Event:', event.id);

        const token = crypto.randomBytes(16).toString('hex');
        await qrModel.createSession({
            event_id: event.id,
            token: token,
            expires_at: endTime
        });

        const headers = {
            'user-agent': 'Device Enex',
            'x-platform': 'TestOS',
            'x-screen-resolution': '1080p',
            'x-timezone': 'UTC'
        };

        // 3. Test ENTRY Scan (Should Succeed)
        console.log('\nTest 1: Entry Scan...');
        const req1 = mockReq({ event_id: event.id, token }, { id: student.id }, headers);
        const res1 = mockRes();
        await attendanceController.logAttendance(req1, res1);

        if (res1.statusCode === 201 && res1.data.log.status === 'ENTRY') {
            console.log('✅ Entry Success:', res1.data.message);
        } else {
            console.error('❌ Entry Failed:', res1.data);
            process.exit(1);
        }

        // 4. Test EARLY EXIT Scan (Should Fail)
        console.log('\nTest 2: Early Exit Scan (Same Device)...');
        const req2 = mockReq({ event_id: event.id, token }, { id: student.id }, headers);
        const res2 = mockRes();
        await attendanceController.logAttendance(req2, res2);

        if (res2.statusCode === 400 && res2.data.error.includes('Too early')) {
            console.log('✅ Early Exit Blocked:', res2.data.error);
        } else {
            console.error('❌ Early Exit Check Failed:', res2.statusCode, res2.data);
            process.exit(1);
        }

        // 5. Update Event Time to simulate END of event (Exit Window Open)
        console.log('\nSimulating Fast-Forward to Exit Window...');
        // Set end time to 5 mins from NOW, and exit window to 10 mins (so NOW is inside exit window)
        // New End Time = Now + 5m.
        // Exit Window Start = (Now + 5m) - 10m = Now - 5m.
        // So Now is definitely inside.

        const newEndTime = new Date(now.getTime() + 5 * 60000);
        await db.query('UPDATE events SET end_time = $1 WHERE id = $2', [newEndTime, event.id]);

        // 6. Test VALID EXIT Scan
        console.log('Test 3: Valid Exit Scan (Same Device)...');
        const req3 = mockReq({ event_id: event.id, token }, { id: student.id }, headers);
        const res3 = mockRes();
        // Since we are mocking controller access but controller re-fetches event from DB, it will see new times.
        await attendanceController.logAttendance(req3, res3);

        if (res3.statusCode === 200 && res3.data.log.status === 'COMPLETED') {
            console.log('✅ Exit Success:', res3.data.message);
        } else {
            console.error('❌ Exit Failed:', res3.statusCode, res3.data);
            process.exit(1);
        }

        console.log('\n🎉 ENTRY/EXIT TESTS PASSED');
        process.exit(0);

    } catch (err) {
        console.error('Unexpected Error:', err);
        process.exit(1);
    }
};

runTest();
