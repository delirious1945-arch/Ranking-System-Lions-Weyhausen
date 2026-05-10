const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function debugSnapshots() {
    const snapshots = await prisma.snapshot.findMany({
        where: { week_id: 'Spieltag 16' },
        orderBy: { snapshot_id: 'desc' }
    });

    console.log(`Found ${snapshots.length} snapshots for "Spieltag 16":`);
    for (const s of snapshots) {
        const count = await prisma.snapshotPlayerValue.count({ where: { snapshot_id: s.snapshot_id } });
        console.log(`ID: ${s.snapshot_id} | Time: ${s.timestamp} | Players: ${count}`);
        
        if (count < 17) {
            const players = await prisma.snapshotPlayerValue.findMany({ where: { snapshot_id: s.snapshot_id } });
            console.log(`  Players in ID ${s.snapshot_id}: ${players.map(p => p.player_name).join(', ')}`);
        }
    }
}

debugSnapshots().finally(() => prisma.$disconnect());
