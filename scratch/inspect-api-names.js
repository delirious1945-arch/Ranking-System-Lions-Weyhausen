const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

const LIONS_NAMES = [
  "André Rathje", "Dirk Ostermann", "Erik Schremmer", "Jannik Baier", 
  "Jens Goltermann", "Joachim Koch", "Karen Schulz", "Karsten Kohnert", 
  "Kevin Emde", "Maik Feuerhahn", "Malte Wolnik", "Martin Wolnik", 
  "Michael Gehrt", "Michael Kranz", "Nicholas Stedman", "Sebastian Kirste", 
  "Timo Feuerhahn"
];

const EVENTS = [247, 251, 239];

async function inspectNames() {
    for (const id of EVENTS) {
        console.log(`\n--- Inspecting Event ${id} ---`);
        const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${id}/statistics`;
        try {
            const res = await fetch(url, { headers: HEADERS });
            if (!res.ok) { console.log(`Error: ${res.status}`); continue; }
            const data = await res.json();
            const names = data.filter(s => s.type === 'MATCH').map(s => s.displayName);
            console.log(`Names in API (${names.length}):`, names);
            
            const matches = names.filter(n => LIONS_NAMES.includes(n));
            console.log(`Matches with LIONS_NAMES (${matches.length}):`, matches);
            
            const missing = LIONS_NAMES.filter(n => !names.includes(n));
            if (id !== 239) console.log(`Missing from this event:`, missing);
        } catch (e) {
            console.error(`Fetch failed for ${id}:`, e.message);
        }
    }
}

inspectNames();
