const db = require('../src/config/db');
const userModel = require('../src/models/user.model');
const eventModel = require('../src/models/event.model');
const qrModel = require('../src/models/qr.model');
const attendanceController = require('../src/controllers/attendance.controller');
const crypto = require('crypto');

// Mock Express Request/Response
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
        console.log('--- Starting Device Lock Verification ---');

        // 1. Setup Data
        const suffix = Math.floor(Math.random() * 10000); // Randomize to avoid collisions

        // Organizer
        const organizer = await userModel.createUser({
            name: `Test Org ${suffix}`,
            email: `org${suffix}@test.com`,
            enrollment_no: `ORG${suffix}`,
            branch: 'CSE',
            role: 'admin'
        });
        console.log('Created Organizer:', organizer.id);

        // Event
        const event = await eventModel.createEvent({
            name: `Device Lock Test Event ${suffix}`,
            venue: 'Lab 1',
            start_time: new Date(),
            end_time: new Date(Date.now() + 3600000),
            qr_refresh_interval: 10,
            created_by: organizer.id
        });
        console.log('Created Event:', event.id);

        // Students
        const studentA = await userModel.createUser({
            name: `Student A ${suffix}`,
            email: `studentA${suffix}@test.com`,
            enrollment_no: `A${suffix}`,
            branch: 'CSE',
            role: 'student'
        });
        const studentB = await userModel.createUser({
            name: `Student B ${suffix}`,
            email: `studentB${suffix}@test.com`,
            enrollment_no: `B${suffix}`,
            branch: 'CSE',
            role: 'student'
        });
        console.log('Created Students:', studentA.id, studentB.id);

        // QR Session
        const token = crypto.randomBytes(16).toString('hex');
        const session = await qrModel.createSession({
            event_id: event.id,
            token: token,
            expires_at: new Date(Date.now() + 3600000)
        });
        console.log('Created QR Session');

        // Device Headers
        const deviceXHeaders = {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
            'x-platform': 'iOS',
            'x-screen-resolution': '1170x2532',
            'x-timezone': 'Asia/Kolkata'
        };
        const deviceYHeaders = {
            'user-agent': 'Mozilla/5.0 (Linux; Android 12; Pixel 6)',
            'x-platform': 'Android',
            'x-screen-resolution': '1080x2400',
            'x-timezone': 'Asia/Kolkata'
        };

        // 2. Test Case 1: Student A scans with Device X (Success Expected)
        console.log('\nTest 1: Student A logs in with Device X...');
        const req1 = mockReq(
            { event_id: event.id, token: token },
            { id: studentA.id },
            deviceXHeaders
        );
        const res1 = mockRes();
        await attendanceController.logAttendance(req1, res1);

        if (res1.statusCode === 201) {
            console.log('✅ Success: Attendance marked.');
        } else {
            console.error('❌ Failed:', res1.data);
            process.exit(1);
        }

        // 3. Test Case 2: Student B scans with Device X (Failure Expected)
        console.log('\nTest 2: Student B logs in with SAME Device X...');
        const req2 = mockReq(
            { event_id: event.id, token: token },
            { id: studentB.id },
            deviceXHeaders // SAME HEADERS
        );
        const res2 = mockRes();
        await attendanceController.logAttendance(req2, res2);

        if (res2.statusCode === 409 && res2.data.error.includes('already marked from this device')) {
            console.log('✅ Success: Blocked as expected.');
        } else {
            console.error('❌ Failed: Should have been blocked. Status:', res2.statusCode, 'Data:', res2.data);
            process.exit(1);
        }

        // 4. Test Case 3: Student B scans with Device Y (Success Expected)
        console.log('\nTest 3: Student B logs in with DIFFERENT Device Y...');
        const req3 = mockReq(
            { event_id: event.id, token: token },
            { id: studentB.id },
            deviceYHeaders // DIFFERENT HEADERS
        );
        const res3 = mockRes();
        await attendanceController.logAttendance(req3, res3);

        if (res3.statusCode === 201) {
            console.log('✅ Success: Attendance marked.');
        } else {
            console.error('❌ Failed:', res3.data);
            process.exit(1);
        }

        console.log('\n🎉 ALL TESTS PASSED');
        process.exit(0);

    } catch (err) {
        console.error('Unexpected Error:', err);
        process.exit(1);
    }
};

runTest();
