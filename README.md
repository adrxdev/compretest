# Smart Attendance & Placement Portal

A comprehensive digital solution for university placement cells to manage attendance, assessments, and seat allocations efficiently.

## Problem Statement

University placement processes often suffer from significant inefficiencies:
*   **Manual Attendance**: Passing physical sheets is time-consuming and prone to loss.
*   **Proxy Attendance**: Students signing for absent peers compromises data integrity.
*   **Poor Visibility**: Administrators lack real-time data on student participation.
*   **Manual Shortlisting**: Filtering eligible students for drives is tedious and error-prone.
*   **Allocation Chaos**: Manually assigning labs and seats for assessments is logistically complex.

## Solution Overview

This portal digitizes the entire placement workflow. It enables administrators to create live sessions, projects dynamic QR codes for secure attendance, and manages the end-to-end flow of assessments from eligibility to seat allocation. Designed for scalability, it handles high-concurrency scans and provides role-based dashboards for clear visibility.

## Key Features

### Admin Features
*   **Session Management**: Create, start, pause, and stop attendance events.
*   **Real-time Monitoring**: View live attendance counts and student lists as they scan.
*   **Assessment Control**: Create assessments, manage eligibility, and upload candidate lists via CSV.
*   **Automated Allocation**: One-click shuffling and seat allocation for lab exams to prevent dishonesty.
*   **Data Export**: Download attendance and allocation reports in CSV/PDF formats.

### Student Features
*   **Secure Dashboard**: View profile status and upcoming drives.
*   **QR Scanner**: Integrated scanner with deep-linking support for quick attendance marking.
*   **History & Logs**: Access personal attendance history and verify participation.
*   **Seat Allocation**: View assigned lab and seat number immediately upon allocation.

### Projector View Features
*   **Dynamic QR Code**: Rotating logic (every 10s) to prevent static photo-based proxy attendance.
*   **Live Counter**: Displays total present count in real-time to motivate punctuality.
*   **Status Indicators**: Visual cues for session state (Active/Paused/Stopped).

## Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

### Database
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

### Authentication
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### Hosting & Deployment
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

*   **Frontend**: React for component-based UI, Vite for ultra-fast build times.
*   **Backend**: Node.js & Express for scalable, non-blocking API handling.
*   **Database**: PostgreSQL for robust relational data integrity.
*   **Auth**: JWT for secure, stateless session management.
*   **Deployment**: Vercel (Client) & Railway (Server) for reliable CI/CD pipelines.

## System Architecture

The application checks for robustness and integrity using a monolithic architecture with separated concerns:

*   **Frontend**: React.js (Vite) for a responsive and interactive user interface.
*   **Backend**: Node.js with Express.js REST API for business logic.
*   **Database**: PostgreSQL for relational data integrity (User, Events, Attendance, Assessments).
*   **Deployment**: 
    *   Frontend hosted on **Vercel** for global edge delivery.
    *   Backend and Database hosted on **Railway** for reliable containerization and managed SQL.

## Authentication & Authorization

*   **OTP-Based Login**: Passwordless entry using email and one-time passwords via Nodemailer.
*   **Session Security**: JWT (JSON Web Tokens) used for stateless authentication.
*   **Role-Based Access Control (RBAC)**: Strict separation between `admin` and `student` routes. Middleware verifies roles before granting access to sensitive endpoints.

## Attendance Workflow

1.  **Creation**: Admin creates an event (e.g., "TCS Pre-placement Talk").
2.  **Projection**: Admin launches the "Projector View". A unique, rotating QR code appears.
3.  **Scanning**: Students scan the code using the portal's built-in scanner.
4.  **Verification**: The backend validates the token, user location (optional), and prevents duplicate entries.
5.  **Confirmation**: Success message appears on the student's device; Admin counter increments instantly.

## Assessment & Allocation Workflow

1.  **Setup**: Admin defines an assessment (e.g., "Coding Round 1").
2.  **Shortlisting**: Admin uploads a CSV of eligible enrollment numbers.
3.  **Lab Setup**: Admin defines available labs and capacity (e.g., "Lab A: 60 seats").
4.  **Allocation**: The system randomly assigns eligible students to available seats, ensuring no two adjacent students have the same set if applicable (future scope).
5.  **Publication**: Admin publishes the allocation. Students see their specific Lab and System Number on their dashboard.



## Environment Setup (Local)

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL installed locally or a remote connection string.

### Backend Setup
1.  Navigate to root directory.
2.  Install dependencies: `npm install`
3.  Create `.env` file:
    ```
    PORT=5000
    DATABASE_URL=postgresql://user:pass@localhost:5432/smart_attendance
    JWT_SECRET=your_secure_secret
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    ```
4.  Initialize Database: `npm run migrate` (or run `database/init.sql`).
5.  Start Server: `npm run dev`

### Frontend Setup
1.  Navigate to `client/` directory.
2.  Install dependencies: `npm install`
3.  Start Dev Server: `npm run dev`

## Deployment

### Frontend (Vercel)
*   Connect GitHub repository.
*   Set Root Directory to `client`.
*   Build Command: `npm run build`
*   Output Directory: `dist`
*   Add environment variable: `VITE_API_URL` pointing to the backend production URL.

### Backend (Railway)
*   Connect GitHub repository.
*   Add generic service.
*   Set Start Command: `node src/index.js` (or `npm start`).
*   Add PostgreSQL plugin.
*   Railway automatically injects `DATABASE_URL`.
*   Set other variables (`JWT_SECRET`, `EMAIL_USER`, etc.) in Railway dashboard.

## Security Considerations

*   **Role Enforcement**: API endpoints explicitly check `req.user.role`.
*   **Duplicate Prevention**: Database constraints prevent multiple attendance records for the same event.
*   **Input Validation**: Inputs are sanitized to prevent SQL injection (via parameterized queries).
*   **Cors Policy**: Restricted to allowed domains in production.

## Limitations & Future Improvements

*   **Current Limitation**: The QR rotation relies on client-server time synchronization. Significant drift may cause token invalidation.
*   **Current Limitation**: Manual CSV upload is required for shortlisting; direct integration with university ERP is not yet implemented.
*   **Future**: Implementation of WebSockets for sub-second attendance updates (currently polling).
*   **Future**: Geofencing support to restrict scanning to specific physical coordinates.

## Screens / Flow Overview

*   **Admin Flow**: Login -> Dashboard (Overview) -> Create Event -> Launch Projector View -> Monitor.
*   **Student Flow**: Login (OTP) -> Dashboard (Status) -> Scan QR -> innovative Success/Failure Feedback -> View History.
*   **Projector Flow**: Large, high-contrast display purely for QR projection and live stats, designed for readability from a distance.

## Author

Developed by **Pranav** for University Placement Cell automation architecture.
