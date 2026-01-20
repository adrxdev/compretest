const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');
require('dotenv').config();

const injectExamples = async () => {
    try {
        console.log('📥 Reading examples.sql...');
        const sqlPath = path.join(__dirname, '../database/examples.sql');
        let sql = fs.readFileSync(sqlPath, 'utf8');

        // Remove SQL comments (lines starting with --)
        sql = sql.split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n');

        // Split by semicolon to get individual statements
        const statements = sql.split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        console.log(`🔄 Executing ${statements.length} SQL statements...`);

        for (const statement of statements) {
            try {
                const result = await db.query(statement);
                console.log('✅', statement.substring(0, 80) + (statement.length > 80 ? '...' : ''));
                if (result.rows && result.rows.length > 0) {
                    console.log('   Result:', JSON.stringify(result.rows[0]));
                }
            } catch (error) {
                console.error('❌ Error executing statement:', error.message);
                console.error('   Statement:', statement.substring(0, 100));
            }
        }

        // Verify data
        console.log('\n📊 Verification:');
        const users = await db.query('SELECT COUNT(*) as count FROM users');
        const events = await db.query('SELECT COUNT(*) as count FROM events');
        const attendance = await db.query('SELECT COUNT(*) as count FROM attendance_logs');

        console.log(`✅ Users: ${users.rows[0].count}`);
        console.log(`✅ Events: ${events.rows[0].count}`);
        console.log(`✅ Attendance Logs: ${attendance.rows[0].count}`);

        console.log('\n🎉 Data injected successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

injectExamples();
