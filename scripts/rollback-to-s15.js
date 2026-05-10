const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres' });

async function reset() {
    try {
        await c.connect();
        console.log('Verbunden mit DB. Suche heutige Änderungen (2026-04-12)...');

        // 1. Finde Snapshots von heute
        const findToday = `
            SELECT snapshot_id, week_id, timestamp 
            FROM "Snapshot" 
            WHERE timestamp >= '2026-04-12 00:00:00'
        `;
        const res = await c.query(findToday);
        const ids = res.rows.map(r => r.snapshot_id);

        if (ids.length === 0) {
            console.log('Keine neuen Snapshots von heute gefunden.');
        } else {
            console.log(`Lösche ${ids.length} Snapshots von heute...`);
            // 2. Lösche zugehörige PlayerValues
            await c.query('DELETE FROM "SnapshotPlayerValue" WHERE snapshot_id = ANY($1)', [ids]);
            // 3. Lösche Snapshots
            await c.query('DELETE FROM "Snapshot" WHERE snapshot_id = ANY($1)', [ids]);
            console.log('Snapshots erfolgreich entfernt.');
        }

        // 4. Setze Gewichtung zurück auf 20/15/15/25/25 (Stand Spieltag 15)
        console.log('Setze Gewichtung auf 20/15/15/25/25 zurück...');
        await c.query(`
            UPDATE "RankingConfig" 
            SET weight_k1 = 0.20, 
                weight_k2 = 0.15, 
                weight_k3 = 0.15, 
                weight_k4 = 0.25, 
                weight_k5 = 0.25 
            WHERE id = 1
        `);
        console.log('Gewichtung zurückgesetzt.');

    } catch (e) {
        console.error('Fehler beim Reset:', e);
    } finally {
        await c.end();
    }
}

reset();
