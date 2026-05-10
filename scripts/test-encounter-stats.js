const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function testEncounterStats() {
    const eventId = 247;
    const encounterId = 462148;
    
    console.log("Testing Encounter-level statistics for 462148...");
    const statsUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/match/${encounterId}/statistics`;
    const statsRes = await fetch(statsUrl, { headers: HEADERS });
    const statsData = await statsRes.json();
    
    const summaries = Array.isArray(statsData) ? statsData : (statsData.statistics || statsData.matchSummaries || statsData.participantSummaries || []);
    
    if (summaries && summaries.length > 0) {
        console.log(`SUCCESS! Found ${summaries.length} summaries at Encounter level.`);
        // Note: These might be team-level summaries, let's see
        console.log("Sample summary:", JSON.stringify(summaries[0], null, 2));
    } else {
        console.log("Still no stats at encounter level. Data dump:", JSON.stringify(statsData));
    }
}

testEncounterStats();
