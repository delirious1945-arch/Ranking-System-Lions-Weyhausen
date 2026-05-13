const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

function calculatePointsK1toK3(avg) {
  if (!avg || avg <= 0) return 0;
  if (avg >= 100) return 100;
  if (avg <= 20) return 0;
  return Math.round((avg - 20) * 1.25);
}

function calculatePointsK4(winRate) {
  if (!winRate || winRate <= 0) return 0;
  return Math.min(100, Math.round(winRate));
}

function calculatePointsK5(highScorePerLeg) {
  if (!highScorePerLeg || highScorePerLeg <= 0) return 0;
  return Math.min(100, Math.round(highScorePerLeg * 100));
}

function calculateAttendanceMultiplier(name, playedDays) {
  const totalMatchdays = 16;
  const percentage = (playedDays / totalMatchdays) * 100;

  if (percentage >= 85) return 1.5;
  if (percentage >= 70) return 1.3;
  if (percentage >= 50) return 1.2;
  return 1.0;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('--- Starte Neuberechnung mit Anwesenheits-Faktor (1.5 / 1.3 / 1.2) ---');
    
    const config = await prisma.rankingConfig.findUnique({ where: { id: 1 } });

    const attendanceMap = {};
    const matchRecords = await prisma.matchRecord.findMany({ select: { playerName: true, spieltag: true } });
    matchRecords.forEach(mr => {
      if (!attendanceMap[mr.playerName]) attendanceMap[mr.playerName] = new Set();
      attendanceMap[mr.playerName].add(mr.spieltag);
    });
    const manualGames = await prisma.manualGame.findMany({ select: { player_name: true, date: true } });
    manualGames.forEach(mg => {
      if (!attendanceMap[mg.player_name]) attendanceMap[mg.player_name] = new Set();
      attendanceMap[mg.player_name].add(mg.date.toISOString().split('T')[0]);
    });

    const allValues = await prisma.snapshotPlayerValue.findMany();
    console.log(`${allValues.length} Einträge werden verarbeitet...`);

    for (const v of allValues) {
      const playedDays = attendanceMap[v.player_name] ? attendanceMap[v.player_name].size : 0;
      const multiplier = calculateAttendanceMultiplier(v.player_name, playedDays);

      const pk1 = calculatePointsK1toK3(v.avg_total);
      const pk2 = calculatePointsK1toK3(v.avg_9);
      const pk3 = calculatePointsK1toK3(v.avg_18);
      const pk4 = calculatePointsK4(v.siegequote_pct);
      const pk5 = calculatePointsK5(v.avg_high_per_leg);

      const weighted = 
        (pk1 * config.weight_k1) +
        (pk2 * config.weight_k2) +
        (pk3 * config.weight_k3) +
        ((pk4 * multiplier) * config.weight_k4) +
        (pk5 * config.weight_k5);

      // NO FACTOR 5 ANYMORE
      const newTotal = Math.round(weighted * 100) / 100;

      await prisma.snapshotPlayerValue.update({
        where: { id: v.id },
        data: {
          points_k1: pk1,
          points_k2: pk2,
          points_k3: pk3,
          points_k4: pk4, // Note: We store the raw points K4, the multiplier is in weighted sum
          points_k5: pk5,
          total_points: newTotal
        }
      });
    }

    const snapshots = await prisma.snapshot.findMany({ select: { snapshot_id: true } });
    for (const snap of snapshots) {
      const values = await prisma.snapshotPlayerValue.findMany({
        where: { snapshot_id: snap.snapshot_id },
        orderBy: [{ total_points: 'desc' }, { avg_total: 'desc' }]
      });
      for (let i = 0; i < values.length; i++) {
        await prisma.snapshotPlayerValue.update({
          where: { id: values[i].id },
          data: { rank: i + 1 }
        });
      }
    }
    console.log('--- Neuberechnung abgeschlossen ---');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
