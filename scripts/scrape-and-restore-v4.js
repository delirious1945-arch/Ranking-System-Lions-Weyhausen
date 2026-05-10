const { Client } = require('pg');
const https = require('https');

const connectionString = 'postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

const LIONS_NAMES = [
    "André Rathje", "Dirk Ostermann", "Erik Schremmer", "Jannik Baier",
    "Jens Goltermann", "Joachim Koch", "Karen Schulz", "Karsten Kohnert",
    "Kevin Emde", "Maik Feuerhahn", "Malte Wolnik", "Martin Wolnik",
    "Michael Gehrt", "Michael Kranz", "Nicholas Stedman", "Sebastian Kirste",
    "Timo Feuerhahn"
];

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

function fetchJsonWithRetry(url, retries = 3) {
    return new Promise((resolve, reject) => {
        const attempt = (remaining) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try { resolve(JSON.parse(data)); }
                    catch (e) {
                        if (remaining > 0) {
                            console.log(`Retry fetching ${url} (${remaining} left)...`);
                            setTimeout(() => attempt(remaining - 1), 2000);
                        } else reject(e);
                    }
                });
            }).on('error', (err) => {
                if (remaining > 0) {
                    console.log(`Retry fetching ${url} due to error (${remaining} left): ${err.message}`);
                    setTimeout(() => attempt(remaining - 1), 2000);
                } else reject(err);
            });
        };
        attempt(retries);
    });
}

