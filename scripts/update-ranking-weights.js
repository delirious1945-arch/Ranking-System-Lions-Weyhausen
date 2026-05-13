const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const config = await prisma.rankingConfig.upsert({
      where: { id: 1 },
      update: {
        weight_k1: 0.20,
        weight_k2: 0.10,
        weight_k3: 0.10,
        weight_k4: 0.45,
        weight_k5: 0.15,
        updated_at: new Date()
      },
      create: {
        id: 1,
        weight_k1: 0.20,
        weight_k2: 0.10,
        weight_k3: 0.10,
        weight_k4: 0.45,
        weight_k5: 0.15
      }
    });
    console.log('Successfully updated RankingConfig:', config);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
