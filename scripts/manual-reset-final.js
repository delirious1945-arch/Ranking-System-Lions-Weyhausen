const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PLAYER_LIST = [
  "Jens Goltermann", "Michael Gehrt", "Dirk Ostermann", "Sebastian Kirste", 
  "Nicholas Stedman", "Kevin Emde", "Timo Feuerhahn", "Martin Wolnik", 
  "André Rathje", "Erik Schremmer", "Maik Feuerhahn", "Michael Kranz", 
  "Jannik Baier", "Karen Schulz", "Jochen Michael", "Uwe Kohnert", 
  "Malte Wolnik", "Joachim Koch", "Karsten Kohnert"
];

async function reset() {
  try {
    console.log("Lösche alte Snapshot-Daten...");
    await prisma.snapshotPlayerValue.deleteMany({});
    await prisma.snapshot.deleteMany({});

    console.log("Erstelle neuen Snapshot: Saison 2025/26 - FINAL");
    const snap = await prisma.snapshot.create({
      data: {
        week_id: "Saison 2025/26 - FINAL",
        timestamp: new Date()
      }
    });

    console.log(`Lege ${PLAYER_LIST.length} Spieler an...`);
    for (let i = 0; i < PLAYER_LIST.length; i++) {
      const name = PLAYER_LIST[i];
      await prisma.snapshotPlayerValue.create({
        data: {
          snapshot_id: snap.snapshot_id,
          player_name: name,
          verein: "Lions Weyhausen",
          gespielte_single_spiele: 0,
          gespielte_legs: 0,
          avg_total: 0,
          avg_9: 0,
          avg_18: 0,
          wins: 0,
          games_played: 0,
          siegequote_pct: 0,
          cnt_80: 0,
          cnt_100: 0,
          cnt_140: 0,
          cnt_180: 0,
          sum_high_scores: 0,
          avg_high_per_leg: 0,
          points_k1: 0,
          points_k2: 0,
          points_k3: 0,
          points_k4: 0,
          points_k5: 0,
          total_points: 0,
          rank: i + 1,
          source: "Manuelle Liste"
        }
      });
    }

    console.log("ERFOLG: Tabelle wurde geleert und deine 19 Spieler wurden mit Nullwerten angelegt.");
    process.exit(0);
  } catch (e) {
    console.error("FEHLER BEIM RESET:", e);
    process.exit(1);
  }
}

reset();
