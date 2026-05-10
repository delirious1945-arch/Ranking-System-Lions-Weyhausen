const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres' });

async function update() {
    try {
        await c.connect();
        const query = `
            UPDATE "RankingConfig" 
            SET weight_k1 = 0.20, 
                weight_k2 = 0.10, 
                weight_k3 = 0.10, 
                weight_k4 = 0.35, 
                weight_k5 = 0.25 
            WHERE id = 1
        `;
        await c.query(query);
        console.log('Gewichtung in DB erfolgreich auf 20/10/10/35/25 aktualisiert.');
    } catch (e) {
        console.error('Fehler beim Update:', e);
    } finally {
        await c.end();
    }
}

update();
