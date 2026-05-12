const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Manual attendance percentages as provided by user
const manualAttendance = {
    "Sebastian Kirste": 100,
    "Timo Feuerhahn": 50,
    "Jens Goltermann": 100,
    "Erik Schremmer": 54.54,
    "Nicholas Stedman": 93.8,
    "Kevin Emde": 68.8,
    "Maik Feuerhahn": 37.5,
    "Dirk Ostermann": 87.5,
    "Jannik Baier": 63.63,
    "Michael Kranz": 81.3,
    "André Rathje": 93.8,
    "Michael Gehrt": 87.5,
    "Karen Schulz": 50,
    "Jochen Michael": 100,
    "Joachim Koch": 31.3,
    "Martin Wolnik": 31.3,
    "Malte Wolnik": 18.8,
    "Karsten Kohnert": 31.3,
    "Uwe Kohnert": 0
};

function calculateAttendanceMultiplierFromPct(pct) {
  if (pct >= 85) return 1.5;
  if (pct >= 70) return 1.3;
  if (pct >= 50) return 1.2;
  return 1.0;
}

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
  console.log('--- Starte Finale Neuberechnung mit manuellen Quoten ---');

  const configRes = await pool.query('SELECT * FROM "RankingConfig" WHERE id = 1');
  const config = configRes.rows[0] || { weight_k1: 0.2, weight_k2: 0.15, weight_k3: 0.15, weight_k4: 0.25, weight_k5: 0.25 };

  const valuesRes = await pool.query('SELECT * FROM "SnapshotPlayerValue"');
  for (const v of valuesRes.rows) {
    const pct = manualAttendance[v.player_name] || 0;
    const multiplier = calculateAttendanceMultiplierFromPct(pct);

    const pk1 = calculatePointsK1toK3(v.avg_total);
    const pk2 = calculatePointsK1toK3(v.avg_9);
    const pk3 = calculatePointsK1toK3(v.avg_18);
    const pk4 = calculatePointsK4(v.siegequote_pct);
    const pk5 = calculatePointsK5(v.avg_high_per_leg);

    const weightedSum = 
      (pk1 * config.weight_k1) +
      (pk2 * config.weight_k2) +
      (pk3 * config.weight_k3) +
      ((pk4 * multiplier) * config.weight_k4) +
      (pk5 * config.weight_k5);

    const totalPoints = Math.round(weightedSum * 5 * 100) / 100;
    
    console.log(`${v.player_name}: ${pct}% -> Multiplier ${multiplier} -> Points ${totalPoints}`);

    await pool.query(
      'UPDATE "SnapshotPlayerValue" SET points_k1=$1, points_k2=$2, points_k3=$3, points_k4=$4, points_k5=$5, total_points=$6 WHERE id=$7',
      [pk1, pk2, pk3, pk4, pk5, totalPoints, v.id]
    );
  }

  // 4. Recalculate Ranks
  const snapshotsRes = await pool.query('SELECT DISTINCT "snapshot_id" FROM "Snapshot"');
  for (const snap of snapshotsRes.rows) {
    const snapValues = await pool.query(
      'SELECT id FROM "SnapshotPlayerValue" WHERE snapshot_id=$1 ORDER BY total_points DESC, avg_total DESC',
      [snap.snapshot_id]
    );
    for (let i = 0; i < snapValues.rows.length; i++) {
      await pool.query('UPDATE "SnapshotPlayerValue" SET rank=$1 WHERE id=$2', [i + 1, snapValues.rows[i].id]);
    }
  }

  console.log('--- Fertig! ---');
}

main().catch(console.error).finally(() => pool.end());
