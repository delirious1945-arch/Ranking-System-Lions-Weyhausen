const { Client } = require('pg');
const connectionString = "postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const res = await client.query('SELECT * FROM "RankingConfig" WHERE id = 1');
    console.log(JSON.stringify(res.rows[0], null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
