async function investigate() {
    const matchRes = await fetch(`https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/match/466825`);
    const matchDetails = await matchRes.json();
    console.log(Object.keys(matchDetails));
    
    // Check if there are sets or games
    if (matchDetails.games) {
        console.log("Games array present, first element keys:");
        console.log(Object.keys(matchDetails.games[0]));
        if (matchDetails.games[0].performances) {
             console.log("Found performances inside game!");
        }
    }
}
investigate().catch(console.error);
