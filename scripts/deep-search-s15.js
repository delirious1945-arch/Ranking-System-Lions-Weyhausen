const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres' });

async function search() {
    try {
        await c.connect();
        
        console.log('Searching for any snapshot with 15...');
        const res = await c.query("SELECT * FROM \"Snapshot\" WHERE week_id ILIKE '%15%'");
        console.log('Results:', res.rows);

        console.log('\nListing all unique week_id values from SnapshotPlayerValue...');
        // Note: SnapshotPlayerValue doesn't have week_id, it is joined to Snapshot.
        // Let's just list all week_ids from Snapshot again to be absolutely sure.
        const allWeeks = await c.query('SELECT DISTINCT week_id FROM "Snapshot"');
        console.log('Distinct weeks in Snapshot table:', allWeeks.rows);

        const lastV = await c.query('SELECT week_id, timestamp FROM "Snapshot" ORDER BY timestamp DESC LIMIT 10');
        console.log('Last 10 Snapshots timestamps:');
        console.log(JSON.stringify(lastV.rows, null, 2));

    } catch (e) {
        console.error('Search failed:', e);
    } finally {
        await c.end();
    }
}

search();
