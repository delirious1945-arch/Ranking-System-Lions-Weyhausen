const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function debugEncounter() {
    const eventId = 247;
    const encounterId = 462148;
    
    // 1. Get encounter report
    const reportUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/match/${encounterId}/report`;
    const reportRes = await fetch(reportUrl, { headers: HEADERS });
    const reportData = await reportRes.json();
    const games = Array.isArray(reportData) ? reportData : (reportData.matchReportRows || []);
    
    console.log(`Total games in encounter: ${games.length}`);
    
    // Show status of first 3 games
    for (let i = 0; i < Math.min(3, games.length); i++) {
        const g = games[i];
        console.log(`\nGame ${i}: ID=${g.id}, statusCd=${g.statusCd}, matchTypeCd=${g.matchTypeCd}`);
        
        // Check what keys are available
        const keys = Object.keys(g);
        console.log(`  Keys: ${keys.join(', ')}`);
        
        // Check participants
        if (g.participants) {
            for (const p of g.participants) {
                console.log(`  Participant: ${p.displayName || p.name || JSON.stringify(p).slice(0,100)}`);
            }
        }
        if (g.participantHome) console.log(`  Home: ${g.participantHome.displayName}`);
        if (g.participantGuest) console.log(`  Guest: ${g.participantGuest.displayName}`);
        
        // Check for result/score
        if (g.result) console.log(`  Result: ${JSON.stringify(g.result)}`);
        if (g.scoreHome !== undefined) console.log(`  Score: ${g.scoreHome} - ${g.scoreGuest}`);
        if (g.legsWon !== undefined) console.log(`  Legs: ${g.legsWon} - ${g.legsLost}`);
        if (g.tableWon !== undefined) console.log(`  TableWon: ${g.tableWon}, TableLost: ${g.tableLost}`);
        
        // Try statistics for this game
        const statsUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/match/${g.id}/statistics`;
        const statsRes = await fetch(statsUrl, { headers: HEADERS });
        const statsData = await statsRes.json();
        const statsArr = Array.isArray(statsData) ? statsData : (statsData.statistics || []);
        console.log(`  Statistics entries: ${statsArr.length}`);
        if (statsArr.length > 0) {
            console.log(`  Stats sample keys: ${Object.keys(statsArr[0]).join(', ')}`);
            console.log(`  Stats[0] displayName: ${statsArr[0].displayName}`);
            console.log(`  Stats[0] type: ${statsArr[0].type}`);
        }
    }
    
    // 2. Also try the encounter-level statistics
    console.log(`\n--- Encounter-level stats ---`);
    const eStatsUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/match/${encounterId}/statistics`;
    const eStatsRes = await fetch(eStatsUrl, { headers: HEADERS });
    const eStatsData = await eStatsRes.json();
    console.log("Encounter stats raw keys:", Object.keys(eStatsData));
    const eArr = Array.isArray(eStatsData) ? eStatsData : (eStatsData.statistics || []);
    console.log("Encounter stats entries:", eArr.length);
    
    // 3. Try the encounter detail endpoint
    console.log(`\n--- Encounter detail ---`);
    const detailUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/encounter/${encounterId}`;
    const detailRes = await fetch(detailUrl, { headers: HEADERS });
    const detailData = await detailRes.json();
    console.log("Detail keys:", Object.keys(detailData));
    if (detailData.performances) console.log("Performances:", detailData.performances.length);
    if (detailData.matchSummary) console.log("matchSummary:", JSON.stringify(detailData.matchSummary).slice(0, 200));
}

debugEncounter();
