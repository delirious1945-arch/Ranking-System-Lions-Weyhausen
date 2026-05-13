const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const snapshot = await prisma.snapshot.findFirst({
            orderBy: { timestamp: 'desc' },
            include: {
                values: {
                    where: { player_name: 'Sebastian Kirste' }
                }
            }
        });
        
        if (!snapshot || !snapshot.values.length) {
            console.log("No data found for Sebastian Kirste.");
            return;
        }

        const data = snapshot.values[0];
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
