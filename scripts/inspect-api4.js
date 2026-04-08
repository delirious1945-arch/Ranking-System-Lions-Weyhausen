async function investigate() {
    const url = "https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/phase/235/round/0";
    const roundRes = await fetch(url);
    const roundData = await roundRes.json();
    
    console.log("Found", roundData.matches?.length || 0, "matches in /round/0");
    if (roundData.matches && roundData.matches.length > 0) {
        // Just print the first match object
        console.log(JSON.stringify(roundData.matches[0], null, 2));
    }
}
investigate().catch(console.error);
