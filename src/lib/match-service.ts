import { prisma } from "./prisma";
import { SCRAPE_EVENTS, LIONS_NAMES } from "./lions-config";

/**
 * Name Normalization
 * Maps "Kirste, Sebastian" or "Sebastian Kirste (Weyhausen)" to "Sebastian Kirste"
 */
function canonicalizeName(rawName: string): string {
    if (!rawName) return "Unknown";
    
    let name = rawName.trim();
    
    // 1. Handle "Last, First" format
    if (name.includes(',')) {
        const parts = name.split(',').map(p => p.trim());
        if (parts.length === 2) {
            name = `${parts[1]} ${parts[0]}`;
        }
    }

    // 2. Remove team suffixes or info in parentheses like " (Lions)" or " (Weyhausen A)"
    name = name.replace(/\s*\(.*?\)/g, "").trim();

    // 3. Search for best match in LIONS_NAMES
    const lowerName = name.toLowerCase();
    const match = LIONS_NAMES.find(ln => ln.toLowerCase() === lowerName || ln.toLowerCase().includes(lowerName));
    
    if (match) return match;

    // 4. Special cases (manual overrides if needed)
    if (lowerName.includes("jens") && lowerName.includes("goltermann")) return "Jens Goltermann";
    if (lowerName.includes("rathje")) return "André Rathje";
    
    return name; // Fallback
}

