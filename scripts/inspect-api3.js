async function investigate() {
    const res = await fetch("https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/all");
    const eventData = await res.json();
    
    // Actually the easiest way to get all matches is to fetch them by team ID
    // Team B is in event 251.
    // We can just fetch the group schedule.
    
    const url = "https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/phase/235/round/0";
    const roundRes = await fetch(url);
    const roundData = await roundRes.json();
    
    for (const match of roundData.matches) {
        if (match.teamHome && match.teamAway && (match.teamHome.name.includes("Weyhausen") || match.teamAway.name.includes("Weyhausen"))) {
            console.log(`- ${match.round.name}: ${match.teamHome.name} vs ${match.teamAway.name} (Match ID: ${match.id}) - Status: ${match.statusCd}`);
            if (match.statusCd === 'FINISHED') {
                const matchRes = await fetch(`https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/match/${match.id}`);
                const matchDetails = await matchRes.json();
                
                if (matchDetails.performances && matchDetails.performances.length > 0) {
                     console.log("Sample performance from Match:");
                     console.log(matchDetails.performances[0]);
                     break; // Just need one sample
                }
            }
        }
    }
}
investigate().catch(console.error);
