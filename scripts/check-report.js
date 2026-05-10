async function checkMatchReport() {
    const encounterId = 466825; // FireDarter C vs Lions Weyhausen B
    const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/match/${encounterId}/report`;
    
    console.log("Fetching Match Report:", url);
    const res = await fetch(url);
    const data = await res.json();
    
    // Check if it has games or performances
    console.log("Report Keys:", Object.keys(data));
    
    // Usually 'rows' or 'games' or 'matchReportRows'
    if (data.matchReportRows) {
        console.log("Match Report Rows count:", data.matchReportRows.length);
        const firstRow = data.matchReportRows[0];
        console.log("First Row Sample:", JSON.stringify(firstRow, null, 2));
    }
}
checkMatchReport().catch(console.error);
