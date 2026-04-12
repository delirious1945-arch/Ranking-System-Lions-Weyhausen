import { prisma } from "./prisma";

const EVENTS = [
    { eventId: 247, phaseId: 231, name: "Lions Weyhausen A" },
    { eventId: 251, phaseId: 235, name: "Lions Weyhausen B" },
    { eventId: 239, phaseId: 230, name: "Jens Goltermann" },
];

export async function updateMatchCache() {
    console.log("[MatchService] Updating match cache...");
    
    // Pre-fetch all existing gameIds to speed up checks
    const existingGameIds = new Set((await prisma.matchRecord.findMany({
        select: { gameId: true }
    })).map(r => r.gameId));

    for (const config of EVENTS) {
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

                        await prisma.matchRecord.create({
                            data: {
                                gameId,
                                encounterId,
                                eventId: config.eventId,
                                spieltag: spieltagNum,
                                playerName: name,
                                opponentName: opponent?.displayName || "Unbekannt",
                                date: new Date(summary.date || game.endDate || match.endDate || new Date()),
                                legsWon: summary.legCount || 0,
                                legsLost: summary.legCountOpponent || 0,
                                avgTotal: (summary.scoreTotal / summary.dartsTotal) * 3 || 0,
                                dartsTotal: summary.dartsTotal || 0,
                                scoreTotal: summary.scoreTotal || 0,
                                avg9: (summary.scoreFirst9 / summary.dartsFirst9) * 3 || 0,
                                darts9: summary.dartsFirst9 || 0,
                                score9: summary.scoreFirst9 || 0,
                                avg18: (summary.scoreFirst18 / summary.dartsFirst18) * 3 || 0,
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
                        console.log(`[MatchService] Saved match record for ${name} (Game ${gameId})`);
                        existingGameIds.add(gameId);
                    }
                }
            }
        } catch (e) {
            console.error(`[MatchService] Error config ${config.eventId}:`, e);
        }
    }
}


export async function getSnapshotStats(upToSpieltag?: number) {
    // Collect all played matches.
    // If upToSpieltag is set, we could filter, but user said "everything played counts now".
    // "absolvierte spiele von spielern sollen definitiv gleich in das offizielle ranking mit aufgenommen werden"
    
    const records = await prisma.matchRecord.findMany({
        where: { isDouble: false } // Only singles for the main ranking
    });

    const players: Record<string, any> = {};

    for (const r of records) {
        if (!players[r.playerName]) {
            players[r.playerName] = {
                player_name: r.playerName,
                verein: "", // will be filled from Player table or similar
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
                sum_high_scores: 0,
                gespielte_single_spiele: 0
            };
        }

        const p = players[r.playerName];
        p.dartsTotal += r.dartsTotal;
        p.scoreTotal += r.scoreTotal;
        p.darts9 += r.darts9;
        p.score9 += r.score9;
        p.darts18 += r.darts18;
        p.score18 += r.score18;
        if (r.won) p.wins++;
        p.games_played++;
        p.gespielte_single_spiele++; // alias
        p.legs_won += r.legsWon;
        p.legs_total += (r.legsWon + r.legsLost);
        p.cnt_80 += r.count80;
        p.cnt_100 += r.count100;
        p.cnt_140 += r.count140;
        p.cnt_180 += r.count180;
        p.sum_high_scores += (r.count100 * 100 + r.count140 * 140 + r.count180 * 180 + r.count80 * 80);
    }

    // Finalize Averages
    return Object.values(players).map(p => ({
        ...p,
        avg_total: p.dartsTotal > 0 ? (p.scoreTotal / p.dartsTotal) * 3 : 0,
        avg_9: p.darts9 > 0 ? (p.score9 / p.darts9) * 3 : 0,
        avg_18: p.darts18 > 0 ? (p.score18 / p.darts18) * 3 : 0,
        siegequote_pct: p.games_played > 0 ? (p.wins / p.games_played) * 100 : 0,
        avg_high_per_leg: p.legs_total > 0 ? p.sum_high_scores / p.legs_total : 0,
        gespielte_legs: p.legs_total
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
