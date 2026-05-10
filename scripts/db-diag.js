const { Client } = require('pg');

async function run() {
  const connectionString = 'postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected');
    
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', tableRes.rows.map(r => r.table_name));
    
    const countRes = await client.query('SELECT COUNT(*) FROM "MatchRecord"');
    console.log('MatchRecord count:', countRes.rows[0].count);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
