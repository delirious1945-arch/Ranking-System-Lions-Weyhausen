const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function inspectGameInReport() {
    const eventId = 247;
    const encounterId = 462148;
    
    const reportUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/match/${encounterId}/report`;
    const reportRes = await fetch(reportUrl, { headers: HEADERS });
    const reportData = await reportRes.json();
    const games = Array.isArray(reportData) ? reportData : (reportData.matchReportRows || []);
    
    if (games.length > 0) {
        const finished = games.find(g => g.statusCd === 'FINISH');
        console.log("Found finished game:", JSON.stringify(finished, null, 2));
    }
}

inspectGameInReport();
