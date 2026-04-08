async function checkGameStatistics() {
    const gameId = 466926; // Sascha Obermeier vs Karen Schulz
    const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/match/${gameId}/statistics`;
    
    console.log("Fetching Game Statistics:", url);
    const res = await fetch(url);
    const data = await res.json();
    
    console.log("Stats Keys:", Object.keys(data));
    console.log("Full Stats Data:");
    console.log(JSON.stringify(data, null, 2));
}
checkGameStatistics().catch(console.error);
