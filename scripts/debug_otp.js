const db = require('../src/config/db');
require('dotenv').config();

async function testOtpParams() {
    console.log('Testing DB Connection...');
    try {
        const time = await db.query('SELECT NOW()');
        console.log('DB Connected:', time.rows[0]);

        console.log('Attempting to insert OTP...');
        const email = 'debug@test.com';
        const otpHash = 'debug_hash';
        const expiresAt = new Date(Date.now() + 500000);
        const devOtp = '123456';

        const query = `
            INSERT INTO otp_tokens (email, otp_hash, expires_at, dev_otp)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;

        const { rows } = await db.query(query, [email, otpHash, expiresAt, devOtp]);
        console.log('✅ Success! Inserted:', rows[0]);

        console.log('Cleaning up...');
        await db.query('DELETE FROM otp_tokens WHERE email = $1', [email]);
        console.log('Cleanup done.');
        process.exit(0);

    } catch (err) {
        console.error('❌ FAILED:', err);
        process.exit(1);
    }
}

testOtpParams();
