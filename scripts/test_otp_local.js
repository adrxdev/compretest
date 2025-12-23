const nodemailer = require('nodemailer');
require('dotenv').config();

const testOtp = async () => {
    console.log("=== TESTING OTP LOGIC ===");
    console.log("Email User:", process.env.EMAIL_USER);
    console.log("Email Pass is Set:", !!process.env.EMAIL_PASS);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("⚠️  Missing Credentials! Defaulting to DEV MODE (Console Log).");
        console.log("This is EXPECTED if you don't have a real Gmail account connected.");
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        console.log("Attempting to send email...");
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test OTP',
            text: 'This is a test.'
        });
        console.log("✅ Email Sent Successfully!");
    } catch (error) {
        console.error("❌ Email Failed:", error.message);
        if (error.code === 'EAUTH') {
            console.error("Reason: Invalid Username or Password (or App Password expired).");
        }
    }
};

testOtp();
