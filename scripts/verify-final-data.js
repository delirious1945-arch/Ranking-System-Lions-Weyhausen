const { Client } = require('pg');

async function run() {
  const connectionString = 'postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    const sidRes = await client.query('SELECT snapshot_id FROM "Snapshot" WHERE week_id = \'Spieltag 16\' ORDER BY timestamp DESC LIMIT 1');
    if (sidRes.rows.length > 0) {
      const sid = sidRes.rows[0].snapshot_id;
      const players = await client.query('SELECT player_name, rank, total_points FROM "SnapshotPlayerValue" WHERE snapshot_id = $1 ORDER BY rank ASC', [sid]);
      console.log('Spieltag 16 Players:');
      console.table(players.rows);
    } else {
      console.log('Spieltag 16 not found');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
