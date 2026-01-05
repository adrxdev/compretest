
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

const setupUser = async () => {
    const client = await pool.connect();
    try {
        console.log('🔧 Updating Users for Demo Eligibility...');

        // Update ALL students to have reasonable data for the mix
        // Setting Branch = CSE, CGPA = 7.2, Year = 4
        // This fails SwayAlgo (8.5) and TataMotors (Mech)
        // Passes others.

        const res = await client.query(`
            UPDATE users 
            SET cgpa = 7.2, branch = 'CSE', academic_year = '4'
            WHERE role = 'student' OR role IS NULL;
        `);

        console.log(`✅ Updated ${res.rowCount} users with CGPA 7.2, Branch CSE, Year 4`);

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
};

setupUser();
