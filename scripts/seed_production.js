const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function seedProductionStudent() {
    try {
        console.log('🌱 Seeding production database with student...\n');

        // Add the student that needs to login
        const result = await pool.query(
            `INSERT INTO users (name, email, enrollment_no, branch, academic_year, role, user_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (email) 
             DO UPDATE SET 
                role = EXCLUDED.role,
                user_status = EXCLUDED.user_status,
                enrollment_no = EXCLUDED.enrollment_no,
                name = EXCLUDED.name
             RETURNING *`,
            ['Student TY 18', 'adt24socb0018@student.mitadt.edu', 'ADT24SOCB0018', 'SOC', '2024', 'student', 'active']
        );

        console.log('✅ Student seeded successfully!');
        console.log(`   Email: ${result.rows[0].email}`);
        console.log(`   Role: ${result.rows[0].role}`);
        console.log(`   Status: ${result.rows[0].user_status}`);
        console.log('\n🎉 Student can now log in on production!');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seedProductionStudent();
