async function checkMatchReportDetail() {
    const encounterId = 466825; // FireDarter C vs Lions Weyhausen B
    const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/match/${encounterId}/report`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    // Sometimes the keys are 'matchReportRows'
    const rows = data.matchReportRows || Object.values(data);
    console.log("Number of rows:", rows.length);
    
    // Look for a row that has a 'game' or 'matchmode' or 'participant'
    const rowWithGame = rows.find(r => r.game || r.participantHome || r.match);
    if (rowWithGame) {
        console.log("Sample Row Structure:", JSON.stringify(rowWithGame, null, 2).slice(0, 500));
    } else {
        console.log("No specific row with game found. Let's see the first row keys:", Object.keys(rows[0] || {}));
    }
}
checkMatchReportDetail().catch(console.error);
