const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env manually
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

    console.log("--- Snapshots for Erik Schremmer ---");
    const snapshots = await prisma.snapshot.findMany({
        orderBy: { timestamp: 'desc' },
        include: {
            values: {
                where: { player_name: 'Erik Schremmer' }
            }
        }
    });

    snapshots.forEach(s => {
        console.log(`Snapshot ID: ${s.snapshot_id} | Week: ${s.week_id} | Timestamp: ${s.timestamp}`);
        if (s.values.length > 0) {
            const v = s.values[0];
            console.log(`  Avg Total: ${v.avg_total}`);
            console.log(`  Pts K1-K5: ${v.points_k1}, ${v.points_k2}, ${v.points_k3}, ${v.points_k4}, ${v.points_k5}`);
            console.log(`  Total Points: ${v.total_points}`);
        } else {
            console.log("  No data.");
        }
    });

    await prisma.$disconnect();
    await pool.end();
}

main().catch(err => console.error(err));
