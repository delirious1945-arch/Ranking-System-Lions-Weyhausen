const { Client } = require('pg');
const connectionString = 'postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function run() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('--- DATABASE INSPECTION ---');
        
        const snaps = await client.query('SELECT * FROM "Snapshot" ORDER BY timestamp DESC');
        console.log('Snapshots count:', snaps.rowCount);
        snaps.rows.forEach(r => console.log(`  - ${r.week_id} (ID: ${r.snapshot_id}, Time: ${r.timestamp})`));

        const matches = await client.query('SELECT count(*) FROM "MatchRecord"');
        console.log('MatchRecords count:', matches.rows[0].count);

        const manual = await client.query('SELECT count(*) FROM "ManualGame"');
        console.log('ManualGames count:', manual.rows[0].count);

        const config = await client.query('SELECT * FROM "RankingConfig" WHERE id = 1');
        console.log('RankingConfig (ID=1):', config.rows[0]);

        const players = await client.query('SELECT count(*) FROM "SnapshotPlayerValue"');
        console.log('Total SnapshotPlayerValues:', players.rows[0].count);

    } catch (e) { console.error(e); } finally { await client.end(); }
}
run();
