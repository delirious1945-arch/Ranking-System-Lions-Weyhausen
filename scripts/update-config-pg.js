const { Client } = require('pg');
const connectionString = 'postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1';

async function run() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to DB. Updating RankingConfig...');
        
        await client.query(`
            UPDATE "RankingConfig" 
            SET weight_k1 = 0.20,
                weight_k2 = 0.15,
                weight_k3 = 0.15,
                weight_k4 = 0.35,
                weight_k5 = 0.15,
                updated_at = NOW()
            WHERE id = 1;
        `);
        console.log('Update successful.');

        const res = await client.query('SELECT * FROM "RankingConfig" WHERE id = 1');
        console.log('New values:', res.rows[0]);
    } catch (e) { 
        console.error(e); 
    } finally { 
        await client.end(); 
    }
}
run();
