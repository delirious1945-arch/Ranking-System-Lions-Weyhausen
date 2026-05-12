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
    const users = await prisma.user.findMany();
    console.log(JSON.stringify(users, null, 2));
    
    const andre = users.find(u => u.name && u.name.toLowerCase().includes('andré'));
    if (andre) {
      console.log(`Found Andre: ${andre.email}`);
      await prisma.user.update({
        where: { id: andre.id },
        data: { role: 'ADMIN' }
      });
      console.log('Successfully made Andre an ADMIN.');
    } else {
      console.log('Andre not found in users table.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
