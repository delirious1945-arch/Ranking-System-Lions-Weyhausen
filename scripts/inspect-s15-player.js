const { Client } = require('pg');
const connectionString = "postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const res = await client.query('SELECT * FROM "SnapshotPlayerValue" WHERE snapshot_id = (SELECT snapshot_id FROM "Snapshot" WHERE week_id = \'Spieltag 15\' LIMIT 1) AND player_name = \'Sebastian Kirste\'');
    console.log(JSON.stringify(res.rows[0], null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
