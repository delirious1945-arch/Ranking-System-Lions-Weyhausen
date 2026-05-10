const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function listAllPlayers() {
    const events = [
        { eventId: 247, name: "Lions Weyhausen A" },
        { eventId: 251, name: "Lions Weyhausen B" },
        { eventId: 239, name: "Jens Goltermann (Wettmershagen)" },
    ];
    
    for (const ev of events) {
        console.log(`\n=== ${ev.name} (Event ${ev.eventId}) ===`);
        const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${ev.eventId}/statistics`;
        try {
            const res = await fetch(url, { headers: HEADERS });
            if (!res.ok) { console.log("Failed:", res.status); continue; }
            const data = await res.json();
            
            // Filter to MATCH type only (not LEG or SET)
            const matchStats = data.filter(s => s.type === 'MATCH');
            console.log(`Total MATCH entries: ${matchStats.length}`);
            
            for (const s of matchStats) {
                const avg = s.dartsTotal > 0 ? (s.scoreTotal / s.dartsTotal * 3).toFixed(1) : '0.0';
                const isDouble = s.displayName.includes('&');
                console.log(`  ${isDouble ? '[DOP] ' : '      '}${s.displayName}: avg=${avg}, games=${s.matchesTotal}, won=${s.matchesWon}, legs=${s.legCount}/${s.legCount + s.legCountOpponent}, 80+=${s.count80}, 100+=${s.count100}, 140+=${s.count140}, 180=${s.count180}`);
            }
        } catch (e) {
            console.error(`Error: ${e.message}`);
        }
    }
}

listAllPlayers();