async function run() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('--- START ROBUST SCRAPE & RESTORE ---');

        const configRes = await client.query('SELECT * FROM "RankingConfig" WHERE id = 1');
        const weights = {
            k1: parseFloat(configRes.rows[0].weight_k1),
            k2: parseFloat(configRes.rows[0].weight_k2),
            k3: parseFloat(configRes.rows[0].weight_k3),
            k4: parseFloat(configRes.rows[0].weight_k4),
            k5: parseFloat(configRes.rows[0].weight_k5),
        };

        const phases = [446, 447, 448, 449];
        for (const pid of phases) {
            console.log(`Phase ${pid}...`);
            const data = await fetchJsonWithRetry(`https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/387/phase/${pid}/round/0`);
            const matches = data.matches || [];
            
            for (const m of matches) {
                if (m.statusCd !== 'FINISH') continue;
                const encounterId = m.id;
                const weekNum = parseInt(m.round?.name?.replace(/\D/g, '')) || 0;

                // Simple check if encounter already known to save API calls
                const known = await client.query('SELECT count(*) FROM "MatchRecord" WHERE "encounterId" = $1', [encounterId]);
                if (parseInt(known.rows[0].count) > 0) continue;

                const report = await fetchJsonWithRetry(`https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/387/match/${encounterId}/report`);
                const rows = report.matchReportRows || [];
                
                for (const row of rows) {
                    if (row.statusCd !== 'FINISH') continue;
                    const gameId = row.id;

                    const stats = await fetchJsonWithRetry(`https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/387/match/${gameId}/statistics`);
                    if (!Array.isArray(stats)) continue;

                    const summaries = stats.filter(s => s.type === 'MATCH');
                    for (const s of summaries) {
                        const rawName = s.displayName;
                        const team = s.participant?.displayName || "";
                        const cName = canonicalizeName(rawName);

                        if (!LIONS_NAMES.includes(cName)) continue;
                        if (team.includes("Wettmershagen") && !cName.includes("Goltermann")) continue;

                        const opp = summaries.find(x => x.displayName !== rawName);
                        
                        await client.query(`
                            INSERT INTO "MatchRecord" (
                                "gameId", "encounterId", "eventId", spieltag, "playerName", "opponentName", 
                                date, "legsWon", "legsLost", "avgTotal", "dartsTotal", "scoreTotal",
                                "avg9", "darts9", "score9", "avg18", "darts18", "score18",
                                "count80", "count100", "count140", "count180", "checkoutMax", won, "isDouble"
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
                            ON CONFLICT ("gameId", "playerName") DO NOTHING
                        `, [
                            gameId, encounterId, 387, weekNum, cName, canonicalizeName(opp?.displayName || ""),
                            new Date(), s.legCount || 0, s.legCountOpponent || 0,
                            (s.scoreTotal / (s.dartsTotal || 1)) * 3, s.dartsTotal || 0, s.scoreTotal || 0,
                            (s.scoreFirst9 / (s.dartsFirst9 || 1)) * 3, s.dartsFirst9 || 0, s.scoreFirst9 || 0,
                            (s.scoreFirst18 / (s.dartsFirst18 || 1)) * 3, s.dartsFirst18 || 0, s.scoreFirst18 || 0,
                            s.count80 || 0, s.count100 || 0, s.count140 || 0, s.count180 || 0, s.checkoutMax || 0,
                            s.won || false, rawName.includes("&")
                        ]);
                    }
                }
            }
        }

        // Aggregate S15 & S16
        for (const weekNum of [15, 16]) {
            const weekId = `Spieltag ${weekNum}`;
            const players = {};
            LIONS_NAMES.forEach(n => {
                players[n] = {
                    name: n, v: n === "Jens Goltermann" ? "DC Wettmershagen A" : "Lions Weyhausen",
                    at: 0, a9: 0, a18: 0, c80: 0, c100: 0, c140: 0, c180: 0, w: 0, gp: 0, lt: 0, cnt: 0
                };
            });

            const matchDatas = await client.query('SELECT * FROM "MatchRecord" WHERE "isDouble" = false AND spieltag <= $1', [weekNum]);
            matchDatas.rows.forEach(m => {
                const p = players[m.playerName];
                if (p) {
                    p.at += (m.avgTotal || 0); p.a9 += (m.avg9 || 0); p.a18 += (m.avg18 || 0);
                    p.c80 += m.count80; p.c100 += m.count100; p.c140 += m.count140; p.c180 += m.count180;
                    p.w += m.won ? 1 : 0; p.gp += 1; p.lt += (m.legsWon + m.legsLost); p.cnt += 1;
                }
            });

            const manualDatas = await client.query('SELECT * FROM "ManualGame"');
            manualDatas.rows.forEach(m => {
                const mW = parseInt(m.week_id?.replace(/\D/g, '')) || 0;
                if (mW > 0 && mW <= weekNum) {
                    const name = canonicalizeName(m.player_name);
                    if (players[name]) {
                        const p = players[name];
                        p.at += (m.game1_avg || 0) + (m.game2_avg || 0);
                        const c = (m.game1_avg > 0 ? 1 : 0) + (m.game2_avg > 0 ? 1 : 0);
                        p.a9 += (m.game1_avg_9 || 0) + (m.game2_avg_9 || 0);
                        p.a18 += (m.game1_avg_18 || 0) + (m.game2_avg_18 || 0);
                        p.c80 += m.cnt_80; p.c100 += m.cnt_100; p.c140 += m.cnt_140; p.c180 += m.cnt_180;
                        p.w += (m.legs_won > m.legs_lost ? 1 : 0); p.gp += c; p.lt += (m.legs_won + m.legs_lost); p.cnt += c;
                    }
                }
            });

            const ranked = Object.values(players).map(p => {
                const c = p.gp || 1; // Correct: Using games_played for avg-of-avgs (not cnt which was games count)
                // Wait! Average of Averages should divide by games count (cnt).
                const count = p.cnt || 1;
                const avg_t = p.at / count; const avg_9 = p.a9 / count; const avg_18 = p.a18 / count;
                const sq = p.gp > 0 ? (p.w / p.gp) * 100 : 0;
                const ah = p.lt > 0 ? (p.c80 + p.c100 + p.c140 + p.c180) / p.lt : 0;
                const pk1 = Math.round(avg_t); const pk2 = Math.round(avg_9); const pk3 = Math.round(avg_18); const pk4 = Math.round(sq); const pk5 = Math.round(ah * 100);
                const total = (pk1 * weights.k1) + (pk2 * weights.k2) + (pk3 * weights.k3) + (pk4 * weights.k4) + (pk5 * weights.k5);
                return { ...p, total: Math.round(total * 100) / 100, avg_t, avg_9, avg_18, sq, ah, pk1, pk2, pk3, pk4, pk5 };
            }).sort((a,b) => b.total - a.total || b.avg_t - a.avg_t);

            const old = await client.query('SELECT snapshot_id FROM "Snapshot" WHERE week_id = $1', [weekId]);
            for (const row of old.rows) {
                await client.query('DELETE FROM "SnapshotPlayerValue" WHERE snapshot_id = $1', [row.snapshot_id]);
                await client.query('DELETE FROM "Snapshot" WHERE snapshot_id = $1', [row.snapshot_id]);
            }
            const snap = await client.query('INSERT INTO "Snapshot" (week_id, timestamp) VALUES ($1, NOW()) RETURNING snapshot_id', [weekId]);
            const sid = snap.rows[0].snapshot_id;
            for (let i = 0; i < ranked.length; i++) {
                const p = ranked[i];
                await client.query(`
                    INSERT INTO "SnapshotPlayerValue" (
                        snapshot_id, player_name, verein, gespielte_single_spiele, gespielte_legs,
                        avg_total, avg_9, avg_18, wins, games_played, siegequote_pct,
                        cnt_80, cnt_100, cnt_140, cnt_180, sum_high_scores, avg_high_per_leg,
                        points_k1, points_k2, points_k3, points_k4, points_k5,
                        total_points, rank, source
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, 'robust_sync')
                `, [
                    sid, p.name, p.v, p.gp, p.lt, p.avg_t, p.avg_9, p.avg_18, p.w, p.gp, p.sq,
                    p.c80, p.c100, p.c140, p.c180, (p.c80+p.c100+p.c140+p.c180), p.ah,
                    p.pk1, p.pk2, p.pk3, p.pk4, p.pk5, p.total, i + 1
                ]);
            }
            console.log(`${weekId} DONE.`);
        }
    } catch (e) { console.error(e); } finally { await client.end(); }
}
run();
