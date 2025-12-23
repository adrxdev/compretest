const db = require('../src/config/db');

const testStudents = [
    { name: 'Test Student 1', email: 'student1@test.com', enrollment_no: 'TEST001', branch: 'CSE' },
    { name: 'Test Student 2', email: 'student2@test.com', enrollment_no: 'TEST002', branch: 'IT' },
    { name: 'Test Student 3', email: 'student3@test.com', enrollment_no: 'TEST003', branch: 'ECE' },
    { name: 'Test Student 4', email: 'student4@test.com', enrollment_no: 'TEST004', branch: 'MECH' },
    { name: 'Test Student 5', email: 'student5@test.com', enrollment_no: 'TEST005', branch: 'CIVIL' }
];

async function seedStudents() {
    console.log('🌱 Seeding Test Students...');

    try {
        for (const student of testStudents) {
            // Check if exists
            const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [student.email]);

            if (rows.length === 0) {
                await db.query(`
                    INSERT INTO users (name, email, enrollment_no, branch, role)
                    VALUES ($1, $2, $3, $4, 'student')
                `, [student.name, student.email, student.enrollment_no, student.branch]);
                console.log(`✅ Created: ${student.email}`);
            } else {
                // Update specific fields to ensure fresh state
                await db.query(`
                    UPDATE users 
                    SET name = $1, enrollment_no = $2, branch = $3, role = 'student'
                    WHERE email = $4
                `, [student.name, student.enrollment_no, student.branch, student.email]);
                console.log(`🔄 Updated: ${student.email}`);
            }
        }
        console.log('✨ Seeding Complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding Failed:', err);
        process.exit(1);
    }
}

seedStudents();
