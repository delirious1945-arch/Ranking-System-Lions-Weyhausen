// Get phase IDs for all 3 events
async function getPhaseIds() {
    const events = [
        { id: 247, name: "Lions A" },
        { id: 251, name: "Lions B" },
        { id: 239, name: "Jens Goltermann" }
    ];
    
    for (const event of events) {
        console.log(`\n=== Event ${event.id} (${event.name}) ===`);
        const res = await fetch(`https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${event.id}`);
        const data = await res.json();
        console.log(`  Name: ${data.event?.name}`);
        
        // Get phases
        const phasesRes = await fetch(`https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${event.id}/phases`);
        if (phasesRes.ok) {
            const phasesData = await phasesRes.json();
            console.log(`  Phases endpoint:`, JSON.stringify(phasesData).slice(0, 300));
        } else {
            // Try the event response - it might contain phase info
            console.log(`  /phases returned ${phasesRes.status}`);
        }
        
        // Check the event page HTML for the phase link pattern
        // Event 251 uses phase 235 - let's try some common phase IDs
        const possiblePhases = [230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240];
        for (const phaseId of possiblePhases) {
            const phaseRes = await fetch(`https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${event.id}/phase/${phaseId}`);
            if (phaseRes.ok) {
                const phaseData = await phaseRes.json();
                if (phaseData.rounds && phaseData.rounds.length > 0) {
                    console.log(`  ✅ Phase ${phaseId} found! Rounds: ${phaseData.rounds.length}, First: ${phaseData.rounds[0].name}`);
                    
                    // Get matches for this event to find our teams
                    const matchRes = await fetch(`https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${event.id}/phase/${phaseId}/round/0`);
                    if (matchRes.ok) {
                        const matchData = await matchRes.json();
                        const teams = new Set();
                        for (const m of matchData.matches || []) {
                            if (m.participantHome?.displayName) teams.add(m.participantHome.displayName);
                            if (m.participantGuest?.displayName) teams.add(m.participantGuest.displayName);
                        }
                        console.log(`  Teams in this event:`, [...teams].sort());
                    }
                    break;
                }
            }
        }
    }
}

getPhaseIds().catch(console.error);
