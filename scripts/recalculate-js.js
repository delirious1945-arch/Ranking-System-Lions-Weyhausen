const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

function getAvgPoints(avg) {
  if (!avg || avg < 25.0) return 0;
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

function getWinPoints(pct) {
  if (!pct || pct < 10.0) return 0;
  if (pct < 20.0) return 1;
  if (pct < 30.0) return 2;
  if (pct < 40.0) return 3;
  if (pct < 50.0) return 4;
  if (pct < 60.0) return 5;
  if (pct < 70.0) return 6;
  if (pct < 80.0) return 7;
  if (pct < 85.0) return 8;
  if (pct < 90.0) return 9;
  return 10;
}

function getHighPoints(val) {
  if (!val || val <= 0.20) return 0;
  if (val <= 0.40) return 1;
  if (val <= 0.60) return 2;
  if (val <= 0.80) return 3;
  if (val <= 1.00) return 4;
  if (val <= 1.20) return 5;
  if (val <= 1.40) return 6;
  if (val <= 1.60) return 7;
  if (val <= 1.80) return 8;
  if (val <= 2.00) return 9;
  return 10;
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
    console.log('--- Starte Neuberechnung gemäß NEUER LEGENDE (0-10 Pkt, Faktor 10) ---');
    
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
      // FIX for Erik and Jannik attendance as requested earlier
      let playedDays = attendanceMap[v.player_name] ? attendanceMap[v.player_name].size : 0;
      if (v.player_name === 'Erik Schremmer') playedDays = 10; // ~62%
      if (v.player_name === 'Jannik Baier') playedDays = 12; // ~75%

      const multiplier = calculateAttendanceMultiplier(v.player_name, playedDays);

      const pk1 = getAvgPoints(v.avg_total);
      const pk2 = getAvgPoints(v.avg_9);
      const pk3 = getAvgPoints(v.avg_18);
      const pk4 = getWinPoints(v.siegequote_pct);
      const pk5 = getHighPoints(v.avg_high_per_leg);

      const weighted = 
        (pk1 * config.weight_k1) +
        (pk2 * config.weight_k2) +
        (pk3 * config.weight_k3) +
        ((pk4 * multiplier) * config.weight_k4) +
        (pk5 * config.weight_k5);

      // Final total is weighted sum (0-10+) multiplied by 10
      const newTotal = Math.round(weighted * 10 * 100) / 100;

      await prisma.snapshotPlayerValue.update({
        where: { id: v.id },
        data: {
          points_k1: pk1,
          points_k2: pk2,
          points_k3: pk3,
          points_k4: pk4,
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
    console.log('--- Neuberechnung gemäß Legende abgeschlossen ---');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
