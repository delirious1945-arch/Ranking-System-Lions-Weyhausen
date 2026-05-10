const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function findWeyhausenTeamIds() {
    // Check event 247 (Lions A) - get group/participants to find team IDs
    const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/247/phase/231/round/0`;
    const res = await fetch(url, { headers: HEADERS });
    const data = await res.json();
    
    const teams = new Map();
    for (const m of data.matches) {
        if (m.participantHome) {
            teams.set(m.participantHome.id, m.participantHome.displayName);
        }
        if (m.participantGuest) {
            teams.set(m.participantGuest.id, m.participantGuest.displayName);
        }
    }
    
    console.log("=== All Teams in Event 247 ===");
    for (const [id, name] of teams) {
        const marker = name.includes("Weyhausen") ? " *** LIONS ***" : "";
        console.log(`  ID: ${id} -> ${name}${marker}`);
    }
    
    // Now check event 251 (Lions B)
    const url2 = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/phase/235/round/0`;
    const res2 = await fetch(url2, { headers: HEADERS });
    const data2 = await res2.json();
    
    const teams2 = new Map();
    for (const m of data2.matches) {
        if (m.participantHome) teams2.set(m.participantHome.id, m.participantHome.displayName);
        if (m.participantGuest) teams2.set(m.participantGuest.id, m.participantGuest.displayName);
    }
    
    console.log("\n=== All Teams in Event 251 ===");
    for (const [id, name] of teams2) {
        const marker = name.includes("Weyhausen") ? " *** LIONS ***" : "";
        console.log(`  ID: ${id} -> ${name}${marker}`);
    }
}

findWeyhausenTeamIds();
