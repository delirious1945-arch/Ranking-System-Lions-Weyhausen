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

  console.log("--- Updating Snapshot Labels to Spieltag Logic ---");
  
  // 2026-W10 -> Spieltag 13
  const s10 = await prisma.snapshot.updateMany({
      where: { week_id: '2026-W10' },
      data: { week_id: 'Spieltag 13' }
  });
  console.log(`Updated ${s10.count} entries for KW10 -> Spieltag 13`);

  // 2026-W11 -> Spieltag 14
  const s11 = await prisma.snapshot.updateMany({
      where: { week_id: '2026-W11' },
      data: { week_id: 'Spieltag 14' }
  });
  console.log(`Updated ${s11.count} entries for KW11 -> Spieltag 14`);

  // Update Manual Games too
  await prisma.manualGame.updateMany({
      where: { week_id: '2026-W10' },
      data: { week_id: 'Spieltag 13' }
  });
  await prisma.manualGame.updateMany({
      where: { week_id: '2026-W11' },
      data: { week_id: 'Spieltag 14' }
  });

  console.log("--- Migration Complete ---");
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => console.error(err));
