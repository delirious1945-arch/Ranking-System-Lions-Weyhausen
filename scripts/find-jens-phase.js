async function findJensPhase() {
    const eventId = 239;
    const teamName = "Jens Goltermann";
    
    console.log(`Scanning phases for Event ${eventId}...`);
    for (let phaseId = 150; phaseId <= 300; phaseId++) {
        try {
            const res = await fetch(`https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/phase/${phaseId}/round/0`);
            if (!res.ok) continue;
            const data = await res.json();
            if (!data.matches) continue;
            
            const hasJens = data.matches.some(m => 
                (m.participantHome?.displayName || "").includes(teamName) || 
                (m.participantGuest?.displayName || "").includes(teamName)
            );
            
            if (hasJens) {
                console.log(`FOUND JENS! Event 239 -> Phase ${phaseId}`);
                return;
            }
        } catch (e) {}
    }
    console.log("No phase found for Jens in range 150-300.");
}
findJensPhase().catch(console.error);
