async function investigate() {
    const res = await fetch("https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/phase/235");
    const phaseData = await res.json();
    
    const rounds = phaseData.rounds;
    const r17 = rounds.find(r => r.name === "Spieltag 17");
    
    const roundRes = await fetch(`https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/phase/235/round/${r17.id}`);
    const roundData = await roundRes.json();
    
    for (const match of roundData.matches) {
        if (match.teamHome && match.teamAway && (match.teamHome.name.includes("Weyhausen") || match.teamAway.name.includes("Weyhausen"))) {
            console.log(`- ${match.teamHome.name} vs ${match.teamAway.name} (Match ID: ${match.id}) - Status: ${match.statusCd}`);
            if (match.statusCd === 'FINISHED') {
                const matchRes = await fetch(`https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/match/${match.id}`);
                const matchDetails = await matchRes.json();
                
                if (matchDetails.performances && matchDetails.performances.length > 0) {
                     console.log("Sample performance:", matchDetails.performances[0]);
                }
            }
        }
    }
}
investigate().catch(console.error);
