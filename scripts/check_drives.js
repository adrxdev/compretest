const db = require('../src/config/db');
require('dotenv').config();

const check = async () => {
    try {
        const query = 'SELECT * FROM placement_drives';
        const { rows } = await db.query(query);
        console.log(`Found ${rows.length} drives:`);
        rows.forEach(r => console.log(`- ${r.company_name} (${r.role})`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
