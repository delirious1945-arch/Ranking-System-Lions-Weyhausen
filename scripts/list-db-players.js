const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const players = await prisma.player.findMany();
    console.log(`Players in DB: ${players.length}`);
    for (const p of players) {
        console.log(`  ${p.player_name} | ${p.verein}`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
