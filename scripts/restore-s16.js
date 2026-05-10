const { Client } = require('pg');

const LIONS_NAMES = [
    "André Rathje", "Dirk Ostermann", "Erik Schremmer", "Jannik Baier",
    "Jens Goltermann", "Joachim Koch", "Karen Schulz", "Karsten Kohnert",
    "Kevin Emde", "Maik Feuerhahn", "Malte Wolnik", "Martin Wolnik",
    "Michael Gehrt", "Michael Kranz", "Nicholas Stedman", "Sebastian Kirste",
    "Timo Feuerhahn"
];

const SCRAPE_EVENTS = [
    { eventId: 247, phaseId: 231, name: "Lions Weyhausen A" },
    { eventId: 251, phaseId: 235, name: "Lions Weyhausen B" },
    { eventId: 239, phaseId: 230, name: "DC Wettmershagen A" },
];

const DEFAULT_WEIGHTS = {
    weight_k1: 0.20,
    weight_k2: 0.15,
    weight_k3: 0.15,
    weight_k4: 0.25,
    weight_k5: 0.25
};

function canonicalizeName(rawName) {
    if (!rawName) return "Unknown";
    let name = rawName.trim();
    if (name.includes(',')) {
        const parts = name.split(',').map(p => p.trim());
        if (parts.length === 2) name = `${parts[1]} ${parts[0]}`;
    }
    name = name.replace(/\s*\(.*?\)/g, "").trim();
    const lowerName = name.toLowerCase();
    const match = LIONS_NAMES.find(ln => ln.toLowerCase() === lowerName || ln.toLowerCase().includes(lowerName));
    if (match) return match;
    if (lowerName.includes("jens") && lowerName.includes("goltermann")) return "Jens Goltermann";
    if (lowerName.includes("rathje")) return "André Rathje";
    return name;
}

