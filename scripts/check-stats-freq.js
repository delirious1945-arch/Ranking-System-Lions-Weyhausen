async function checkStatisticsFrequency() {
    const res = await fetch("https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/251/statistics");
    const data = await res.json();
    
    const erikEntries = data.filter(s => s.displayName === "Erik Schremmer");
    console.log("Entries for Erik Schremmer:", erikEntries.length);
    
    if (erikEntries.length > 0) {
        console.log("First entry details (Sample):", JSON.stringify(erikEntries[0], null, 2));
    }
}
checkStatisticsFrequency().catch(console.error);
