// Phase 230 seems to be a default/wrong one. Let's try more phase IDs
async function findPhases() {
    const events = [
        { id: 247, name: "Lions A", knownTeam: "Lions Weyhausen A" },
        { id: 251, name: "Lions B", knownTeam: "Lions Weyhausen B", knownPhase: 235 },
        { id: 239, name: "Jens", knownTeam: "Jens Goltermann" }
    ];
    
    for (const event of events) {
        console.log(`\n=== Event ${event.id} (${event.name}) ===`);
        
        // Try phases 220-250
        for (let phaseId = 220; phaseId <= 260; phaseId++) {
            try {
                const matchRes = await fetch(`https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${event.id}/phase/${phaseId}/round/0`);
                if (!matchRes.ok) continue;
                const matchData = await matchRes.json();
                if (!matchData.matches || matchData.matches.length === 0) continue;
                
                // Check if our team is in this phase
                const hasOurTeam = matchData.matches.some(m => {
                    const home = m.participantHome?.displayName || "";
                    const guest = m.participantGuest?.displayName || "";
                    return home.includes("Weyhausen") || guest.includes("Weyhausen") || 
                           home.includes("Goltermann") || guest.includes("Goltermann");
                });
                
                if (hasOurTeam) {
                    const teams = new Set();
                    matchData.matches.forEach(m => {
                        if (m.participantHome?.displayName) teams.add(m.participantHome.displayName);
                        if (m.participantGuest?.displayName) teams.add(m.participantGuest.displayName);
                    });
                    console.log(`  ✅ Phase ${phaseId}: ${matchData.matches.length} matches, Teams: ${[...teams].filter(t => t.includes("Weyhausen") || t.includes("Goltermann"))}`);
                }
            } catch(e) {
                // ignore
            }
        }
    }
}

findPhases().catch(console.error);
