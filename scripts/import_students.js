const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

// Sample student data - replace with your actual student list
const students = [
    { name: 'Student 1', email: 'adt24socb0018@student.mitadt.edu', enrollment_no: 'ADT24SOCB0018', branch: 'SOC', academic_year: '2024' },
    // Add more students here...
];

async function importStudents() {
    try {
        console.log(`Importing ${students.length} students...`);

        let imported = 0;
        let skipped = 0;

        for (const student of students) {
            try {
                const query = `
                    INSERT INTO users (name, email, enrollment_no, branch, academic_year, role, user_status)
                    VALUES ($1, $2, $3, $4, $5, 'student', 'active')
                    ON CONFLICT (email) DO NOTHING
                    RETURNING id;
                `;

                const result = await pool.query(query, [
                    student.name,
                    student.email.toLowerCase(),
                    student.enrollment_no,
                    student.branch,
                    student.academic_year
                ]);

                if (result.rowCount > 0) {
                    imported++;
                    console.log(`✅ Imported: ${student.email}`);
                } else {
                    skipped++;
                    console.log(`⏭️  Skipped (already exists): ${student.email}`);
                }
            } catch (error) {
                console.error(`❌ Error importing ${student.email}:`, error.message);
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Imported: ${imported}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Total: ${students.length}`);

    } catch (error) {
        console.error('❌ Import failed:', error);
    } finally {
        await pool.end();
    }
}

importStudents();
