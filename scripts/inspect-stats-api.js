// Check if the /statistics endpoint has per-player cumulative stats
// and check if there's a round-filter option
async function investigateStats() {
    // 1. Get statistics data and find a Weyhausen player
    const statsRes = await fetch("https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/statistics");
    const statsData = await statsRes.json();
    
    console.log("Total statistics entries:", statsData.length);
    
    // Filter for Weyhausen players (not doubles)
    const weyhausenStats = statsData.filter(s => 
        s.displayName && !s.displayName.includes('&') &&
        s.team && s.team.includes("Weyhausen")
    );
    
    // If team isn't in stat, check structure
    if (weyhausenStats.length === 0) {
        // Print first entry to see structure
        console.log("\nFirst stat entry structure:");
        console.log(JSON.stringify(statsData[0], null, 2));
        
        // Let's look for any field that could identify the team
        const sample = statsData.find(s => s.displayName && s.displayName.includes("Erik"));
        if (sample) {
            console.log("\nFound Erik entry:");
            console.log(JSON.stringify(sample, null, 2));
        }
    } else {
        console.log("\nWeyhausen stats found:", weyhausenStats.length);
        console.log(JSON.stringify(weyhausenStats[0], null, 2));
    }

    // 2. Try statistics with round filter
    const roundFilterUrls = [
        "https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/statistics?roundId=12853",
        "https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/statistics?round=15",
    ];
    
    for (const url of roundFilterUrls) {
        const res = await fetch(url);
        const data = await res.json();
        console.log(`\n${url} -> ${data.length || 'error'} entries`);
        if (Array.isArray(data) && data.length > 0 && data.length !== statsData.length) {
            console.log("  DIFFERENT count! This filter works!");
            console.log("  Sample:", JSON.stringify(data[0], null, 2));
        } else if (Array.isArray(data) && data.length === statsData.length) {
            console.log("  Same count as unfiltered - filter probably not applied");
        }
    }
    
    // 3. Check if each stat entry has a round/spieltag reference
    const hasRound = statsData.some(s => s.round || s.roundId || s.roundName || s.spieltag);
    console.log("\nStats have round/spieltag field?", hasRound);
    
    // 4. Let's check what keys are in the stat entries
    if (statsData.length > 0) {
        console.log("\nAll keys in a stat entry:", Object.keys(statsData[0]));
    }
}

investigateStats().catch(console.error);
