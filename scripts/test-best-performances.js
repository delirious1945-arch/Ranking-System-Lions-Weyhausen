const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function testBestPerformances() {
    const eventId = 247;
    console.log("Testing BestPerformances API for Event 247...");
    const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/bestperformances`;
    
    const res = await fetch(url, { headers: HEADERS });
    console.log("Status:", res.status);
    if (res.ok) {
        const data = await res.json();
        console.log("Success! Data structure keys:", Object.keys(data));
        // Check if there is data
        const list = Array.isArray(data) ? data : (data.bestPerformances || data.performances || []);
        console.log("Found items:", list.length);
        if (list.length > 0) {
            console.log("Sample:", JSON.stringify(list[0], null, 2));
        }
    } else {
        console.log("Failed:", res.statusText);
    }
}

testBestPerformances();
