const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres' });
async function check() {
    try {
        await c.connect();
        const res = await c.query('SELECT week_id, count(*) FROM "Snapshot" GROUP BY week_id ORDER BY week_id');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch(e) { console.error(e); } finally { await c.end(); }
}
check();
