
const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to DB');

        // Check if column exists
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'UserPassword' AND column_name = 'role'
        `);

        if (res.rows.length === 0) {
            console.log('Adding role column...');
            await client.query(`ALTER TABLE "UserPassword" ADD COLUMN "role" TEXT DEFAULT 'viewer'`);
            console.log('Column added.');
        } else {
            console.log('Role column already exists.');
        }

    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await client.end();
    }
}

migrate();
