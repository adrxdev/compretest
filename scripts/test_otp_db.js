const otpModel = require('../src/models/otp.model');
require('dotenv').config();
const db = require('../src/config/db');

const testDbOtp = async () => {
    try {
        console.log("Testing DB OTP Insertion...");
        const email = "test_db_otp@example.com";
        const otp = "123456";
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10m

        const savedOtp = await otpModel.saveOtp(email, otp, expiresAt);
        console.log("✅ OTP Saved with ID:", savedOtp.id);

        const latest = await otpModel.getLatestOtp(email);
        console.log("✅ Retrieved Latest OTP:", latest.otp_hash);

        // Cleanup
        await otpModel.deleteOtps(email);
        console.log("✅ Cleanup Successful");
        process.exit(0);
    } catch (e) {
        console.error("❌ DB OTP Test Failed:", e);
        process.exit(1);
    }
};

testDbOtp();
