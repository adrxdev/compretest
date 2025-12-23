const db = require('../src/config/db');
const userModel = require('../src/models/user.model');
const eventModel = require('../src/models/event.model');
const qrModel = require('../src/models/qr.model');
const attendanceController = require('../src/controllers/attendance.controller');
const eventController = require('../src/controllers/event.controller');
const crypto = require('crypto');

// Mock Express Objects
const mockReq = (body, user, headers, params) => ({
    body,
    user,
    headers: headers || {},
    params: params || {}
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
        console.log('--- Starting Audit Alert Verification ---');
        const suffix = Math.floor(Math.random() * 10000);

        // 1. Setup
        const organizer = await userModel.createUser({
            name: `Audit Org ${suffix}`,
            email: `auditorg${suffix}@test.com`,
            enrollment_no: `AORG${suffix}`,
            branch: 'CSE',
            role: 'admin'
        });

        const event = await eventModel.createEvent({
            name: `Audit Test Event ${suffix}`,
            venue: 'Audit Hall',
            start_time: new Date(),
            end_time: new Date(Date.now() + 3600000),
            qr_refresh_interval: 10,
            created_by: organizer.id
        });
        console.log('Created Event:', event.id);

        const studentA = await userModel.createUser({
            name: `Audit Student ${suffix}`,
            email: `auditstu${suffix}@test.com`,
            enrollment_no: `ASTU${suffix}`,
            branch: 'CSE',
            role: 'student'
        });
        const studentB = await userModel.createUser({
            name: `Audit Student B ${suffix}`,
            email: `auditstuB${suffix}@test.com`,
            enrollment_no: `BSTU${suffix}`,
            branch: 'CSE',
            role: 'student'
        });

        const token = crypto.randomBytes(16).toString('hex');
        await qrModel.createSession({
            event_id: event.id,
            token: token,
            expires_at: new Date(Date.now() + 3600000)
        });

        const headers = {
            'user-agent': 'Mozilla/5.0 (Test Device)',
            'x-platform': 'TestOS',
            'x-screen-resolution': '1920x1080',
            'x-timezone': 'UTC'
        };

        // 2. Legitimate scan (Student A)
        await attendanceController.logAttendance(
            mockReq({ event_id: event.id, token: token }, { id: studentA.id }, headers),
            mockRes()
        );
        console.log('Student A scanned successfully.');

        // 3. BLOCKED scan (Student B, same device)
        console.log('Student B attempting scan with reused message...');
        const failRes = mockRes();
        await attendanceController.logAttendance(
            mockReq({ event_id: event.id, token: token }, { id: studentB.id }, headers),
            failRes
        );

        if (failRes.statusCode === 409) {
            console.log('✅ Blocked 409 received.');
        } else {
            console.error('❌ Failed: Expected 409, got', failRes.statusCode);
            process.exit(1);
        }

        // 4. Verify Audit Alert API
        console.log('Verifying Audit API...');
        const apiRes = mockRes();
        await eventController.getAuditAlerts(
            mockReq({}, {}, {}, { id: event.id }),
            apiRes
        );

        const alerts = apiRes.data;
        console.log('Alerts retrieved:', alerts);

        if (alerts.length > 0 && alerts[0].type === 'BLOCKED_PROXY') {
            console.log('✅ Audit Alert Found!');
        } else {
            console.error('❌ Audit Alert NOT found.');
            process.exit(1);
        }

        console.log('\n🎉 AUDIT VERIFICATION PASSED');
        process.exit(0);

    } catch (err) {
        console.error('Unexpected Error:', err);
        process.exit(1);
    }
};

runTest();
