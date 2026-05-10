const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({
    connectionString: connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: {
        rejectUnauthorized: false
    }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function purgeHistory() {
  console.log('--- PURGE HISTORY START ---');
  try {
    const delValues = await prisma.snapshotPlayerValue.deleteMany({});
    console.log(`Deleted ${delValues.count} player values.`);

    const delSnaps = await prisma.snapshot.deleteMany({});
    console.log(`Deleted ${delSnaps.count} snapshots.`);

    const delLogs = await prisma.changeLog.deleteMany({});
    console.log(`Deleted ${delLogs.count} change logs.`);

    console.log('--- PURGE HISTORY SUCCESS ---');
  } catch (e) {
    console.error('--- PURGE HISTORY FAILED ---');
    console.error(e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

purgeHistory();
