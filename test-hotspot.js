const fetch = require('node-fetch');

async function testConnection() {
    const url = "https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/247/phase/231/round/0";
    console.log("Testing connection to 3k-darts API via Hotspot...");
    try {
        const res = await fetch(url, { timeout: 10000 });
        console.log("Status:", res.status);
        if (res.ok) {
            const data = await res.json();
            console.log("Success! Found matches:", data.matches?.length);
        } else {
            console.log("Response not OK:", res.statusText);
        }
    } catch (e) {
        console.error("Connection failed:", e.message);
    }
}

testConnection();
