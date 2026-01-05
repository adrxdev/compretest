
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

const companies = [
    {
        company_name: "Amrut Software",
        role: "Forge Developer Intern",
        job_type: "INTERNSHIP",
        stipend_ctc: "INR 12,000 / Month",
        industry: "IT Product & Services",
        location: "Pune",
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        description: `Desired Candidate:
• Excellent Academic records.
• Proficiency in English.
• C, C++, Java, Dot Net, Node JS, Python, Any technical Language.
• Excellent knowledge of MS Office, MS Excel, SQL, ORACLE, Azure Any.
• Fast learner and a passion for Development.
• Self-motivated with a result-driven approach.


Note:
• Candidate will be signing a Training Agreement for a span of 2 years with the organization.
• Initial 6 months will be a training and post that will be an evaluation for it to be on company payroll.`,
        about_company: `Amrut Software, a leading IT Software Services & Solutions provider, began its journey as a software tools reseller and has evolved over the last decade into a specialized provider of software development, consulting, and DevOps services.
        
We partner with Atlassian, Zendesk, HashiCorp, and other global technology leaders to deliver state-of-the-art solutions to our clients.`,
        selection_process: `L1 Round:
1. Aptitude Test
2. Programming Test

L2 Round:
1. Technical Interview
2. HR/Company Aptitude`,
        bond_details: `Training Agreement for a span of 2 years.
        
Salary Band for Campus Recruitment 2025:
• Forge Developer Intern
• Period: 6 Months
• Remuneration: ₹12,000 per month
• Employment Status: Intern (on payroll)
• Work Mode: Work from office`,
        min_cgpa: 6.0, // Lowered to be more accessible
        allowed_branches: ['CSE', 'IT', 'AI', 'ENTC'], // Added ENTC
        allowed_years: [3, 4]
    },
    {
        company_name: "Intellipaat",
        role: "Business Development Associate",
        job_type: "FULL_TIME",
        stipend_ctc: "INR 8,00,000 LPA",
        industry: "E-Learning / Edtech",
        location: "Bangalore",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        description: `Responsibilities:
• Identify and develop new business opportunities.
• Convert leads into sales.
• Maintain relationships with existing clients.
• Meet and exceed sales targets.`,
        about_company: `Intellipaat is a global online professional training provider. We are offering some of the most updated, industry-designed certification training programs which includes courses in Big Data, Data Science, Artificial Intelligence and more.`,
        selection_process: `1. Group Discussion
2. Personal Interview
3. HR Round`,
        bond_details: `1 Year Service Agreement based on performance logic.`,
        min_cgpa: 0, // Open to all CGPA
        allowed_branches: ['CSE', 'IT', 'AI', 'ENTC', 'MECH', 'CIVIL'], // Open to ALL
        allowed_years: [1, 2, 3, 4] // Open to juniors too
    },
    {
        company_name: "SwayAlgo",
        role: "Junior Game Developer",
        job_type: "FULL_TIME",
        stipend_ctc: "INR 4,50,000 LPA",
        industry: "Gaming / IT",
        location: "Pune",
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        description: `• Develop game logic using Phaser/JavaScript.
• Collaborate with design team for assets.
• Optimize game performance for mobile devices.`,
        about_company: `SwayAlgo is a boutique game development studio focusing on hyper-casual games for mobile platforms.`,
        selection_process: `1. Online Assessment (Logic + JS)
2. Technical Interview (Live Coding)
3. Culture Fit Round`,
        bond_details: `No Bond.`,
        min_cgpa: 8.5, // High CGPA (Restrictive)
        allowed_branches: ['CSE', 'IT'],
        allowed_years: [4]
    },
    {
        company_name: "FinFlow Solutions",
        role: "React Frontend Developer",
        job_type: "INTERNSHIP",
        stipend_ctc: "INR 25,000 / Month",
        industry: "Fintech",
        location: "Remote",
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        description: `• Build reusable React components.
• Integrate REST APIs.
• Convert Figma designs to pixel-perfect UI.`,
        about_company: `FinFlow is a stealth startup building the next generated of automated reconciliation tools for SMBs.`,
        selection_process: `1. Portfolio Review
2. React Machine Coding Round`,
        bond_details: `No Bond. PPO possibility based on performance.`,
        min_cgpa: 7.0,
        allowed_branches: ['CSE', 'IT', 'AI'],
        allowed_years: [3, 4]
    },
    {
        company_name: "Tata Motors",
        role: "Graduate Engineer Trainee",
        job_type: "FULL_TIME",
        stipend_ctc: "INR 6,50,000 LPA",
        industry: "Automotive",
        location: "Pune",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: `• Rotational program across manufacturing, design, and supply chain.
• Contribute to EV battery management systems.`,
        about_company: `Tata Motors Limited is a leading global automobile manufacturer of cars, utility vehicles, buses, trucks and defense vehicles.`,
        selection_process: `1. Aptitude + Technical Test
2. Group Discussion
3. Technical Interview
4. HR Interview`,
        bond_details: `2 Years Service Bond.`,
        min_cgpa: 6.5,
        allowed_branches: ['MECH', 'CIVIL', 'ENTC'], // Non-CS branches (Restrictive for CS students)
        allowed_years: [4]
    }
];

const seed = async () => {
    const client = await pool.connect();
    try {
        console.log('🌱 Seeding Placements...');

        // Optional: Clear existing drives to avoid duplicates/clutter for this demo
        // await client.query('DELETE FROM placement_drives');

        for (const c of companies) {
            const res = await client.query(`
                INSERT INTO placement_drives 
                (company_name, role, job_type, stipend_ctc, description, deadline, industry, location, about_company, selection_process, bond_details)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id;
            `, [
                c.company_name, c.role, c.job_type, c.stipend_ctc, c.description, c.deadline,
                c.industry, c.location, c.about_company, c.selection_process, c.bond_details
            ]);

            const driveId = res.rows[0].id;

            await client.query(`
                INSERT INTO eligibility_rules (drive_id, min_cgpa, allowed_branches, allowed_years)
                VALUES ($1, $2, $3, $4)
            `, [driveId, c.min_cgpa, c.allowed_branches, c.allowed_years]);

            console.log(`✅ Seeded: ${c.company_name} - ${c.role}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
};

seed();
