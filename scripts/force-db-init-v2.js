require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL;
    const pool = new pg.Pool({
        connectionString: connectionString,
        max: 1,
        ssl: { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

const prisma = prismaClientSingleton();

async function createTableForce() {
    console.log("Attempting to create MatchRecord table via direct SQL...");
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "MatchRecord" (
                "id" SERIAL PRIMARY KEY,
                "gameId" INTEGER UNIQUE NOT NULL,
                "encounterId" INTEGER NOT NULL,
                "eventId" INTEGER NOT NULL,
                "spieltag" INTEGER NOT NULL,
                "playerName" TEXT NOT NULL,
                "opponentName" TEXT NOT NULL,
                "date" TIMESTAMP(3) NOT NULL,
                "legsWon" INTEGER NOT NULL,
                "legsLost" INTEGER NOT NULL,
                "avgTotal" DOUBLE PRECISION NOT NULL,
                "dartsTotal" INTEGER NOT NULL DEFAULT 0,
                "scoreTotal" INTEGER NOT NULL DEFAULT 0,
                "avg9" DOUBLE PRECISION NOT NULL,
                "darts9" INTEGER NOT NULL DEFAULT 0,
                "score9" INTEGER NOT NULL DEFAULT 0,
                "avg18" DOUBLE PRECISION NOT NULL,
                "darts18" INTEGER NOT NULL DEFAULT 0,
                "score18" INTEGER NOT NULL DEFAULT 0,
                "count80" INTEGER NOT NULL,
                "count100" INTEGER NOT NULL,
                "count140" INTEGER NOT NULL,
                "count180" INTEGER NOT NULL,
                "checkoutMax" INTEGER NOT NULL,
                "won" BOOLEAN NOT NULL,
                "isDouble" BOOLEAN NOT NULL DEFAULT false,
                "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table 'MatchRecord' exists.");
    } catch (e) {
        console.error("SQL Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

createTableForce().catch(console.error);
