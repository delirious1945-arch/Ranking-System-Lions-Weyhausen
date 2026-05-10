const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verify() {
    let snapshotId;
    const arg = process.argv.find(a => a.startsWith('--snapshot='));
    if (arg) {
        snapshotId = parseInt(arg.split('=')[1]);
    } else {
        const latest = await prisma.snapshot.findFirst({ orderBy: { snapshot_id: 'desc' } });
        snapshotId = latest?.snapshot_id;
    }

    if (!snapshotId) {
        console.error("No snapshot found.");
        return;
    }

    const values = await prisma.snapshotPlayerValue.findMany({
        where: { snapshot_id: snapshotId },
        orderBy: { rank: 'asc' }
    });
    
    console.log(`Snapshot ${snapshotId} Verification - ${values.length} players found:`);
    for (const v of values) {
        const p = v.total_points.toFixed(2);
        console.log(`${v.rank.toString().padStart(2)}. ${v.player_name.padEnd(25)} | Points: ${p.padStart(6)} | Avg: ${v.avg_total.toFixed(2)} | Games: ${v.games_played}`);
    }
}

verify().catch(console.error).finally(() => prisma.$disconnect());
