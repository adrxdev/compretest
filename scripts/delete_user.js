const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
    ssl: connectionString && connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
});

const deleteUser = async () => {
    const client = await pool.connect();
    try {
        const email = 'john.doe@student.edu';
        console.log(`Deleting user ${email}...`);

        const result = await client.query('DELETE FROM users WHERE email = $1', [email]);
        
        if (result.rowCount > 0) {
            console.log(`✅ User deleted successfully. (${result.rowCount} row(s) deleted)`);
        } else {
            console.log('ℹ️ User not found.');
        }
    } catch (err) {
        console.error('❌ Error deleting user:', err);
    } finally {
        client.release();
        await pool.end();
        process.exit(0);
    }
};

deleteUser();
