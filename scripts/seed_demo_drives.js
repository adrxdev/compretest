const db = require('../src/config/db');
require('dotenv').config();

const seed = async () => {
    try {
        console.log('🌱 Seeding Placement Drives...');

        // 1. Check if drives exist
        const checkQuery = 'SELECT COUNT(*) FROM placement_drives';
        const { rows } = await db.query(checkQuery);
        const count = parseInt(rows[0].count);

        if (count > 0) {
            console.log('ℹ️  Drives already exist. Skipping seed.');
            process.exit(0);
        }

        // 2. Insert Demo Drive
        console.log('Creating demo drive: All Indo Pvt Ltd...');

        const driveQuery = `
            INSERT INTO placement_drives (company_name, role, job_type, stipend_ctc, description, deadline)
            VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '30 days')
            RETURNING id;
        `;
        const driveValues = [
            'All Indo Pvt Ltd',
            'Software Engineer Intern',
            'INTERNSHIP',
            '₹15,000/month',
            'Exciting opportunity to work on cutting-edge AI projects.'
        ];

        const driveRes = await db.query(driveQuery, driveValues);
        const driveId = driveRes.rows[0].id;

        // 3. Insert Eligibility Rules
        const rulesQuery = `
            INSERT INTO eligibility_rules (drive_id, min_cgpa, allowed_branches, allowed_years)
            VALUES ($1, $2, $3, $4);
        `;
        const rulesValues = [
            driveId,
            6.00,
            ['CSE', 'AI', 'IT'],
            [4] // 4th Year
        ];

        await db.query(rulesQuery, rulesValues);

        console.log('✅ Demo drive seeded successfully!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seed();
