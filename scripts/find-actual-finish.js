const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function findActualFinish() {
    const eventId = 247;
    const encounterId = 462148;
    
    const reportUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/match/${encounterId}/report`;
    const reportRes = await fetch(reportUrl, { headers: HEADERS });
    const reportData = await reportRes.json();
    const games = Array.isArray(reportData) ? reportData : (reportData.matchReportRows || []);
    
    const finishedGame = games.find(g => g.statusCd === 'FINISH');
    if (finishedGame) {
        console.log(`Found finished Game ID: ${finishedGame.id}`);
        const statsUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/match/${finishedGame.id}/statistics`;
        const statsRes = await fetch(statsUrl, { headers: HEADERS });
        const statsData = await statsRes.json();
        console.log("Stats found?", (statsData.statistics?.length || statsData.length || 0) > 0);
        if ((statsData.statistics?.length || statsData.length || 0) > 0) {
            console.log("DATA TYPE:", typeof statsData);
            console.log("SAMPLE:", JSON.stringify(statsData, null, 2));
        }
    } else {
        console.log("No finished games in this encounter report.");
    }
}

findActualFinish();
