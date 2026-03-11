const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/^"|"$/g, '');
    }
});

async function main() {
    const pool = new pg.Pool({
        connectionString: env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    console.log("--- All Snapshot Metadata ---");
    const snapshots = await prisma.snapshot.findMany({
        orderBy: { timestamp: 'desc' },
        select: { snapshot_id: true, week_id: true, timestamp: true }
    });

    snapshots.forEach(s => {
        console.log(`ID: ${s.snapshot_id} | Week: ${s.week_id} | Time: ${s.timestamp}`);
    });

    await prisma.$disconnect();
    await pool.end();
}

main().catch(err => console.error(err));
