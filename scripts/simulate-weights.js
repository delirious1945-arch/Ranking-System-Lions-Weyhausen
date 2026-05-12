const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const manualAttendance = {
    "Sebastian Kirste": 100, "Timo Feuerhahn": 50, "Jens Goltermann": 100, "Erik Schremmer": 54.54,
    "Nicholas Stedman": 93.8, "Kevin Emde": 68.8, "Maik Feuerhahn": 37.5, "Dirk Ostermann": 87.5,
    "Jannik Baier": 63.63, "Michael Kranz": 81.3, "André Rathje": 93.8, "Michael Gehrt": 87.5,
    "Karen Schulz": 50, "Jochen Michael": 100, "Joachim Koch": 31.3, "Martin Wolnik": 31.3,
    "Malte Wolnik": 18.8, "Karsten Kohnert": 31.3, "Uwe Kohnert": 0
};

function getMult(name) {
  const pct = manualAttendance[name] || 0;
  if (pct >= 85) return 1.5;
  if (pct >= 70) return 1.3;
  if (pct >= 50) return 1.2;
  return 1.0;
}

const currentWeights = { k1: 0.20, k2: 0.15, k3: 0.15, k4: 0.35, k5: 0.15 };
const proposedWeights = { k1: 0.20, k2: 0.10, k3: 0.10, k4: 0.45, k5: 0.15 };

async function simulate() {
  const res = await pool.query('SELECT * FROM "SnapshotPlayerValue"');
  const players = res.rows;

  const results = players.map(p => {
    const mult = getMult(p.player_name);
    const pk1 = p.points_k1;
    const pk2 = p.points_k2;
    const pk3 = p.points_k3;
    const pk4 = p.points_k4;
    const pk5 = p.points_k5;

    const calc = (w) => Math.round(((pk1*w.k1) + (pk2*w.k2) + (pk3*w.k3) + ((pk4*mult)*w.k4) + (pk5*w.k5)) * 5 * 100) / 100;

    return {
      name: p.player_name,
      current: calc(currentWeights),
      proposed: calc(proposedWeights)
    };
  });

  // Sort by proposed
  results.sort((a, b) => b.proposed - a.proposed);
  
  // Also calculate current rank for comparison
  const currentSorted = [...results].sort((a, b) => b.current - a.current);
  results.forEach(r => {
    r.oldRank = currentSorted.findIndex(x => x.name === r.name) + 1;
  });

  console.log('| Rang (Neu) | Spieler | Punkte Alt | Punkte Neu | Diff | Rang Alt |');
  console.log('|---|---|---|---|---|---|');
  results.slice(0, 15).forEach((r, i) => {
    const diff = (r.proposed - r.current).toFixed(2);
    console.log(`| ${i+1} | ${r.name} | ${r.current.toFixed(2)} | ${r.proposed.toFixed(2)} | ${diff > 0 ? '+' : ''}${diff} | ${r.oldRank} |`);
  });

  pool.end();
}

simulate();