async function run() {
    const connectionString = 'postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';
    const client = new Client({ connectionString });
    const targetWeekId = 'Spieltag 16';
    const weekNum = 16;
    
    try {
        await client.connect();
        console.log('Connected to DB');

        // 0. Cleanup old S16 snapshots
        console.log("Cleaning up old S16 snapshots...");
        const oldSnaps = await client.query('SELECT snapshot_id FROM "Snapshot" WHERE week_id = $1', [targetWeekId]);
        for (const row of oldSnaps.rows) {
            await client.query('DELETE FROM "SnapshotPlayerValue" WHERE snapshot_id = $1', [row.snapshot_id]);
            await client.query('DELETE FROM "Snapshot" WHERE snapshot_id = $1', [row.snapshot_id]);
        }

        // 1. Update Match Cache from 3K API
        console.log("Updating match cache from 3K API...");
        for (const config of SCRAPE_EVENTS) {
            console.log(`Processing event: ${config.name}`);
            const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${config.eventId}/phase/${config.phaseId}/round/0`;
            const res = await fetch(url);
            if (!res.ok) continue;
            const data = await res.json();
            if (!data.matches) continue;

            for (const m of data.matches) {
                if (m.statusCd !== 'FINISH') continue;
                const encounterId = m.id;
                const spieltagFull = m.round?.name || "";
                const spieltagNum = parseInt(spieltagFull.replace(/\D/g, '')) || 0;
                if (spieltagNum > weekNum) continue;

                // Simple check: does this match involve a Lions or Wettmershagen team?
                const home = m.participantHome?.displayName || "";
                const guest = m.participantGuest?.displayName || "";
                if (!home.includes("Weyhausen") && !guest.includes("Weyhausen") && !home.includes("Wettmershagen") && !guest.includes("Wettmershagen")) continue;

                const reportUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${config.eventId}/match/${encounterId}/report`;
                const reportRes = await fetch(reportUrl);
                if (!reportRes.ok) continue;
                const reportData = await reportRes.json();
                const games = reportData.matchReportRows || (Array.isArray(reportData) ? reportData : Object.values(reportData));

                for (const game of games) {
                    if (game.statusCd !== 'FINISH') continue;
                    const gameId = game.id;

                    const statsUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${config.eventId}/match/${gameId}/statistics`;
                    const statsRes = await fetch(statsUrl);
                    if (!statsRes.ok) continue;
                    const statsData = await statsRes.json();
                    
                    const matchSummaries = statsData.filter(s => s.type === 'MATCH');
                    for (const summary of matchSummaries) {
                        const name = summary.displayName;
                        const teamName = (summary.participant?.displayName || "");
                        
                        const isWeyhausen = name.includes("Weyhausen") || teamName.includes("Weyhausen");
                        const isJens = name.includes("Jens Goltermann") || name.includes("Goltermann");
                        if (!isWeyhausen && !isJens) continue;
                        if (teamName.includes("Wettmershagen") && !isJens) continue;

                        const opponent = matchSummaries.find(s => s.displayName !== name);
                        const cName = canonicalizeName(name);
                        const oName = canonicalizeName(opponent?.displayName || "Unbekannt");

                        await client.query(`
                            INSERT INTO "MatchRecord" (
                                "gameId", "encounterId", "eventId", spieltag, "playerName", "opponentName", 
                                date, "legsWon", "legsLost", "avgTotal", "dartsTotal", "scoreTotal", 
                                "avg9", "darts9", "score9", "avg18", "darts18", "score18", 
                                "count80", "count100", "count140", "count180", "checkoutMax", won, "isDouble"
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
                            ON CONFLICT ("gameId") DO NOTHING
                        `, [
                            gameId, encounterId, config.eventId, spieltagNum, cName, oName,
                            new Date(summary.date || game.endDate || m.endDate || new Date()),
                            summary.legCount || 0, summary.legCountOpponent || 0,
                            (summary.scoreTotal / (summary.dartsTotal || 1)) * 3 || 0,
                            summary.dartsTotal || 0, summary.scoreTotal || 0,
                            (summary.scoreFirst9 / (summary.dartsFirst9 || 1)) * 3 || 0,
                            summary.dartsFirst9 || 0, summary.scoreFirst9 || 0,
                            (summary.scoreFirst18 / (summary.dartsFirst18 || 1)) * 3 || 0,
                            summary.dartsFirst18 || 0, summary.scoreFirst18 || 0,
                            summary.count80 || 0, summary.count100 || 0, summary.count140 || 0, summary.count180 || 0,
                            summary.checkoutMax || 0, summary.won || false, name.includes("&")
                        ]);
                    }
                }
            }
        }

        // 2. Fetch weights
        const configRes = await client.query('SELECT * FROM "RankingConfig" WHERE id = 1');
        const weights = configRes.rows[0] ? {
            weight_k1: parseFloat(configRes.rows[0].weight_k1),
            weight_k2: parseFloat(configRes.rows[0].weight_k2),
            weight_k3: parseFloat(configRes.rows[0].weight_k3),
            weight_k4: parseFloat(configRes.rows[0].weight_k4),
            weight_k5: parseFloat(configRes.rows[0].weight_k5),
        } : DEFAULT_WEIGHTS;

        // 3. Aggregate
        const players = {};
        LIONS_NAMES.forEach(name => {
            players[name] = {
                player_name: name,
                verein: name === "Jens Goltermann" ? "DC Wettmershagen A" : "Lions Weyhausen",
                avg_total_sum: 0, avg_9_sum: 0, avg_18_sum: 0,
                cnt_80: 0, cnt_100: 0, cnt_140: 0, cnt_180: 0,
                wins: 0, games_played: 0, legs_total: 0,
                gespielte_single_spiele: 0
            };
        });

        const matchRes = await client.query('SELECT * FROM "MatchRecord" WHERE "isDouble" = false AND spieltag <= $1', [weekNum]);
        matchRes.rows.forEach(m => {
            if (players[m.playerName]) {
                const p = players[m.playerName];
                p.avg_total_sum += (m.avgTotal || 0);
                p.avg_9_sum += (m.avg9 || 0);
                p.avg_18_sum += (m.avg18 || 0);
                p.cnt_80 += (m.count80 || 0);
                p.cnt_100 += (m.count100 || 0);
                p.cnt_140 += (m.count140 || 0);
                p.cnt_180 += (m.count180 || 0);
                p.wins += (m.won ? 1 : 0);
                p.games_played += 1;
                p.legs_total += (m.legsWon || 0) + (m.legsLost || 0);
                p.gespielte_single_spiele += 1;
            }
        });

        // Manual Games
        const manualRes = await client.query('SELECT * FROM "ManualGame"');
        manualRes.rows.forEach(m => {
            const mWeekNum = parseInt(m.week_id?.replace(/\D/g, '')) || 0;
            if (mWeekNum > 0 && mWeekNum <= weekNum && players[m.player_name]) {
                const p = players[m.player_name];
                p.avg_total_sum += (m.game1_avg || 0) + (m.game2_avg || 0);
                const count = (m.game1_avg > 0 ? 1 : 0) + (m.game2_avg > 0 ? 1 : 0);
                p.avg_9_sum += (m.game1_avg_9 || 0) + (m.game2_avg_9 || 0);
                p.avg_18_sum += (m.game1_avg_18 || 0) + (m.game2_avg_18 || 0);
                p.cnt_80 += (m.cnt_80 || 0);
                p.cnt_100 += (m.cnt_100 || 0);
                p.cnt_140 += (m.cnt_140 || 0);
                p.cnt_180 += (m.cnt_180 || 0);
                p.wins += (m.legs_won > m.legs_lost ? 1 : 0);
                p.games_played += count;
                p.legs_total += (m.legs_won || 0) + (m.legs_lost || 0);
                p.gespielte_single_spiele += count;
            }
        });

        const ranked = Object.values(players).map(p => {
            const count = p.gespielte_single_spiele || 1;
            const avg_total = p.avg_total_sum / count;
            const avg_9 = p.avg_9_sum / count;
            const avg_18 = p.avg_18_sum / count;
            const siegequote = p.games_played > 0 ? (p.wins / p.games_played) * 100 : 0;
            const avg_high = p.legs_total > 0 ? (p.cnt_80 + p.cnt_100 + p.cnt_140 + p.cnt_180) / p.legs_total : 0;

            const pk1 = Math.round(avg_total);
            const pk2 = Math.round(avg_9);
            const pk3 = Math.round(avg_18);
            const pk4 = Math.round(siegequote);
            const pk5 = Math.round(avg_high * 100);

            const total = (pk1 * weights.weight_k1) + (pk2 * weights.weight_k2) + (pk3 * weights.weight_k3) + (pk4 * weights.weight_k4) + (pk5 * weights.weight_k5);

            return {
                ...p, avg_total, avg_9, avg_18, siegequote_pct: siegequote, avg_high_per_leg: avg_high,
                points_k1: pk1, points_k2: pk2, points_k3: pk3, points_k4: pk4, points_k5: pk5,
                total_points: Math.round(total * 100) / 100
            };
        });

        ranked.sort((a, b) => b.total_points - a.total_points || b.avg_total - a.avg_total);

        // 4. Save
        const snapRes = await client.query('INSERT INTO "Snapshot" (week_id, timestamp) VALUES ($1, NOW()) RETURNING snapshot_id', [targetWeekId]);
        const sid = snapRes.rows[0].snapshot_id;

        for (let i = 0; i < ranked.length; i++) {
            const p = ranked[i];
            await client.query(`
                INSERT INTO "SnapshotPlayerValue" (
                    snapshot_id, player_name, verein, gespielte_single_spiele, gespielte_legs,
                    avg_total, avg_9, avg_18, wins, games_played, siegequote_pct,
                    cnt_80, cnt_100, cnt_140, cnt_180, sum_high_scores, avg_high_per_leg,
                    points_k1, points_k2, points_k3, points_k4, points_k5,
                    total_points, rank, source, veto_flag
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
            `, [
                sid, p.player_name, p.verein, p.gespielte_single_spiele, p.legs_total,
                p.avg_total, p.avg_9, p.avg_18, p.wins, p.games_played, p.siegequote_pct,
                p.cnt_80, p.cnt_100, p.cnt_140, p.cnt_180, (p.cnt_80 + p.cnt_100 + p.cnt_140 + p.cnt_180), p.avg_high_per_leg,
                p.points_k1, p.points_k2, p.points_k3, p.points_k4, p.points_k5,
                p.total_points, i + 1, 'final_restoration_v2', false
            ]);
        }

        console.log(`Successfully restored Spieltag 16 with ${ranked.length} players.`);
        
    } catch (err) {
        console.error('Error during restoration:', err);
    } finally {
        await client.end();
    }
}

run();
