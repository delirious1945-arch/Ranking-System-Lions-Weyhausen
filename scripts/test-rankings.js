const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function testRankingsApi() {
    const eventId = 247;
    
    console.log("Testing Rankings API for Event 247...");
    const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/report/performances`;
    // Some systems use 'performances' for high scores/averages
    
    const res = await fetch(url, { headers: HEADERS });
    console.log("Status:", res.status);
    if (res.ok) {
        const data = await res.json();
        console.log("Success! Data length:", Array.isArray(data) ? data.length : "Object");
        if (Array.isArray(data) && data.length > 0) {
            console.log("Sample:", JSON.stringify(data[0], null, 2));
        } else {
            console.log("Empty or non-array response:", JSON.stringify(data));
        }
    } else {
        console.log("Failed:", res.statusText);
        // Try another one: rankings
        const url2 = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/ranking`;
        console.log("Trying Ranking API:", url2);
        const res2 = await fetch(url2, { headers: HEADERS });
        if (res2.ok) {
            const data2 = await res2.json();
            console.log("Ranking Success! Data keys:", Object.keys(data2));
            console.log("Sample:", JSON.stringify(data2, (k,v) => k === 'rankingRows' ? v.slice(0,1) : v, 2));
        }
    }
}

testRankingsApi();
