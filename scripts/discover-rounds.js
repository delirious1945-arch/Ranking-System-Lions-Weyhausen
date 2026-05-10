const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function discoverRounds() {
    const events = [247, 251, 239];
    for (const eventId of events) {
        console.log(`Discovering rounds for Event ${eventId}...`);
        const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/phase`;
        try {
            const res = await fetch(url, { headers: HEADERS });
            const phases = await res.json();
            for (const p of phases) {
                console.log(`Phase: ${p.id} - ${p.name}`);
                const rUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/phase/${p.id}/round`;
                const rRes = await fetch(rUrl, { headers: HEADERS });
                const rounds = await rRes.json();
                for (const r of rounds) {
                    console.log(`  Round: ${r.id} - ${r.name}`);
                }
            }
        } catch (e) {
            console.error(`Error for ${eventId}:`, e.message);
        }
    }
}

discoverRounds();
