// Investigate the full schedule API for all 3 events
// Event 247 = Lions A, Event 251 = Lions B, Event 239 = Jens Goltermann

async function investigateSchedule() {
    // First, get the phase data for event 251 to see all Spieltage with their rounds
    const phaseRes = await fetch("https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/phase/235");
    const phaseData = await phaseRes.json();
    
    console.log("=== ROUNDS (Spieltage) for Event 251 (Lions B) ===");
    for (const round of phaseData.rounds) {
        console.log(`  ${round.name} (ID: ${round.id}) | ${round.dateFrom} - ${round.dateTo} | nameCd: ${round.nameCd}`);
    }

    // Now fetch ALL matches and group by Spieltag for Weyhausen B
    const matchRes = await fetch("https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/phase/235/round/0");
    const matchData = await matchRes.json();
    
    console.log("\n=== WEYHAUSEN B MATCHES BY SPIELTAG ===");
    const weyhausenMatches = matchData.matches.filter(m => 
        (m.participantHome?.displayName || "").includes("Weyhausen") || 
        (m.participantGuest?.displayName || "").includes("Weyhausen")
    );

    for (const m of weyhausenMatches) {
        const home = m.participantHome?.displayName || "BYE";
        const guest = m.participantGuest?.displayName || "BYE";
        const status = m.statusCd;
        const spieltag = m.round?.name || "???";
        const datePlanned = m.datePlanned || "no date";
        const endDate = m.endDate || "not finished";
        console.log(`  ${spieltag}: ${home} vs ${guest} | Status: ${status} | Planned: ${datePlanned} | End: ${endDate}`);
    }

    // Check how many Spieltage have ALL their matches finished
    console.log("\n=== SPIELTAG COMPLETION STATUS (ALL TEAMS) ===");
    const spieltagMap = {};
    for (const m of matchData.matches) {
        const st = m.round?.name;
        if (!st) continue;
        if (!spieltagMap[st]) spieltagMap[st] = { total: 0, finished: 0 };
        spieltagMap[st].total++;
        if (m.statusCd === 'FINISH') spieltagMap[st].finished++;
    }
    
    const sortedSpieltage = Object.entries(spieltagMap).sort((a, b) => {
        const numA = parseInt(a[0].replace(/\D/g, ''));
        const numB = parseInt(b[0].replace(/\D/g, ''));
        return numA - numB;
    });
    
    for (const [st, counts] of sortedSpieltage) {
        const allDone = counts.finished === counts.total;
        console.log(`  ${st}: ${counts.finished}/${counts.total} ${allDone ? '✅' : '⏳'}`);
    }

    // Now let's check if there's a per-round statistics endpoint
    console.log("\n=== TRYING PER-ROUND STATISTICS ENDPOINTS ===");
    
    // Try /statistics endpoint with round filter
    const statsUrls = [
        "https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/statistics",
        "https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/statistics/players",
        "https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/performances",
    ];
    
    for (const url of statsUrls) {
        try {
            const res = await fetch(url);
            const text = await res.text();
            const status = res.status;
            console.log(`  ${url} -> Status: ${status}, Body peek: ${text.slice(0, 200)}`);
        } catch (e) {
            console.log(`  ${url} -> ERROR: ${e.message}`);
        }
    }
}

investigateSchedule().catch(console.error);
