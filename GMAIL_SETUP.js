#!/usr/bin/env node
/**
 * Gmail Email Configuration Setup Guide
 * 
 * This script helps you configure Gmail for sending verification emails
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════════════╗
║          Gmail Email Configuration Setup Guide                 ║
╚════════════════════════════════════════════════════════════════╝

📧 STEP 1: Generate Gmail App Password
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: https://myaccount.google.com/apppasswords
2. You may need to enable 2-Step Verification first
3. Select:
   - App: Mail
   - Device: Windows Computer (or your device)
4. Google will generate a 16-character password
5. Copy this password (you'll need it in the next step)

⚙️  STEP 2: Update .env File
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open: .env

Replace:
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASS=your-app-password

With your actual values:
  EMAIL_USER=myemail@gmail.com
  EMAIL_PASS=abcd efgh ijkl mnop    (the 16-character password from Step 1)

🧪 STEP 3: Test Email Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run the test script:
  node scripts/test_otp_local.js

✅ STEP 4: Start the Application
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

npm run dev

Then try to request an OTP from the login page. An email should be sent
to the user's email address with the verification code.

📝 NOTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Google App Password: Generated for 2FA-enabled accounts
  - More secure than your actual Gmail password
  - Only works for this application
  
• Development Mode: OTP is also shown in browser alert for testing
  
• Gmail Rate Limit: You can request a new OTP every 1 minute

• If emails fail: Check console logs for error messages

💡 TROUBLESHOOTING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Error: "Invalid login credentials"
  → Check that EMAIL_PASS is exactly 16 characters with spaces
  → Verify 2-Step Verification is enabled on your Google account

Error: "Allow less secure apps"
  → You need to use an App Password, not your Gmail password
  → Go to: https://myaccount.google.com/apppasswords

Email not received:
  → Check the server console for the OTP (shown in logs)
  → Check spam/junk folder
  → Wait 1 minute before requesting another OTP

`);
