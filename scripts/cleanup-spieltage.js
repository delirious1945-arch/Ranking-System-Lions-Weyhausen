const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim().replace(/^"|"$/g, '');
  }
});

async function main() {
  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("--- Cleaning up Spieltag 16 & 17 ---");
  
  // Find all snapshots that have Spieltag 16 or 17
  const snaps = await prisma.snapshot.findMany({
      where: {
          week_id: { in: ['Spieltag 16', 'Spieltag 17'] }
      }
  });

  console.log(`Found ${snaps.length} snapshots with Spieltag 16/17.`);

  // Rename them to Spieltag 15
  for (const s of snaps) {
      await prisma.snapshot.update({
          where: { snapshot_id: s.snapshot_id },
          data: { week_id: 'Spieltag 15' }
      });
      console.log(`Updated snapshot ${s.snapshot_id} to Spieltag 15`);
  }

  console.log("--- Cleanup Complete ---");
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => console.error(err));
