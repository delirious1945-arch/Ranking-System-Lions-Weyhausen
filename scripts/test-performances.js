const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function testPerformancesEndpoint() {
    const eventId = 247;
    const encounterId = 462148;
    
    console.log("Testing Encounter Details (Performances) for 462148...");
    const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/match/${encounterId}`;
    
    const res = await fetch(url, { headers: HEADERS });
    const data = await res.json();
    
    console.log("Has Performances:", data.hasPerformances);
    if (data.performances && data.performances.length > 0) {
        console.log(`SUCCESS! Found ${data.performances.length} performances.`);
        console.log("Sample Performance:", JSON.stringify(data.performances[0], null, 2));
    } else {
        console.log("No performances in this endpoint either.");
    }
}

testPerformancesEndpoint();
