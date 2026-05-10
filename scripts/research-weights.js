const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres' });

async function research() {
    try {
        await c.connect();
        console.log('--- RESEARCH: S15 DATA ---');
        const res = await c.query(`
            SELECT player_name, points_k1, points_k2, points_k3, points_k4, points_k5, total_points 
            FROM "SnapshotPlayerValue" spv 
            JOIN "Snapshot" s ON s.snapshot_id = spv.snapshot_id 
            WHERE s.week_id = 'Spieltag 15' 
            LIMIT 3
        `);
        console.log('Spieltag 15 Samples:');
        console.log(JSON.stringify(res.rows, null, 2));

        console.log('\n--- RESEARCH: RankingConfig ---');
        const config = await c.query('SELECT * FROM "RankingConfig" WHERE id = 1');
        console.log('Current RankingConfig:');
        console.log(JSON.stringify(config.rows[0], null, 2));

        console.log('\n--- RESEARCH: MatchRecord Count ---');
        const count = await c.query('SELECT count(*) FROM "MatchRecord"');
        console.log('Total MatchRecords in DB:', count.rows[0].count);

    } catch (e) {
        console.error('Research failed:', e);
    } finally {
        await c.end();
    }
}

research();
