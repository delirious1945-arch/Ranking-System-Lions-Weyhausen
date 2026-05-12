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
    const userPasswords = await prisma.userPassword.findMany();
    console.log(JSON.stringify(userPasswords, null, 2));
    
    const andre = userPasswords.find(u => u.player_name && u.player_name.toLowerCase().includes('andré'));
    if (andre) {
      console.log(`Found Andre in UserPassword: ${andre.player_name}`);
      await prisma.userPassword.update({
        where: { id: andre.id },
        data: { role: 'admin' }
      });
      console.log('Successfully made Andre an ADMIN in UserPassword.');
    } else {
      console.log('Andre not found in UserPassword table.');
      
      // If not found, maybe we should create him? 
      // But we need a password hash. 
      // I'll check the existing admin hash to see what format it is.
      const admin = userPasswords.find(u => u.role === 'admin');
      if (admin) {
          console.log(`Example Admin: ${admin.player_name}, Role: ${admin.role}`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
