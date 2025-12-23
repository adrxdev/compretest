const db = require('../src/config/db');

const BASE_URL = 'http://localhost:3000';
const USER_EMAIL = 'student@test.com';

async function runTest() {
    try {
        console.log('--- STARTING MANUAL PHASE VERIFICATION ---');

        // Helper for fetch
        const post = async (url, body, headers = {}) => {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify(body)
            });
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                return { status: res.status, data };
            } catch (e) {
                console.error(`❌ JSON Parse Error on ${url} (${res.status}):`, text.substring(0, 200));
                throw new Error('Invalid JSON response');
            }
        };

        // 1. Get User ID
        const userRes = await db.query("SELECT id FROM users WHERE email = $1", [USER_EMAIL]);
        if (userRes.rows.length === 0) throw new Error('User not found');

        // Helper to get OTP
        const getOtp = async (email) => {
            await db.query("DELETE FROM otp_tokens WHERE email = $1", [email]);
            const res = await post(`${BASE_URL}/auth/request-otp`, { email });
            if (res.data.dev_otp) return res.data.dev_otp;
            throw new Error('Dev OTP not returned');
        };

        // 1. Get Student Token
        const studentOtp = await getOtp(USER_EMAIL);
        console.log(`Student OTP: ${studentOtp}`);

        const loginRes = await post(`${BASE_URL}/auth/verify-otp`, {
            email: USER_EMAIL,
            otp: studentOtp
        });
        const token = loginRes.data.token;
        if (!token) throw new Error('Student Login Failed: ' + JSON.stringify(loginRes.data));
        console.log('✅ Logged in as Student');

        // 2. Get Admin Token
        const adminOtp = await getOtp('admin@test.com');
        console.log(`Admin OTP: ${adminOtp}`);

        const adminLogin = await post(`${BASE_URL}/auth/verify-otp`, {
            email: 'admin@test.com',
            otp: adminOtp
        });
        console.log('Admin Login Response:', JSON.stringify(adminLogin.data));
        const adminToken = adminLogin.data.token;
        if (!adminToken) throw new Error('Admin Login Failed');

        const eventRes = await post(`${BASE_URL}/events`, {
            name: 'Phase Test Event',
            qr_refresh_interval: 10,
            entry_window_mins: 60,
            exit_window_mins: 60
        }, { Authorization: `Bearer ${adminToken}` });

        console.log('Create Event Response:', JSON.stringify(eventRes.data));
        const eventId = eventRes.data.id;
        console.log(`✅ Event Created: ID ${eventId} (Phase: CLOSED)`);

        // 3. Helper for Attendance Request
        const markAttendance = async (qrToken) => {
            const res = await post(`${BASE_URL}/attendance`, {
                event_id: eventId,
                token: qrToken
            }, {
                Authorization: `Bearer ${token}`,
                'User-Agent': 'TestDevice',
                'X-Platform': 'NodeJS',
                'X-Timezone': 'UTC'
            });
            return res.data; // expects { message: ... } or { error: ... }
        };

        // 4. Generate Valid QR Token (Backend helper)
        const qrToken = Math.floor(100000 + Math.random() * 900000).toString();
        await db.query("INSERT INTO qr_sessions (event_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')", [eventId, qrToken]);

        // TEST 1: Phase CLOSED -> Should Fail
        console.log(`\n[TEST 1] Scan while CLOSED (Token: ${qrToken})...`);
        const res1 = await markAttendance(qrToken);
        if (res1.error && res1.error.includes('CLOSED')) console.log('✅ PASS: Blocked (CLOSED)');
        else console.error('❌ FAIL: ', res1);

        // TEST 2: Open ENTRY -> Scan
        console.log('\n[TEST 2] Open ENTRY Phase...');
        await post(`${BASE_URL}/events/${eventId}/open-entry`, {}, { Authorization: `Bearer ${adminToken}` });

        const res2 = await markAttendance(qrToken);
        if (res2.message && res2.message.includes('Entry Recorded')) console.log('✅ PASS: Entry Recorded');
        else console.error('❌ FAIL: ', res2);

        // TEST 3: Scan Again (Entry) -> Should Fail
        console.log('\n[TEST 3] Duplicate Entry Scan...');
        const res3 = await markAttendance(qrToken);
        if (res3.error && res3.error.includes('Entry already recorded')) console.log('✅ PASS: Blocked Duplicate');
        else console.error('❌ FAIL: ', res3);

        // TEST 4: Open EXIT -> Scan
        console.log('\n[TEST 4] Open EXIT Phase...');
        await post(`${BASE_URL}/events/${eventId}/open-exit`, {}, { Authorization: `Bearer ${adminToken}` });

        const res4 = await markAttendance(qrToken);
        if (res4.message && res4.message.includes('Attendance Completed')) console.log('✅ PASS: Exit Recorded (Completed)');
        else console.error('❌ FAIL: ', res4);

        // TEST 5: Close -> Scan
        console.log('\n[TEST 5] Close Session...');
        await post(`${BASE_URL}/events/${eventId}/close-attendance`, {}, { Authorization: `Bearer ${adminToken}` });

        const res5 = await markAttendance(qrToken);
        if (res5.error && res5.error.includes('CLOSED')) console.log('✅ PASS: Blocked (CLOSED)');
        else console.error('❌ FAIL: ', res5);

        console.log('\n--- VERIFICATION COMPLETE ---');
        process.exit(0);

    } catch (e) {
        console.error('Test Failed:', e);
        process.exit(1);
    }
}

runTest();
