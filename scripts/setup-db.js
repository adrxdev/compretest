const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const run = async () => {
    // Validate DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
        console.error('❌ ERROR: DATABASE_URL environment variable is not set');
        process.exit(1);
    }

    // Parse DATABASE_URL to get credentials, but connect to 'postgres' db first
    const dbUrl = process.env.DATABASE_URL;
    let urlParts;

    try {
        urlParts = new URL(dbUrl);
    } catch (err) {
        console.error('❌ ERROR: Invalid DATABASE_URL format');
        process.exit(1);
    }

    const targetDb = urlParts.pathname.split('/')[1];

    // Connect to default 'postgres' database
    urlParts.pathname = '/postgres';
    const postgresClient = new Client({ connectionString: urlParts.toString() });

    try {
        await postgresClient.connect();
        console.log('✅ Connected to postgres database');

        // Check if target db exists (using parameterized query to prevent SQL injection)
        const res = await postgresClient.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [targetDb]
        );

        if (res.rowCount === 0) {
            console.log(`📦 Creating database ${targetDb}...`);
            // Note: Database names cannot be parameterized, but we validate it came from URL parsing
            await postgresClient.query(`CREATE DATABASE "${targetDb}"`);
            console.log(`✅ Database ${targetDb} created.`);
        } else {
            console.log(`✅ Database ${targetDb} already exists.`);
        }
    } catch (err) {
        console.error('❌ Error creating database:', err.message);
        process.exit(1);
    } finally {
        await postgresClient.end();
    }

    // Now connect to the target database and run init.sql
    const targetClient = new Client({ connectionString: dbUrl });
    try {
        await targetClient.connect();
        console.log(`✅ Connected to ${targetDb}`);

        const sqlPath = path.join(__dirname, '../database/init.sql');

        if (!fs.existsSync(sqlPath)) {
            console.error(`❌ ERROR: init.sql not found at ${sqlPath}`);
            process.exit(1);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🔄 Running init.sql...');
        await targetClient.query(sql);
        console.log('✅ Schema initialized successfully.');
        console.log('🎉 Database setup complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error initializing schema:', err.message);
        console.error('Full error:', err);
        process.exit(1);
    } finally {
        await targetClient.end();
    }
};

run().catch(err => {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
});
