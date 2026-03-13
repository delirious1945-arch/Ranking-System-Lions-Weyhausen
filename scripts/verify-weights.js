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

  console.log("--- Current Ranking Config in DB ---");
  const config = await prisma.rankingConfig.findUnique({ where: { id: 1 } });
  console.log(config);

  console.log("--- Erick Schremmer Values ---");
  const values = await prisma.snapshotPlayerValue.findMany({
      where: { player_name: 'Erik Schremmer' },
      include: { snapshot: true },
      orderBy: { snapshot: { timestamp: 'desc' } }
  });

  values.forEach(v => {
      console.log(`Week: ${v.snapshot.week_id}`);
      console.log(`  Raw Stats -> Avg: ${v.avg_total}, 9: ${v.avg_9}, 18: ${v.avg_18}, Win%: ${v.siegequote_pct}, High/Leg: ${v.avg_high_per_leg}`);
      console.log(`  Points -> K1: ${v.points_k1}, K2: ${v.points_k2}, K3: ${v.points_k3}, K4: ${v.points_k4}, K5: ${v.points_k5}`);
      console.log(`  Total Points -> ${v.total_points}`);

      if (config) {
          const weighted_sum =
            (v.points_k1 * config.weight_k1) +
            (v.points_k2 * config.weight_k2) +
            (v.points_k3 * config.weight_k3) +
            (v.points_k4 * config.weight_k4) +
            (v.points_k5 * config.weight_k5);
          const computedTotal = Math.round(weighted_sum * 5 * 100) / 100;
          console.log(`  Expected Total with Weights -> sum: ${weighted_sum.toFixed(3)}, scaled to 50: ${computedTotal}`);
      }
      console.log("---");
  });

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => console.error(err));
