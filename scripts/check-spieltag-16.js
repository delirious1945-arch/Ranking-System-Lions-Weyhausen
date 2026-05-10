const { Client } = require('pg');
const connectionString = "postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const totalMatch = await client.query('SELECT COUNT(*) FROM "MatchRecord"');
    const spieltag16Match = await client.query('SELECT COUNT(*) FROM "MatchRecord" WHERE spieltag = 16');
    const manualGames = await client.query('SELECT week_id, COUNT(*) FROM "ManualGame" GROUP BY week_id');
    const snapshots = await client.query('SELECT week_id, timestamp FROM "Snapshot" ORDER BY timestamp DESC LIMIT 5');

    console.log('--- DB STATE ---');
    console.log('Total MatchRecords:', totalMatch.rows[0].count);
    console.log('MatchRecords Spieltag 16:', spieltag16Match.rows[0].count);
    console.log('ManualGames by week_id:', manualGames.rows);
    console.log('Recent Snapshots:', snapshots.rows);
    console.log('----------------');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
