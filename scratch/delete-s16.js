const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function deleteS16() {
    const snaps = await prisma.snapshot.findMany({ where: { week_id: 'Spieltag 16' } });
    console.log(`Found ${snaps.length} snapshots to delete.`);
    for (const s of snaps) {
        await prisma.snapshotPlayerValue.deleteMany({ where: { snapshot_id: s.snapshot_id } });
        await prisma.snapshot.delete({ where: { snapshot_id: s.snapshot_id } });
        console.log(`Deleted Snapshot ID: ${s.snapshot_id}`);
    }
}

deleteS16().finally(() => {
    pool.end();
    prisma.$disconnect();
});
