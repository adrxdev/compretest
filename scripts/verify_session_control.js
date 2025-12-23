const db = require('../src/config/db');
require('dotenv').config();

const BASE_URL = 'http://127.0.0.1:3000';
const USER_EMAIL = 'student@test.com';
const ADMIN_EMAIL = 'admin@test.com';

// Helper for requests
async function post(url, data, config = {}) {
    try {
        const headers = { 'Content-Type': 'application/json', ...(config.headers || {}) };
        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        const json = await res.json();
        return { data: json, status: res.status };
    } catch (error) {
        return { error: error.message };
    }
}

async function runTest() {
    console.log('--- STARTING SESSION CONTROL VERIFICATION ---');

    try {
        // await db.connect(); // Pool handles connection

        // Helper to get OTP (dev mode)
        const getOtp = async (email) => {
            await db.query("DELETE FROM otp_tokens WHERE email = $1", [email]);
            const res = await post(`${BASE_URL}/auth/request-otp`, { email });
            if (res.error) throw new Error(`Request OTP Failed: ${res.error}`);
            if (res.data && res.data.dev_otp) return res.data.dev_otp;
            throw new Error(`Dev OTP not returned: ${JSON.stringify(res)}`);
        };

        // 1. LOGIN ADMIN
        const adminOtp = await getOtp(ADMIN_EMAIL);
        const adminLogin = await post(`${BASE_URL}/auth/verify-otp`, { email: ADMIN_EMAIL, otp: adminOtp });
        const adminToken = adminLogin.data.token;
        if (!adminToken) throw new Error('Admin Login Failed');
        console.log('✅ Admin Logged In');

        // 2. LOGIN STUDENT
        const studentOtp = await getOtp(USER_EMAIL);
        const studentLogin = await post(`${BASE_URL}/auth/verify-otp`, { email: USER_EMAIL, otp: studentOtp });
        const token = studentLogin.data.token;
        if (!token) throw new Error('Student Login Failed');
        console.log('✅ Student Logged In');

        // 3. CREATE EVENT
        const eventRes = await post(`${BASE_URL}/events`, {
            name: 'Session Control Test',
            qr_refresh_interval: 10
        }, { headers: { Authorization: `Bearer ${adminToken}` } });

        const eventId = eventRes.data.id;
        console.log(`✅ Event Created: ID ${eventId} (State: ${eventRes.data.session_state || 'NOT_STARTED'})`);

        // Helper to mark attendance
        const markAttendance = async (qrToken) => {
            return await post(`${BASE_URL}/attendance`, {
                event_id: eventId,
                token: qrToken
            }, { headers: { Authorization: `Bearer ${token}` } });
        };

        // 4. Generate Valid QR Token
        const qrToken = Math.floor(100000 + Math.random() * 900000).toString();
        await db.query("INSERT INTO qr_sessions (event_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')", [eventId, qrToken]);

        // TEST 1: Scan while NOT_STARTED
        console.log(`\n[TEST 1] Scan while NOT_STARTED...`);
        const res1 = await markAttendance(qrToken);
        if (res1.data && res1.data.error && res1.data.error.includes('not open')) console.log('✅ PASS: Blocked');
        else console.error('❌ FAIL: ', res1.data || res1);

        // TEST 2: Start Session -> Scan
        console.log(`\n[TEST 2] Start Session & Scan...`);
        await post(`${BASE_URL}/events/${eventId}/start-session`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
        const res2 = await markAttendance(qrToken);
        if (res2.data && res2.data.message === 'Attendance Marked Successfully') console.log('✅ PASS: Attendance Recorded');
        else console.error('❌ FAIL: ', res2.data || res2);

        // TEST 3: Duplicate Scan -> Fail
        console.log(`\n[TEST 3] Duplicate Scan...`);
        const res3 = await markAttendance(qrToken);
        if (res3.data && res3.data.error && res3.data.error.includes('already marked')) console.log('✅ PASS: Rejected Duplicate');
        else console.error('❌ FAIL: ', res3.data || res3);

        // TEST 4: Pause Session -> Scan (Use new user or assume blocked regardless?)
        // The controller checks session state FIRST (Step 3) before existing log (Step 4)?
        // My code: Step 3 Check Session State -> Step 4 Check Existing.
        // So even if I attended, if paused, it should say "Attendance not open".
        console.log(`\n[TEST 4] Pause Session...`);
        await post(`${BASE_URL}/events/${eventId}/pause-session`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
        const res4 = await markAttendance(qrToken); // Using same user, should block on STATE, not Duplicate
        if (res4.data && res4.data.error && res4.data.error.includes('not open')) console.log('✅ PASS: Blocked (Paused)');
        else console.error('❌ FAIL: ', res4.data || res4);

        // TEST 5: Stop Session
        console.log(`\n[TEST 5] Stop Session...`);
        await post(`${BASE_URL}/events/${eventId}/stop-session`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
        const res5 = await markAttendance(qrToken);
        if (res5.data && res5.data.error && res5.data.error.includes('not open')) console.log('✅ PASS: Blocked (Stopped)');
        else console.error('❌ FAIL: ', res5.data || res5);

    } catch (err) {
        console.error('CRITICAL ERROR:', err);
    } finally {
        // await db.end();
        console.log('\n--- VERIFICATION COMPLETE ---');
    }
}

runTest();
