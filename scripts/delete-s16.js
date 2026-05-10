const { Client } = require('pg');

async function run() {
  const connectionString = 'postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to DB');
    
    // 1. Delete SnapshotPlayerValue records for Spieltag 16
    const deleteValues = await client.query(
      'DELETE FROM "SnapshotPlayerValue" WHERE snapshot_id IN (SELECT snapshot_id FROM "Snapshot" WHERE week_id = $1)',
      ['Spieltag 16']
    );
    console.log(`Deleted ${deleteValues.rowCount} SnapshotPlayerValue records`);
    
    // 2. Delete Snapshot records for Spieltag 16
    const deleteSnapshots = await client.query(
      'DELETE FROM "Snapshot" WHERE week_id = $1',
      ['Spieltag 16']
    );
    console.log(`Deleted ${deleteSnapshots.rowCount} Snapshot records`);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
