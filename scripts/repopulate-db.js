const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// Team participant IDs for Lions Weyhausen
const LIONS_TEAM_IDS = [5415, 7492]; // A-Team and B-Team
// Jens Goltermann plays in DC Wettmershagen but we want his stats

const EVENTS = [
    { eventId: 247, phaseId: 231, teamId: 5415, name: "Lions Weyhausen A" },
    { eventId: 251, phaseId: 235, teamId: 7492, name: "Lions Weyhausen B" },
];

async function recoverData() {
    console.log("[Recovery v2] Starting data recovery using /statistics endpoint...");
    
    // Step 1: Delete old test data (the 3 fake Erik Schremmer records)
    const deleteResult = await prisma.matchRecord.deleteMany({
        where: { gameId: { gte: 999000, lte: 999999 } }
    });
    console.log(`[Recovery v2] Deleted ${deleteResult.count} test records.`);
    
    // Step 2: For each event, get the encounters and their individual game statistics
    for (const config of EVENTS) {
        console.log(`\n[Recovery v2] Processing: ${config.name}`);
        
        // Get all encounters (matches) for this event
        const roundUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${config.eventId}/phase/${config.phaseId}/round/0`;
        const roundRes = await fetch(roundUrl, { headers: HEADERS });
        if (!roundRes.ok) { console.error(`Failed round fetch: ${roundRes.status}`); continue; }
        const roundData = await roundRes.json();
        
        // Filter encounters involving Lions Weyhausen
        const lionsEncounters = roundData.matches.filter(m => {
            const home = m.participantHome?.id;
            const guest = m.participantGuest?.id;
            return m.statusCd === 'FINISH' && (home === config.teamId || guest === config.teamId);
        });
        
        console.log(`[Recovery v2] Found ${lionsEncounters.length} finished Lions encounters.`);
        
        for (const enc of lionsEncounters) {
            const spieltagName = enc.round?.name || "";
            const spieltagNum = parseInt(spieltagName.replace(/\D/g, '')) || 0;
            const isHome = enc.participantHome?.id === config.teamId;
            const opponentTeam = isHome ? enc.participantGuest?.displayName : enc.participantHome?.displayName;
            
            // Get the match report to find individual games
            const reportUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${config.eventId}/match/${enc.id}/report`;
            const reportRes = await fetch(reportUrl, { headers: HEADERS });
            if (!reportRes.ok) continue;
            const reportData = await reportRes.json();
            const games = Array.isArray(reportData) ? reportData : (reportData.matchReportRows || []);
            
            // For each individual game, get the statistics 
            for (const game of games) {
                const gameId = game.id;
                
                // Check if already exists
                const existing = await prisma.matchRecord.findUnique({ where: { gameId } });
                if (existing) continue;
                
                // Get stats for this individual game
                const statsUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${config.eventId}/match/${gameId}/statistics`;
                const statsRes = await fetch(statsUrl, { headers: HEADERS });
                if (!statsRes.ok) continue;
                const statsRaw = await statsRes.json();
                const statsArr = Array.isArray(statsRaw) ? statsRaw : (statsRaw.statistics || []);
                const matchSummaries = statsArr.filter(s => s && s.type === 'MATCH');
                
                if (matchSummaries.length === 0) continue;
                
                for (const summary of matchSummaries) {
                    const name = summary.displayName;
                    const participantId = summary.participantId;
                    const isLionsPlayer = LIONS_TEAM_IDS.includes(participantId);
                    const isJens = name.includes("Goltermann");
                    
                    if (!isLionsPlayer && !isJens) continue;
                    
                    const opponent = matchSummaries.find(s => s.displayName !== name);
                    const isDouble = name.includes("&");
                    
                    try {
                        await prisma.matchRecord.create({
                            data: {
                                gameId,
                                encounterId: enc.id,
                                eventId: config.eventId,
                                spieltag: spieltagNum,
                                playerName: name,
                                opponentName: opponent?.displayName || opponentTeam || "Unbekannt",
                                date: new Date(enc.endDate || new Date()),
                                legsWon: summary.legCount || 0,
                                legsLost: summary.legCountOpponent || 0,
                                avgTotal: summary.dartsTotal > 0 ? (summary.scoreTotal / summary.dartsTotal) * 3 : 0,
                                dartsTotal: summary.dartsTotal || 0,
                                scoreTotal: summary.scoreTotal || 0,
                                avg9: summary.dartsFirst9 > 0 ? (summary.scoreFirst9 / summary.dartsFirst9) * 3 : 0,
                                darts9: summary.dartsFirst9 || 0,
                                score9: summary.scoreFirst9 || 0,
                                avg18: summary.dartsFirst18 > 0 ? (summary.scoreFirst18 / summary.dartsFirst18) * 3 : 0,
                                darts18: summary.dartsFirst18 || 0,
                                score18: summary.scoreFirst18 || 0,
                                count80: summary.count80 || 0,
                                count100: summary.count100 || 0,
                                count140: summary.count140 || 0,
                                count180: summary.count180 || 0,
                                checkoutMax: summary.checkoutMax || 0,
                                won: summary.won || false,
                                isDouble: isDouble
                            }
                        });
                        console.log(`[Recovery v2] Saved: ${name} (Spieltag ${spieltagNum}, Game ${gameId})`);
                    } catch (e) {
                        // Likely a unique constraint violation if the game already exists
                        console.warn(`[Recovery v2] Skip ${gameId}: ${e.message.slice(0, 80)}`);
                    }
                }
            }
        }
    }
    
    // Final count
    const totalRecords = await prisma.matchRecord.count();
    console.log(`\n[Recovery v2] Done! Total MatchRecords in DB: ${totalRecords}`);
}

recoverData()
    .then(() => process.exit(0))
    .catch(e => { console.error("[Recovery v2] Fatal:", e); process.exit(1); });
