const db = require('../src/config/db');
require('dotenv').config();

const BASE_URL = 'http://127.0.0.1:3000';
const STUDENT_EMAIL = 'student@test.com';
const ADMIN_EMAIL = 'admin@test.com';

// Helper for requests
async function request(method, url, data, token) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const config = { method, headers };
        if (data) config.body = JSON.stringify(data);

        const res = await fetch(url, config);
        const json = await res.json();
        return { data: json, status: res.status };
    } catch (error) {
        return { error: error.message };
    }
}

async function runTest() {
    console.log('--- STARTING PROFILE VERIFICATION ---');
    try {
        // Helper to get OTP and Login
        const login = async (email) => {
            await db.query("DELETE FROM otp_tokens WHERE email = $1", [email]);
            const otpRes = await request('POST', `${BASE_URL}/auth/request-otp`, { email });
            if (!otpRes.data || !otpRes.data.dev_otp) throw new Error(`OTP Request Failed for ${email}`);

            const loginRes = await request('POST', `${BASE_URL}/auth/verify-otp`, { email, otp: otpRes.data.dev_otp });
            if (!loginRes.data.token) throw new Error(`Login Failed for ${email}`);
            return loginRes.data.token;
        };

        // 1. TEST STUDENT PROFILE
        console.log('\n[TEST 1] Student Profile Update...');
        const studentToken = await login(STUDENT_EMAIL);
        console.log('✅ Student Logged In');

        // Get Profile
        let p1 = await request('GET', `${BASE_URL}/users/profile`, null, studentToken);
        console.log('Current Profile:', p1.data.name, p1.data.enrollment_no);

        // Update Profile
        const newName = `Student ${Math.floor(Math.random() * 1000)}`;
        const newEnroll = `ENR${Math.floor(Math.random() * 10000)}`;
        console.log(`Updating to: ${newName}, ${newEnroll}`);

        const u1 = await request('PUT', `${BASE_URL}/users/profile`, { name: newName, enrollment_no: newEnroll }, studentToken);
        if (u1.status === 200 && u1.data.user.name === newName) console.log('✅ PASS: Profile Updated');
        else console.error('❌ FAIL: Update Failed', u1);

        // Verify Persistence
        const p2 = await request('GET', `${BASE_URL}/users/profile`, null, studentToken);
        if (p2.data.enrollment_no === newEnroll) console.log('✅ PASS: Changes Persisted');
        else console.error('❌ FAIL: Persistence Check Failed', p2.data);


        // 2. TEST ADMIN PROFILE
        console.log('\n[TEST 2] Admin Profile Update...');
        const adminToken = await login(ADMIN_EMAIL);
        console.log('✅ Admin Logged In');

        // Update Profile (Admin might not have enrollment, but let's see if it allows updating name)
        const adminName = `Admin ${Math.floor(Math.random() * 1000)}`;
        const u2 = await request('PUT', `${BASE_URL}/users/profile`, { name: adminName, enrollment_no: 'ADMIN_001' }, adminToken);

        if (u2.status === 200 && u2.data.user.name === adminName) console.log('✅ PASS: Admin Profile Updated');
        else console.error('❌ FAIL: Admin Update Failed', u2);

    } catch (err) {
        console.error('CRITICAL ERROR:', err);
    } finally {
        console.log('\n--- VERIFICATION COMPLETE ---');
    }
}

runTest();