export async function updateMatchCache() {
    console.log("[MatchService] Updating match cache...");
    
    // Pre-fetch all existing gameIds to speed up checks
    const existingGameIds = new Set((await prisma.matchRecord.findMany({
        select: { gameId: true }
    })).map(r => r.gameId));

    for (const config of SCRAPE_EVENTS) {
        try {
            console.log(`[MatchService] Processing event: ${config.name} (${config.eventId})`);
            const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${config.eventId}/phase/${config.phaseId}/round/0`;
            const res = await fetch(url);
            if (!res.ok) {
                console.warn(`[MatchService] Failed to fetch event ${config.eventId}: ${res.statusText}`);
                continue;
            }
            const data = await res.json();
            if (!data.matches) continue;

            const targetMatches = data.matches.filter((m: any) => 
                m.statusCd === 'FINISH' &&
                (
                    (m.participantHome?.displayName || "").includes("Weyhausen") || 
                    (m.participantGuest?.displayName || "").includes("Weyhausen") ||
                    (m.participantHome?.displayName || "").includes("Wettmershagen") || 
                    (m.participantGuest?.displayName || "").includes("Wettmershagen") ||
                    (m.participantHome?.displayName || "").includes("Goltermann") ||
                    (m.participantGuest?.displayName || "").includes("Goltermann")
                )
            );

            console.log(`[MatchService] Found ${targetMatches.length} matching encounters for ${config.name}`);

            for (const match of targetMatches) {
                const encounterId = match.id;
                const spieltagFull = match.round?.name || "";
                const spieltagNum = parseInt(spieltagFull.replace(/\D/g, '')) || 0;
                
                const reportUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${config.eventId}/match/${encounterId}/report`;
                const reportRes = await fetch(reportUrl);
                if (!reportRes.ok) continue;
                const reportData = await reportRes.json();
                const games = reportData.matchReportRows || (Array.isArray(reportData) ? reportData : Object.values(reportData));
                
                for (const game of games) {
                    if (game.statusCd !== 'FINISH') continue;
                    const gameId = game.id;
                    
                    if (existingGameIds.has(gameId)) continue;

                    const statsUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${config.eventId}/match/${gameId}/statistics`;
                    const statsRes = await fetch(statsUrl);
                    if (!statsRes.ok) continue;
                    const statsData = await statsRes.json();
                    
                    const matchSummaries = statsData.filter((s: any) => s.type === 'MATCH');
                    
                    for (const summary of matchSummaries) {
                        const name = summary.displayName;
                        const teamName = (summary.participant?.displayName || "");
                        
                        // Strict filter: Weyhausen players OR Jens Goltermann
                        const isWeyhausen = name.includes("Weyhausen") || teamName.includes("Weyhausen");
                        const isJens = name.includes("Jens Goltermann") || name.includes("Goltermann");
                        
                        if (!isWeyhausen && !isJens) continue;
                        
                        // If it's a Wettmershagen match, ONLY allow Jens
                        if (teamName.includes("Wettmershagen") && !isJens) continue;

                        const opponent = matchSummaries.find((s: any) => s.displayName !== name);

                        try {
                            await prisma.matchRecord.upsert({
                                where: { gameId }, // Ensure @unique gameId is set in schema
                                update: {
                                    playerName: canonicalizeName(name),
                                    opponentName: canonicalizeName(opponent?.displayName || "Unbekannt"),
                                    legsWon: summary.legCount || 0,
                                    legsLost: summary.legCountOpponent || 0,
                                    avgTotal: (summary.scoreTotal / (summary.dartsTotal || 1)) * 3,
                                    won: summary.won || false,
                                },
                                create: {
                                    gameId,
                                    encounterId,
                                    eventId: config.eventId,
                                    spieltag: spieltagNum,
                                    playerName: canonicalizeName(name),
                                    opponentName: canonicalizeName(opponent?.displayName || "Unbekannt"),
                                    date: new Date(summary.date || game.endDate || match.endDate || new Date()),
                                    legsWon: summary.legCount || 0,
                                    legsLost: summary.legCountOpponent || 0,
                                    avgTotal: (summary.scoreTotal / (summary.dartsTotal || 1)) * 3 || 0,
                                    dartsTotal: summary.dartsTotal || 0,
                                    scoreTotal: summary.scoreTotal || 0,
                                    avg9: (summary.scoreFirst9 / (summary.dartsFirst9 || 1)) * 3 || 0,
                                    darts9: summary.dartsFirst9 || 0,
                                    score9: summary.scoreFirst9 || 0,
                                    avg18: (summary.scoreFirst18 / (summary.dartsFirst18 || 1)) * 3 || 0,
                                    darts18: summary.dartsFirst18 || 0,
                                    score18: summary.scoreFirst18 || 0,
                                    count80: summary.count80 || 0,
                                    count100: summary.count100 || 0,
                                    count140: summary.count140 || 0,
                                    count180: summary.count180 || 0,
                                    checkoutMax: summary.checkoutMax || 0,
                                    won: summary.won || false,
                                    isDouble: name.includes("&")
                                }
                            });
                            console.log(`[MatchService] Upserted match record for ${name} (Game ${gameId})`);
                        } catch (err) {
                            console.error(`[MatchService] Error upserting game ${gameId} for ${name}:`, err);
                        }
                        existingGameIds.add(gameId);
                    }
                }
            }
        } catch (e) {
            console.error(`[MatchService] Critical error config ${config.eventId}:`, e);
        }
    }
}


export async function getAggregateStatsUpTo(upToSpieltag: number) {
    console.log(`[MatchService] Aggregating seasonal stats up to Spieltag ${upToSpieltag}...`);

    // 1. Get all match records up to this Spieltag
    const records = await prisma.matchRecord.findMany({
        where: { 
            isDouble: false,
            spieltag: { lte: upToSpieltag }
        }
    });

    // 2. Get all manual games up to this period
    // We filter by week_id (Spieltag X) where X <= upToSpieltag
    const manualGames = await prisma.manualGame.findMany();
    const filteredManual = manualGames.filter(g => {
        if (!g.week_id) return true; // older ones might lack week_id
        const match = g.week_id.match(/Spieltag\s+(\d+)/);
        if (match) {
            const num = parseInt(match[1]);
            return num <= upToSpieltag;
        }
        return true; 
    });

    const players: Record<string, any> = {};

    // 3. Initialize ALL 17 Players to guarantee presence
    for (const name of LIONS_NAMES) {
        players[name] = {
            player_name: name,
            verein: name === "Jens Goltermann" ? "DC Wettmershagen A" : "Lions Weyhausen",
            dartsTotal: 0,
            scoreTotal: 0,
            darts9: 0,
            score9: 0,
            darts18: 0,
            score18: 0,
            wins: 0,
            games_played: 0,
            legs_won: 0,
            legs_total: 0,
            cnt_80: 0,
            cnt_100: 0,
            cnt_140: 0,
            cnt_180: 0,
            sum_high_scores: 0, // Count of high scores (80+)
            gespielte_single_spiele: 0
        };
    }

    // Aggregation helper
    const addData = (rawName: string, data: any) => {
        const canonical = canonicalizeName(rawName);
        if (!players[canonical]) return; // Skip if not in LIONS list
        
        const p = players[canonical];
        p.dartsTotal += (data.dartsTotal || 0);
        p.scoreTotal += (data.scoreTotal || 0);
        p.darts9 += (data.darts9 || 0);
        p.score9 += (data.score9 || 0);
        p.darts18 += (data.darts18 || 0);
        p.score18 += (data.score18 || 0);
        if (data.won) p.wins++;
        p.games_played++;
        p.gespielte_single_spiele++;
        p.legs_won += (data.legsWon || 0);
        p.legs_total += ((data.legsWon || 0) + (data.legsLost || 0));
        p.cnt_80 += (data.count80 || 0);
        p.cnt_100 += (data.count100 || 0);
        p.cnt_140 += (data.count140 || 0);
        p.cnt_180 += (data.count180 || 0);
        // K5: COUNT of High Scores (80+)
        p.sum_high_scores += ((data.count180 || 0) + (data.count140 || 0) + (data.count100 || 0) + (data.count80 || 0));
    };

    // Aggregate from 3k-Darts
    for (const r of records) {
        addData(r.playerName, r);
    }

    // Aggregate from Manual Games
    for (const g of filteredManual) {
        if (g.is_offline) {
            const p = players[canonicalizeName(g.player_name)];
            if (p) {
                p.wins += (g.game1_win ? 1 : 0);
                p.games_played += 1;
                p.gespielte_single_spiele += 1;
                p.legs_won += g.legs_won;
                p.legs_total += (g.legs_won + g.legs_lost);
            }
        } else {
            // Mapping manual fields to common data structure for addData
            const manualData1 = {
                avgTotal: g.game1_avg,
                scoreTotal: g.game1_avg * 10,
                dartsTotal: 30, // placeholder weight
                score9: g.game1_avg_9 * 3,
                darts9: 9,
                score18: g.game1_avg_18 * 6,
                darts18: 18,
                won: g.game1_win,
                legsWon: g.legs_won, // distributing legs roughly? No, manual games store legs total.
                legsLost: g.legs_lost,
                count80: g.cnt_80,
                count100: g.cnt_100,
                count140: g.cnt_140,
                count180: g.cnt_180
            };
            addData(g.player_name, manualData1);
            
            if (g.game2_avg > 0) {
                const manualData2 = {
                    scoreTotal: g.game2_avg * 10,
                    dartsTotal: 30,
                    score9: g.game2_avg_9 * 3,
                    darts9: 9,
                    score18: g.game2_avg_18 * 6,
                    darts18: 18,
                    won: g.game2_win,
                    legsWon: 0, legsLost: 0, // avoid double counting legs
                    count80: 0, count100: 0, count140: 0, count180: 0 // avoid double counting high scores
                };
                addData(g.player_name, manualData2);
            }
        }
    }

    // Finalize averages and metrics
    return Object.values(players).map(p => ({
        ...p,
        avg_total: p.dartsTotal > 0 ? (p.scoreTotal / p.dartsTotal) * 3 : 0,
        avg_9: p.darts9 > 0 ? (p.score9 / p.darts9) * 3 : 0,
        avg_18: p.darts18 > 0 ? (p.score18 / p.darts18) * 3 : 0,
        siegequote_pct: p.games_played > 0 ? (p.wins / p.games_played) * 100 : 0,
        avg_high_per_leg: p.legs_total > 0 ? p.sum_high_scores / p.legs_total : 0,
        gespielte_legs: p.legs_total,
        gespielte_single_spiele: p.games_played
    }));
}

export async function getPlayerSeasonMatches(playerName: string) {
    const records = await prisma.matchRecord.findMany({
        where: { playerName },
        orderBy: { spieltag: 'asc' }
    });
    
    // Create map for 1-18 slots
    const schedule = Array.from({ length: 18 }, (_, i) => ({
        spieltag: i + 1,
        match: null as any
    }));

    for (const r of records) {
        if (r.spieltag >= 1 && r.spieltag <= 18) {
            schedule[r.spieltag - 1].match = r;
        }
    }

    return schedule;
}
