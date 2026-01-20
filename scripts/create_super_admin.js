const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
    ssl: connectionString && connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
});

const createSuperAdmin = async () => {
    const client = await pool.connect();
    try {
        const email = 'sendermchsashs@gmail.com';
        console.log(`Checking if user ${email} exists...`);

        const checkRes = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (checkRes.rows.length > 0) {
            console.log('User already exists. Updating role to admin...');
            await client.query('UPDATE users SET role = $1, user_status = $2 WHERE email = $3', ['admin', 'active', email]);
            console.log('✅ User updated successfully.');
        } else {
            console.log('User does not exist. Creating new Super Admin...');
            const insertQuery = `
                INSERT INTO users (name, email, enrollment_no, branch, role, academic_year, user_status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *;
            `;
            const values = [
                'Administrator (Super Admin)',
                email,
                'SUPER-ADMIN-001',
                'ADMIN',
                'admin',
                2024,
                'active'
            ];

            const res = await client.query(insertQuery, values);
            console.log('✅ Super Admin created successfully:', res.rows[0]);
        }
    } catch (err) {
        console.error('❌ Error creating Super Admin:', err);
    } finally {
        client.release();
        await pool.end();
        process.exit(0);
    }
};

createSuperAdmin();
