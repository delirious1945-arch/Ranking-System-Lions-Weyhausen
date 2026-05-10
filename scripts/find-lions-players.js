const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function findLionsPlayerNames() {
    const events = [
        { eventId: 247, phaseId: 231, teamId: 5415, name: "Lions Weyhausen A" },
        { eventId: 251, phaseId: 235, teamId: 7492, name: "Lions Weyhausen B" },
    ];
    
    const lionsPlayerNames = new Set();
    
    for (const ev of events) {
        // Get encounters to find which players belong to Lions
        const roundUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${ev.eventId}/phase/${ev.phaseId}/round/0`;
        const roundRes = await fetch(roundUrl, { headers: HEADERS });
        const roundData = await roundRes.json();
        
        const lionsEncounters = roundData.matches.filter(m => {
            return m.statusCd === 'FINISH' && 
                (m.participantHome?.id === ev.teamId || m.participantGuest?.id === ev.teamId);
        });
        
        console.log(`[${ev.name}] Processing ${lionsEncounters.length} finished encounters...`);
        
        for (const enc of lionsEncounters) {
            const isHome = enc.participantHome?.id === ev.teamId;
            const reportUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${ev.eventId}/match/${enc.id}/report`;
            const reportRes = await fetch(reportUrl, { headers: HEADERS });
            const reportData = await reportRes.json();
            const games = Array.isArray(reportData) ? reportData : (reportData.matchReportRows || []);
            
            for (const game of games) {
                const player = isHome ? game.participantHome : game.participantGuest;
                if (player && player.displayName) {
                    lionsPlayerNames.add(player.displayName);
                }
            }
        }
    }
    
    // Also explicitly add "Jens Goltermann" as requested
    // (In case he's in a different team or hasn't appeared in finished matches yet)
    // Actually, I'll filter for him in the final stats separately if needed, 
    // but adding him here ensures he's included in the map.
    lionsPlayerNames.add("Jens Goltermann");

    console.log(`\nFound ${lionsPlayerNames.size} Lions player names:`);
    const sortedNames = [...lionsPlayerNames].sort();
    for (const name of sortedNames) {
        console.log(`  "${name}"`);
    }
    
    return sortedNames;
}

findLionsPlayerNames();
