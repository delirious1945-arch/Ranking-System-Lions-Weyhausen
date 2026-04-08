const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedTestData() {
    console.log("Seeding test match data for Erik Schremmer...");
    // Erik plays in Lions Weyhausen B (Event 251)
    const eventId = 251;
    const playerName = "Erik Schremmer";
    
    // Simulate some match records
    const tests = [
        { spieltag: 1, opponent: "FireDarter C", won: true, avg: 65.5 },
        { spieltag: 2, opponent: "Dart Devils B", won: false, avg: 58.2 },
        { spieltag: 17, opponent: "Vorgezogenes Team", won: true, avg: 70.1 } // The "early" game
    ];

    for (const t of tests) {
        await prisma.matchRecord.upsert({
            where: { gameId: 999000 + t.spieltag },
            update: {},
            create: {
                gameId: 999000 + t.spieltag,
                encounterId: 888000 + t.spieltag,
                eventId,
                spieltag: t.spieltag,
                playerName,
                opponentName: t.opponent,
                date: new Date(),
                legsWon: t.won ? 3 : 1,
                legsLost: t.won ? 1 : 3,
                avgTotal: t.avg,
                dartsTotal: 100,
                scoreTotal: Math.floor(t.avg * 100 / 3),
                avg9: t.avg + 5,
                darts9: 30,
                score9: Math.floor((t.avg + 5) * 30 / 3),
                avg18: t.avg + 2,
                darts18: 60,
                score18: Math.floor((t.avg + 2) * 60 / 3),
                count80: 2,
                count100: 3,
                count140: 1,
                count180: 0,
                checkoutMax: 80,
                won: t.won
            }
        });
    }
    console.log("Seed complete.");
}

seedTestData().catch(console.error).finally(() => prisma.$disconnect());
