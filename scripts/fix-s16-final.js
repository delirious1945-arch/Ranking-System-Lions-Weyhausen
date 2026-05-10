const { Client } = require('pg');

const DEFAULT_WEIGHTS = {
    weight_k1: 0.20,
    weight_k2: 0.10,
    weight_k3: 0.10,
    weight_k4: 0.35,
    weight_k5: 0.25
};

const LIONS_NAMES = [
    "Jens Goltermann", "Dirk Ostermann", "Maik Schmidt", "Sebastian Heite", 
    "Nicholas Stedman", "Uwe Landmann", "Maik Brunn", "Detlef Polzin", 
    "Sven Polzin", "Dominik Landmann", "Dimitri Beil", "Torben Heidenreich",
    "Marco Krenz", "Holger Brandes", "Bernd Schlimme", "Rainer Seifert", "Florian Beier"
];

async function run() {
    const connectionString = 'postgresql://postgres.ehcutrlgioftulwkexgr:Lionsweyhausen1921@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';
    const client = new Client({ connectionString });
    const targetWeekId = 'Spieltag 16';
    const weekNum = 16;
    
    try {
        await client.connect();
        console.log('Connected to DB');

        // 1. Fetch ranking config
        const configRes = await client.query('SELECT * FROM "RankingConfig" WHERE id = 1');
        const weights = configRes.rows[0] ? {
            weight_k1: parseFloat(configRes.rows[0].weight_k1),
            weight_k2: parseFloat(configRes.rows[0].weight_k2),
            weight_k3: parseFloat(configRes.rows[0].weight_k3),
            weight_k4: parseFloat(configRes.rows[0].weight_k4),
            weight_k5: parseFloat(configRes.rows[0].weight_k5),
        } : DEFAULT_WEIGHTS;

        // 2. Aggregate Stats logic (simplified reproduction of MatchService)
        // Get all match records up to S16
        const matchRes = await client.query(
            'SELECT * FROM "MatchRecord" WHERE "isDouble" = false AND spieltag <= $1', 
            [weekNum]
        );
        
        const players = {};
        LIONS_NAMES.forEach(name => {
            players[name] = {
                player_name: name,
                verein: 'Lions Weyhausen', // Default
                avg_total_sum: 0,
                avg_9_sum: 0,
                avg_18_sum: 0,
                cnt_80: 0,
                cnt_100: 0,
                cnt_140: 0,
                cnt_180: 0,
                wins: 0,
                games_played: 0,
                legs_total: 0,
                gespielte_single_spiele: 0
            };
        });

        matchRes.rows.forEach(m => {
            const name = m.playerName; // CORRECTED: camelCase
            if (players[name]) {
                const p = players[name];
                p.avg_total_sum += (m.avgTotal || 0); // CORRECTED: camelCase
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
                p.verein = m.player_team || p.verein;
            }
        });

        // 3. Manual Games - Using week_id to filter numbers
        const manualRes = await client.query('SELECT * FROM "ManualGame"');
        manualRes.rows.forEach(m => {
            const mWeekNum = parseInt(m.week_id?.replace(/\D/g, '')) || 0;
            if (mWeekNum > 0 && mWeekNum <= weekNum && players[m.player_name]) {
                const p = players[m.player_name];
                p.avg_total_sum += (m.game1_avg || 0) + (m.game2_avg || 0);
                const gamesInEntry = (m.game1_avg > 0 ? 1 : 0) + (m.game2_avg > 0 ? 1 : 0);
                
                p.avg_9_sum += (m.game1_avg_9 || 0) + (m.game2_avg_9 || 0);
                p.avg_18_sum += (m.game1_avg_18 || 0) + (m.game2_avg_18 || 0);
                p.cnt_80 += (m.cnt_80 || 0);
                p.cnt_100 += (m.cnt_100 || 0);
                p.cnt_140 += (m.cnt_140 || 0);
                p.cnt_180 += (m.cnt_180 || 0);
                p.wins += (m.legs_won > m.legs_lost ? 1 : 0); // Simplified win logic for manual
                p.games_played += gamesInEntry;
                p.legs_total += (m.legs_won || 0) + (m.legs_lost || 0);
                p.gespielte_single_spiele += gamesInEntry;
            }
        });

        // 4. Scoring Logic (calculatePoints equivalents)
        const getK1toK3 = (avg) => {
            if (avg >= 100) return 100; if (avg <= 0) return 0;
            return avg; // K1-K3 is just the avg
        };
        const getK4 = (pct) => {
            if (pct >= 100) return 100; if (pct <= 0) return 0;
            return pct; // K4 is win quota
        };
        const getK5 = (avg) => {
            // Thresholds: 1.0 -> 100, 0.5 -> 50, 0.25 -> 25
            if (avg >= 1.0) return 100;
            if (avg <= 0) return 0;
            return avg * 100;
        };

        const ranked = Object.values(players).map(p => {
            const avg_total = p.gespielte_single_spiele > 0 ? p.avg_total_sum / p.gespielte_single_spiele : 0;
            const avg_9 = p.gespielte_single_spiele > 0 ? p.avg_9_sum / p.gespielte_single_spiele : 0;
            const avg_18 = p.gespielte_single_spiele > 0 ? p.avg_18_sum / p.gespielte_single_spiele : 0;
            const siegequote_pct = p.games_played > 0 ? (p.wins / p.games_played) * 100 : 0;
            const sum_high = p.cnt_80 + p.cnt_100 + p.cnt_140 + p.cnt_180;
            const avg_high_per_leg = p.legs_total > 0 ? sum_high / p.legs_total : 0;

            const pk1 = Math.round(getK1toK3(avg_total));
            const pk2 = Math.round(getK1toK3(avg_9));
            const pk3 = Math.round(getK1toK3(avg_18));
            const pk4 = Math.round(getK4(siegequote_pct));
            const pk5 = Math.round(getK5(avg_high_per_leg));

            const total = (pk1 * weights.weight_k1) + (pk2 * weights.weight_k2) + (pk3 * weights.weight_k3) + (pk4 * weights.weight_k4) + (pk5 * weights.weight_k5);

            return {
                ...p,
                avg_total, avg_9, avg_18, siegequote_pct, sum_high_scores: sum_high, avg_high_per_leg,
                points_k1: pk1, points_k2: pk2, points_k3: pk3, points_k4: pk4, points_k5: pk5,
                total_points: Math.round(total * 100) / 100
            };
        });

        ranked.sort((a, b) => b.total_points - a.total_points || b.avg_total - a.avg_total);

        // 5. Save
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
                p.cnt_80, p.cnt_100, p.cnt_140, p.cnt_180, p.sum_high_scores, p.avg_high_per_leg,
                p.points_k1, p.points_k2, p.points_k3, p.points_k4, p.points_k5,
                p.total_points, i + 1, 'script_fix_s16', false
            ]);
        }

        console.log(`Successfully regenerated ${targetWeekId} with ${ranked.length} players.`);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
