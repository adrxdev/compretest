

require('dotenv').config();

const BASE_URL = 'http://localhost:3000/api';

// Simulating a fresh login to get token (Skipping actual login for now, assuming dev env has no auth or we can use the one from browser? 
// Actually, I can't easily get the browser token.
// I'll rely on the existing seed which updated users.
// I'll create a quick script that acts as the frontend calling /drives.
// But wait, I need a valid token. 
// I'll just check the logic by reading the code, which I did.
// AND I will verify by running a small script that IMPORTs the controller/model? 
// No, improved plan: 
// I will create a test script that uses the MODELS directly to simulate the controller logic.

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verify() {
    try {
        const userIdResult = await pool.query("SELECT * FROM users WHERE role = 'student' LIMIT 1");
        const student = userIdResult.rows[0];
        console.log(`Testing with Student: ${student.name} (${student.branch}, CGPA: ${student.cgpa}, Year: ${student.academic_year})`);

        const drivesRes = await pool.query(`
            SELECT pd.*, er.min_cgpa, er.allowed_branches, er.allowed_years 
            FROM placement_drives pd
            LEFT JOIN eligibility_rules er ON pd.id = er.drive_id
        `);

        console.log(`\nChecking against ${drivesRes.rowCount} Drives:\n`);

        for (const drive of drivesRes.rows) {
            const isEligible = checkEligibility(student, drive);
            const status = isEligible ? "✅ ELIGIBLE" : "❌ NOT ELIGIBLE";
            console.log(`${status} - ${drive.company_name} (${drive.role})`);
            console.log(`   Rule: CGPA >= ${drive.min_cgpa}, Branch: [${drive.allowed_branches}], Year: [${drive.allowed_years}]`);
            if (!isEligible) {
                // simple debug
                if (parseFloat(student.cgpa) < parseFloat(drive.min_cgpa)) console.log(`      -> Failed CGPA`);
                if (drive.allowed_branches && !drive.allowed_branches.includes(student.branch)) console.log(`      -> Failed Branch`);
            }
        }

    } catch (e) { console.error(e); }
    finally { pool.end(); }
}

const checkEligibility = (student, driveRules) => {
    // 1. CGPA Check
    const studentCgpa = parseFloat(student.cgpa || 0);
    const minCgpa = parseFloat(driveRules.min_cgpa || 0);
    if (studentCgpa < minCgpa) return false;

    // 2. Branch Check
    if (driveRules.allowed_branches && driveRules.allowed_branches.length > 0) {
        if (!driveRules.allowed_branches.includes(student.branch)) {
            return false;
        }
    }

    // 3. Year Check
    if (driveRules.allowed_years && driveRules.allowed_years.length > 0) {
        // student.academic_year might be string "4"
        const studentYear = parseInt(student.academic_year);
        // driveRules.allowed_years might be string array ["3","4"] or int array [3,4]. 
        // Postgres array comes as... it depends. Seeding sent integers.
        // Let's assume loosely typed check or parse.
        const allowedYears = driveRules.allowed_years.map(y => parseInt(y));
        if (!allowedYears.includes(studentYear)) {
            return false;
        }
    }

    return true;
};

verify();
