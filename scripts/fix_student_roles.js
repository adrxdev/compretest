const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function fixStudentRoles() {
    try {
        console.log('🔍 Checking user roles and statuses...\n');

        // 1. Check current state
        const checkQuery = `
            SELECT role, user_status, COUNT(*) as count
            FROM users
            GROUP BY role, user_status
            ORDER BY role, user_status;
        `;
        const { rows: current } = await pool.query(checkQuery);
        console.log('Current user distribution:');
        current.forEach(row => {
            console.log(`  ${row.role} (${row.user_status}): ${row.count} users`);
        });

        // 2. Fix students without proper role
        console.log('\n📝 Ensuring all non-admin users have role="student"...');
        const fixRoleQuery = `
            UPDATE users
            SET role = 'student'
            WHERE role IS NULL OR (role != 'admin' AND role != 'student')
            RETURNING id, email, role;
        `;
        const { rows: fixedRoles, rowCount: roleCount } = await pool.query(fixRoleQuery);
        if (roleCount > 0) {
            console.log(`✅ Fixed ${roleCount} users with missing/invalid roles`);
            fixedRoles.forEach(user => console.log(`   - ${user.email} → ${user.role}`));
        } else {
            console.log('✅ All users have valid roles');
        }

        // 3. Fix users without user_status
        console.log('\n📝 Ensuring all users have user_status="active"...');
        const fixStatusQuery = `
            UPDATE users
            SET user_status = 'active'
            WHERE user_status IS NULL OR user_status = ''
            RETURNING id, email, user_status;
        `;
        const { rows: fixedStatus, rowCount: statusCount } = await pool.query(fixStatusQuery);
        if (statusCount > 0) {
            console.log(`✅ Fixed ${statusCount} users with missing status`);
            fixedStatus.forEach(user => console.log(`   - ${user.email} → ${user.user_status}`));
        } else {
            console.log('✅ All users have valid status');
        }

        // 4. Show final state
        console.log('\n📊 Final user distribution:');
        const { rows: final } = await pool.query(checkQuery);
        final.forEach(row => {
            console.log(`  ${row.role} (${row.user_status}): ${row.count} users`);
        });

        // 5. List all students for verification
        console.log('\n👥 Student users:');
        const studentsQuery = `
            SELECT id, name, email, enrollment_no, role, user_status
            FROM users
            WHERE role = 'student'
            ORDER BY email
            LIMIT 10;
        `;
        const { rows: students } = await pool.query(studentsQuery);
        students.forEach(s => {
            console.log(`  ${s.email} - ${s.name} (${s.enrollment_no || 'no enrollment'}) [${s.user_status}]`);
        });

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pool.end();
    }
}

fixStudentRoles();
