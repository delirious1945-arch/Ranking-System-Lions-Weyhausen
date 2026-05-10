const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function findWorkingStats() {
    const eventId = 247;
    const encounterId = 462148;
    
    console.log("Finding working stats for Encounter 462148...");
    const reportUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/match/${encounterId}/report`;
    const reportRes = await fetch(reportUrl, { headers: HEADERS });
    const reportData = await reportRes.json();
    const games = Array.isArray(reportData) ? reportData : (reportData.matchReportRows || []);
    
    for (const g of games) {
        if (g.statusCd !== 'FINISH') continue;
        console.log(`Checking Game ${g.id} (${g.matchTypeCd})...`);
        const statsUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/match/${g.id}/statistics`;
        const statsRes = await fetch(statsUrl, { headers: HEADERS });
        const statsData = await statsRes.json();
        const summaries = Array.isArray(statsData) ? statsData : (statsData.statistics || statsData.matchSummaries || []);
        
        if (summaries && summaries.length > 0) {
            console.log(`SUCCESS! Found ${summaries.length} summaries for Game ${g.id}`);
            console.log("Sample summary:", JSON.stringify(summaries[0], null, 2));
            return;
        }
    }
    console.log("No stats found in any game of this encounter.");
}

findWorkingStats();
