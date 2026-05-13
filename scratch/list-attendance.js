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
        const attendanceMap = {};
        const matchRecords = await prisma.matchRecord.findMany({ select: { playerName: true, spieltag: true } });
        matchRecords.forEach(mr => {
            if (!attendanceMap[mr.playerName]) attendanceMap[mr.playerName] = new Set();
            attendanceMap[mr.playerName].add(mr.spieltag);
        });
        const manualGames = await prisma.manualGame.findMany({ select: { player_name: true, date: true } });
        manualGames.forEach(mg => {
            if (!attendanceMap[mg.player_name]) attendanceMap[mg.player_name] = new Set();
            attendanceMap[mg.player_name].add(mg.date.toISOString().split('T')[0]);
        });

        const list = Object.keys(attendanceMap).map(name => ({
            name,
            days: attendanceMap[name].size
        })).sort((a, b) => b.days - a.days);

        console.log(JSON.stringify(list, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
main();
