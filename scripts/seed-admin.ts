
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminName = 'Sebastian Kirste';
  
  // Update the user role to admin
  const user = await (prisma as any).userPassword.update({
    where: { player_name: adminName },
    data: { role: 'admin' }
  });
  
  console.log('Successfully set admin role for:', user.player_name);
}

main()
  .catch(e => {
    console.error('Error seeding admin role:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
