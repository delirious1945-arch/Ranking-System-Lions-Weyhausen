const { Client } = require('pg');

async function run() {
  const connectionString = 'postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    const mrView = await client.query('SELECT COUNT(*) FROM information_schema.views WHERE table_name = \'MatchRecord\'');
    console.log('Is MatchRecord a view?', mrView.rows[0].count > 0);

    const mrCount = await client.query('SELECT COUNT(*) FROM "MatchRecord"');
    console.log('MatchRecord count:', mrCount.rows[0].count);

    const mgCount = await client.query('SELECT COUNT(*) FROM "ManualGame"');
    console.log('ManualGame count:', mgCount.rows[0].count);

    const sCount = await client.query('SELECT COUNT(*) FROM "Snapshot"');
    console.log('Snapshot count:', sCount.rows[0].count);

    const svCount = await client.query('SELECT COUNT(*) FROM "SnapshotPlayerValue"');
    console.log('SnapshotPlayerValue count:', svCount.rows[0].count);

    if (mrCount.rows[0].count === '0') {
        process.exit(1);
    }
    
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
