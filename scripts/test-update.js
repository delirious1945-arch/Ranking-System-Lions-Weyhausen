require('dotenv').config();

async function testUpdate() {
    console.log("Triggering Snapshot Update via API...");
    try {
        const res = await fetch("http://localhost:3000/api/update-snapshot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetWeekId: "Spieltag 15" })
        });
        
        if (!res.ok) {
            const err = await res.text();
            console.error("API Error:", err);
            return;
        }
        
        const data = await res.json();
        console.log("Update Success:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch Error (Is server running?):", e.message);
        console.log("Attempting to run MatchService directly instead...");
        
        // Manual fallback if server is not running
        const { updateMatchCache, getSnapshotStats } = require('../src/lib/match-service');
        await updateMatchCache();
        console.log("Match Cache Updated.");
    }
}

testUpdate().catch(console.error);
