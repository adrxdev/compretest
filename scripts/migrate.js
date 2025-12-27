const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

const MIGRATE_TABLE_SQL = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

const runMigrations = async () => {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Database Migrations...');

        // 1. Ensure migrations table exists
        await client.query(MIGRATE_TABLE_SQL);

        // 2. Get applied migrations
        const { rows: appliedRows } = await client.query('SELECT migration_name FROM schema_migrations');
        const applied = new Set(appliedRows.map(r => r.migration_name));

        // 3. Read migration files
        const migrationsDir = path.join(__dirname, '../migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort(); // Ensure alphanumeric order (001, 002, ...)

        // 4. Apply pending migrations
        let pendingCount = 0;
        for (const file of files) {
            if (applied.has(file)) {
                continue;
            }

            pendingCount++;
            console.log(`▶️ Applying migration: ${file}`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                // Transaction per migration
                await client.query('BEGIN');
                await client.query(sql);
                await client.query('INSERT INTO schema_migrations (migration_name) VALUES ($1)', [file]);
                await client.query('COMMIT');
                console.log(`✅ Applied: ${file}`);
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`❌ Migration failed: ${file}`);
                console.error(err.message);
                process.exit(1);
            }
        }

        if (pendingCount === 0) {
            console.log('✨ No pending migrations. Database is up to date.');
        } else {
            console.log(`🎉 Successfully applied ${pendingCount} migrations.`);
        }

    } catch (err) {
        console.error('Migration Runner Error:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

// Execute if run directly
if (require.main === module) {
    runMigrations();
}

module.exports = { runMigrations };
