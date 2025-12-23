# QA Verification Guide: Smart Attendance System v1.0

Follow this guide to verify the system end-to-end on your local machine.

## Prerequisites
- **Frontend Running**: http://localhost:5173
- **Backend Running**: http://localhost:3000
- **Browser**: Chrome/Edge/Safari (use Incognito for student role if staying logged in as Admin)

---

## Step 1: Admin Setup
1.  **Login as Admin**
    - Email: `admin@test.com` (or any email containing 'admin')
    - OTP: Check backend terminal or network response (Dev Mode: `123456`)
2.  **Create Test Event**
    - Navigate to Dashboard.
    - **Name**: `QA Test Event`
    - **Refresh**: `10`
    - **Entry Window**: `2` (minutes)
    - **Exit Window**: `2` (minutes)
    - Click **Create Session**.
3.  **Open Projector View**
    - Click "Open Projector View" for the new event.
    - Observe the QR code rotating.
    - **Keep this tab open.** (Note the Event ID from URL, e.g., `/events/42`)

---

## Step 2: Student Entry Scan (Phase 1)
1.  **Open New Tab (Incognito recommended)**
    - Copy the QR Link logic: `http://localhost:5173/scan?event_id=EVENT_ID&token=TOKEN` (copy token from admin console or just use `manual` entry on dashboard).
    - **Easier**: Go to `http://localhost:5173/student`. Login as `student@test.com`. Select "Manual Entry". Enter Event ID and any random 6-digit token if testing manual, OR use the QR link if you can copy it.
2.  **Action**
    - Submit Attendance.
3.  **Verify**
    - **Frontend**: "Entry Recorded. Please scan again near the end."
    - **Admin Screen**: Student name appears with yellow `ENTRY ONLY` badge.

---

## Step 3: Invalid Exit Scan (Negative Test)
1.  **Action**
    - Immediately try to scan/submit again using the **SAME** browser/device.
2.  **Verify**
    - **Frontend**: "Error: Too early for exit scan."
    - **Admin Screen**: No change.

---

## Step 4: Device Lock Test (Security)
1.  **Action**
    - In the **SAME** browser, logout.
    - Login as a *different* student (e.g., `proxy@test.com`).
    - Try to scan/submit again.
2.  **Verify**
    - **Frontend**: "Error: Attendance already marked from this device".
    - **Admin Screen**: **Security Alert** appears at the bottom (e.g., `Proxy attempt blocked`).

---

## Step 5: Valid Exit Scan (Phase 2)
*Since the event defaults to 1 hour long, you shouldn't wait 58 minutes. Use the fast-forward script.*

1.  **Fast Forward Time**
    - Open a new terminal.
    - Run: `node scripts/fast_forward_event.js <EVENT_ID>`
    - This updates the event so it ends in 1 minute from now.
2.  **Action**
    - Switch back to `student@test.com` (logout proxy, login student).
    - Scan/Submit again.
3.  **Verify**
    - **Frontend**: "Attendance Completed."
    - **Admin Screen**: Status updates to green `COMPLETED` badge.

---

## Step 6: Verify Data
1.  **CSV Export**
    - On Admin View, click "Export CSV".
    - Verify the file contains `COMPLETED` status.
