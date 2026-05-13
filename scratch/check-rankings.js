const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const s = await prisma.snapshot.findFirst({
            orderBy: { timestamp: 'desc' },
            include: {
                values: {
                    orderBy: { total_points: 'desc' }
                }
            }
        });
        
        if (!s) {
            console.log("No snapshot found.");
            return;
        }

        console.log("Ranking in Snapshot ID:", s.snapshot_id);
        const list = s.values.map(v => ({
            rank: v.rank,
            name: v.player_name,
            points: v.total_points,
            k1: v.points_k1,
            k2: v.points_k2,
            k3: v.points_k3,
            k4: v.points_k4,
            k5: v.points_k5,
            siegequote: v.siegequote_pct,
            avg: v.avg_total
        }));
        console.log(JSON.stringify(list, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
main();
