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
        const playerName = 'Dirk Ostermann';
        const matchDays = await prisma.matchRecord.findMany({
            where: { playerName: playerName },
            select: { spieltag: true }
        });
        const manualDays = await prisma.manualGame.findMany({
            where: { player_name: playerName },
            select: { date: true }
        });

        const days = new Set();
        matchDays.forEach(d => days.add(d.spieltag));
        manualDays.forEach(d => {
            if (d.date) {
                days.add(d.date.toISOString().split('T')[0]);
            }
        });

        console.log(`Player: ${playerName}`);
        console.log(`Total Match Records: ${matchDays.length}`);
        console.log(`Total Manual Games: ${manualDays.length}`);
        console.log(`Distinct Days/Spieltage: ${days.size}`);
        console.log(`Days List:`, [...days]);

        const totalMatchdays = 16;
        const percentage = (days.size / totalMatchdays) * 100;
        console.log(`Percentage: ${percentage.toFixed(2)}%`);

        if (percentage >= 85) console.log("Bonus: 1.5x");
        else if (percentage >= 70) console.log("Bonus: 1.3x");
        else if (percentage >= 50) console.log("Bonus: 1.2x");
        else console.log("Bonus: 1.0x");

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
main();
