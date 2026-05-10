const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function discoverPlayerList() {
    const teamId = 5415; // Lions A
    const eventId = 247;
    const variations = [
        `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/participant/${teamId}`,
        `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/participant/${teamId}/members`,
        `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/participant/${teamId}/players`,
        `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/participant/${teamId}`,
        `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/participant/${teamId}/members`
    ];
    
    for (const url of variations) {
        console.log(`Trying: ${url}`);
        try {
            const res = await fetch(url, { headers: HEADERS });
            console.log(`  Result: ${res.status}`);
            if (res.ok) {
                const data = await res.json();
                console.log(`  Success! Keys: ${Object.keys(data)}`);
                console.log(JSON.stringify(data).slice(0, 500));
            }
        } catch (e) {
            console.log(`  Error: ${e.message}`);
        }
    }
}

discoverPlayerList();
