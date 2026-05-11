import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import * as dotenv from 'dotenv'

dotenv.config();

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    console.error("DATABASE_URL is undefined!");
    process.exit(1);
}

const pool = new pg.Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Updating 180s for Sebastian Kirste...');
  
  const latestSnapshot = await prisma.snapshot.findFirst({
    orderBy: { timestamp: 'desc' }
  });

  if (!latestSnapshot) {
    console.error('No snapshot found!');
    return;
  }

  const result = await prisma.snapshotPlayerValue.updateMany({
    where: {
      snapshot_id: latestSnapshot.snapshot_id,
      player_name: 'Sebastian Kirste'
    },
    data: {
      cnt_180: 5
    }
  });

  console.log(`Updated ${result.count} record(s). Sebastian Kirste now has 5 180s in the latest snapshot.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
