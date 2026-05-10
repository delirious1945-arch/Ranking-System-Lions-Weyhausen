const { Client } = require('pg');
const connectionString = "postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const s15 = await client.query('SELECT player_name, total_points, rank, avg_total, siegequote_pct, points_k1, points_k2, points_k3, points_k4, points_k5 FROM "SnapshotPlayerValue" WHERE snapshot_id = (SELECT snapshot_id FROM "Snapshot" WHERE week_id = \'Spieltag 15\' LIMIT 1) ORDER BY rank ASC LIMIT 5');
    const s16 = await client.query('SELECT player_name, total_points, rank, avg_total, siegequote_pct, points_k1, points_k2, points_k3, points_k4, points_k5 FROM "SnapshotPlayerValue" WHERE snapshot_id = (SELECT snapshot_id FROM "Snapshot" WHERE week_id = \'Spieltag 16\' LIMIT 1) ORDER BY rank ASC LIMIT 5');

    console.log('--- SPIELTAG 15 TOP 5 ---');
    console.table(s15.rows);
    console.log('--- SPIELTAG 16 TOP 5 ---');
    console.table(s16.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
