const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function dumpStats() {
    const eventId = 247;
    const gameId = 462282; // from previous output
    
    console.log("Dumping Statistics for Game 462282...");
    const statsUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/match/${gameId}/statistics`;
    const statsRes = await fetch(statsUrl, { headers: HEADERS });
    const statsData = await statsRes.json();
    
    console.log(JSON.stringify(statsData, null, 2));
}

dumpStats();
