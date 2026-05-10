async function investigate() {
    const url = "https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/phase/235/round/0";
    const roundRes = await fetch(url);
    const roundData = await roundRes.json();
    
    for (const match of roundData.matches) {
        const home = match.participantHome?.displayName || "";
        const guest = match.participantGuest?.displayName || "";
        
        if ((home.includes("Weyhausen") || guest.includes("Weyhausen")) && match.statusCd === 'FINISH') {
            console.log(`Found match: ${home} vs ${guest} (ID: ${match.id})`);
            
            const matchRes = await fetch(`https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/match/${match.id}`);
            const matchDetails = await matchRes.json();
            
            console.log("Match has performances?", matchDetails.hasPerformances);
            if (matchDetails.performances && matchDetails.performances.length > 0) {
                console.log(JSON.stringify(matchDetails.performances[0], null, 2));
            } else {
                 console.log("No performances array found in this match data.");
            }
            break; // just check one
        }
    }
}
investigate().catch(console.error);
