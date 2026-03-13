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

// Helper scoring formulas
function calculatePointsK1toK3(avg) {
  if (avg < 25.0) return 0;
  if (avg < 30.0) return 1;
  if (avg < 35.0) return 2;
  if (avg < 40.0) return 3;
  if (avg < 42.5) return 4;
  if (avg < 45.0) return 5;
  if (avg < 47.5) return 6;
  if (avg < 50.0) return 7;
  if (avg < 55.0) return 8;
  if (avg < 60.0) return 9;
  return 10;
}

function calculatePointsK4(winRatePct) {
  if (winRatePct < 10.0) return 0;
  if (winRatePct < 20.0) return 1;
  if (winRatePct < 30.0) return 2;
  if (winRatePct < 40.0) return 3;
  if (winRatePct < 50.0) return 4;
  if (winRatePct < 60.0) return 5;
  if (winRatePct < 70.0) return 6;
  if (winRatePct < 80.0) return 7;
  if (winRatePct < 85.0) return 8;
  if (winRatePct < 90.0) return 9;
  return 10;
}

function calculatePointsK5(avgHighPerLeg) {
  if (avgHighPerLeg <= 0.20) return 0;
  if (avgHighPerLeg <= 0.40) return 1;
  if (avgHighPerLeg <= 0.60) return 2;
  if (avgHighPerLeg <= 0.80) return 3;
  if (avgHighPerLeg <= 1.00) return 4;
  if (avgHighPerLeg <= 1.20) return 5;
  if (avgHighPerLeg <= 1.40) return 6;
  if (avgHighPerLeg <= 1.60) return 7;
  if (avgHighPerLeg <= 1.80) return 8;
  if (avgHighPerLeg <= 2.00) return 9;
  return 10;
}

async function main() {
  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  let config = await prisma.rankingConfig.findUnique({ where: { id: 1 } });
  if (!config) {
      config = {
          weight_k1: 0.20,
          weight_k2: 0.15,
          weight_k3: 0.15,
          weight_k4: 0.25,
          weight_k5: 0.25
      };
  }

  const allValues = await prisma.snapshotPlayerValue.findMany();
  let updatedCount = 0;

  for (const v of allValues) {
      const newK1 = calculatePointsK1toK3(v.avg_total);
      const newK2 = calculatePointsK1toK3(v.avg_9);
      const newK3 = calculatePointsK1toK3(v.avg_18);
      const newK4 = calculatePointsK4(v.siegequote_pct);
      const newK5 = calculatePointsK5(v.avg_high_per_leg);

      const weighted_sum =
          (newK1 * config.weight_k1) +
          (newK2 * config.weight_k2) +
          (newK3 * config.weight_k3) +
          (newK4 * config.weight_k4) +
          (newK5 * config.weight_k5);

      const newTotal = Math.round(weighted_sum * 5 * 100) / 100;

      if (
          v.points_k1 !== newK1 ||
          v.points_k2 !== newK2 ||
          v.points_k3 !== newK3 ||
          v.points_k4 !== newK4 ||
          v.points_k5 !== newK5 ||
          v.total_points !== newTotal
      ) {
          await prisma.snapshotPlayerValue.update({
              where: { id: v.id },
              data: {
                  points_k1: newK1,
                  points_k2: newK2,
                  points_k3: newK3,
                  points_k4: newK4,
                  points_k5: newK5,
                  total_points: newTotal,
              },
          });
          updatedCount++;
      }
  }

  console.log(`${updatedCount} Einträge wurden punktemäßig aktualisiert.`);

  // Rekalkuliere Ränge
  const snapshots = await prisma.snapshot.findMany({ select: { snapshot_id: true } });
  for (const snap of snapshots) {
      const values = await prisma.snapshotPlayerValue.findMany({
          where: { snapshot_id: snap.snapshot_id },
          orderBy: [
              { total_points: 'desc' },
              { avg_total: 'desc' }
          ],
      });

      for (let i = 0; i < values.length; i++) {
          const newRank = i + 1;
          if (values[i].rank !== newRank) {
              await prisma.snapshotPlayerValue.update({
                  where: { id: values[i].id },
                  data: { rank: newRank }
              });
          }
      }
  }

  console.log('--- Neuberechnung abgeschlossen ---');
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => console.error(err));
