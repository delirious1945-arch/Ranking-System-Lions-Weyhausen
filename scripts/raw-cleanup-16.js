const { Client } = require('pg');

const connectionString = "postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"; // Static URL for cleanup

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('--- CLEANUP START ---');

    // 1. SnapshotPlayerValues
    const res1 = await client.query(`
      DELETE FROM "SnapshotPlayerValue" 
      WHERE snapshot_id IN (SELECT snapshot_id FROM "Snapshot" WHERE week_id = 'Spieltag 16')
    `);
    console.log(`Deleted ${res1.rowCount} SnapshotPlayerValue records.`);

    // 2. Snapshots (Spieltag 16)
    const res2 = await client.query(`
      DELETE FROM "Snapshot" WHERE week_id = 'Spieltag 16'
    `);
    console.log(`Deleted ${res2.rowCount} Snapshot records (Spieltag 16).`);

    // 3. Snapshots (Saison Final)
    const res3 = await client.query(`
      DELETE FROM "Snapshot" WHERE week_id = 'Saison 2025/26 - Final'
    `);
    console.log(`Deleted ${res3.rowCount} Snapshot records (Saison Final).`);

    // 4. MatchRecords
    const res4 = await client.query(`
      DELETE FROM "MatchRecord" WHERE spieltag = 16
    `);
    console.log(`Deleted ${res4.rowCount} MatchRecord records.`);

    console.log('--- CLEANUP FINISHED ---');
  } catch (err) {
    console.error('Cleanup error:', err);
  } finally {
    await client.end();
  }
}

run();
