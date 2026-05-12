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
    const username = 'André Rathje';
    const existing = await prisma.user.findUnique({ where: { username } });
    
    if (existing) {
      await prisma.user.update({
        where: { user_id: existing.user_id },
        data: { role: 'admin' }
      });
      console.log(`Updated ${username} to admin.`);
    } else {
      await prisma.user.create({
        data: { username, role: 'admin' }
      });
      console.log(`Created ${username} as admin.`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
