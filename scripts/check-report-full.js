async function checkMatchReportFullContent() {
    const encounterId = 466825; // FireDarter C vs Lions Weyhausen B
    const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/match/${encounterId}/report`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    // Sometimes the keys are 'matchReportRows'
    const rows = data.matchReportRows || (Array.isArray(data) ? data : Object.values(data));
    console.log("Number of rows:", rows.length);
    
    if (rows.length > 0) {
        // Let's print the entire first row!
        console.log("Full First Row Object:");
        console.log(JSON.stringify(rows[0], null, 2));
    }
}
checkMatchReportFullContent().catch(console.error);
