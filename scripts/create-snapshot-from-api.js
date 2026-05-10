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

// Extracted Lions player names (singles only)
const LIONS_NAMES = new Set([
  "André Rathje", "Dirk Ostermann", "Erik Schremmer", "Jannik Baier", 
  "Jens Goltermann", "Joachim Koch", "Karen Schulz", "Karsten Kohnert", 
  "Kevin Emde", "Maik Feuerhahn", "Malte Wolnik", "Martin Wolnik", 
  "Michael Gehrt", "Michael Kranz", "Nicholas Stedman", "Sebastian Kirste", 
  "Timo Feuerhahn"
]);

const EVENTS = [
    { eventId: 247, name: "Lions Weyhausen A" },
    { eventId: 251, name: "Lions Weyhausen B" },
    { eventId: 239, name: "DC Wettmershagen A (for Jens Goltermann)" },
];

// Scoring functions
function calculatePointsK1toK3(avg) {
    if (avg < 25.0) return 0;
    if (avg < 30.0) return 1;
    if (avg < 35.0) return 2;
    if (avg < 40.0) return 3;
    if (avg < 42.5) return 4;
    if (avg < 45.0) return 5;
    if (avg < 47.5) return 6;
    if (avg < 50.0) return 7;
    if (avg < 55.0) return 8;
    if (avg < 60.0) return 9;
    return 10;
}

function calculatePointsK4(winRatePct) {
    if (winRatePct < 10.0) return 0;
    if (winRatePct < 20.0) return 1;
    if (winRatePct < 30.0) return 2;
    if (winRatePct < 40.0) return 3;
    if (winRatePct < 50.0) return 4;
    if (winRatePct < 60.0) return 5;
    if (winRatePct < 70.0) return 6;
    if (winRatePct < 80.0) return 7;
    if (winRatePct < 85.0) return 8;
    if (winRatePct < 90.0) return 9;
    return 10;
}

function calculatePointsK5(avgHighPerLeg) {
    if (avgHighPerLeg <= 0.20) return 0;
    if (avgHighPerLeg <= 0.40) return 1;
    if (avgHighPerLeg <= 0.60) return 2;
    if (avgHighPerLeg <= 0.80) return 3;
    if (avgHighPerLeg <= 1.00) return 4;
    if (avgHighPerLeg <= 1.20) return 5;
    if (avgHighPerLeg <= 1.40) return 6;
    if (avgHighPerLeg <= 1.60) return 7;
    if (avgHighPerLeg <= 1.80) return 8;
    if (avgHighPerLeg <= 2.00) return 9;
    return 10;
}

async function createSnapshotFromStats() {
    console.log("[Snapshot] Starting direct snapshot creation including Jens Goltermann from Wettmershagen...\n");
    
    const playersMap = new Map();
    
    for (const ev of EVENTS) {
        console.log(`[Snapshot] Fetching stats for ${ev.name} (Event ${ev.eventId})...`);
        const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${ev.eventId}/statistics`;
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) { console.error(`Failed: ${res.status}`); continue; }
        const allStats = await res.json();
        
        // Filter: 
        // For Event 239, only take Jens Goltermann.
        // For others, take all Lions names.
        const stats = allStats.filter(s => {
            if (s.type !== 'MATCH') return false;
            if (ev.eventId === 239) return s.displayName === "Jens Goltermann";
            return LIONS_NAMES.has(s.displayName);
        });
        
        console.log(`  Found ${stats.length} relevant names in stats.`);
        
        for (const s of stats) {
            const name = s.displayName;
            if (playersMap.has(name)) {
                const existing = playersMap.get(name);
                existing.dartsTotal += s.dartsTotal || 0;
                existing.scoreTotal += s.scoreTotal || 0;
                existing.dartsFirst9 += s.dartsFirst9 || 0;
                existing.scoreFirst9 += s.scoreFirst9 || 0;
                existing.dartsFirst18 += s.dartsFirst18 || 0;
                existing.scoreFirst18 += s.scoreFirst18 || 0;
                existing.legCount += s.legCount || 0;
                existing.legCountOpponent += s.legCountOpponent || 0;
                existing.matchesWon += s.matchesWon || 0;
                existing.matchesTotal += s.matchesTotal || 0;
                existing.count80 += s.count80 || 0;
                existing.count100 += s.count100 || 0;
                existing.count140 += s.count140 || 0;
                existing.count180 += s.count180 || 0;
            } else {
                playersMap.set(name, {
                    dartsTotal: s.dartsTotal || 0,
                    scoreTotal: s.scoreTotal || 0,
                    dartsFirst9: s.dartsFirst9 || 0,
                    scoreFirst9: s.scoreFirst9 || 0,
                    dartsFirst18: s.dartsFirst18 || 0,
                    scoreFirst18: s.scoreFirst18 || 0,
                    legCount: s.legCount || 0,
                    legCountOpponent: s.legCountOpponent || 0,
                    matchesWon: s.matchesWon || 0,
                    matchesTotal: s.matchesTotal || 0,
                    count80: s.count80 || 0,
                    count100: s.count100 || 0,
                    count140: s.count140 || 0,
                    count180: s.count180 || 0,
                });
            }
        }
    }
    
    console.log(`\n[Snapshot] Total unique players with stats: ${playersMap.size}`);
    
    const manualGames = await prisma.manualGame.findMany();
    console.log(`[Snapshot] Processing ${manualGames.length} manual games...`);
    
    const allPlayersNames = new Set([...playersMap.keys(), ...manualGames.map(mg => mg.player_name)]);
    const ranked = [];
    
    let config;
    try { config = await prisma.rankingConfig.findUnique({ where: { id: 1 } }); } catch (e) {}
    if (!config) config = { weight_k1: 0.20, weight_k2: 0.15, weight_k3: 0.15, weight_k4: 0.25, weight_k5: 0.25 };
    
    for (const name of allPlayersNames) {
        const s = playersMap.get(name) || {
            dartsTotal: 0, scoreTotal: 0, dartsFirst9: 0, scoreFirst9: 0, 
            dartsFirst18: 0, scoreFirst18: 0, legCount: 0, legCountOpponent: 0, 
            matchesWon: 0, matchesTotal: 0, count80: 0, count100: 0, count140: 0, count180: 0
        };
        
        let games_played = s.matchesTotal;
        let wins = s.matchesWon;
        let total_legs = s.legCount + s.legCountOpponent;
        let cnt_80 = s.count80, cnt_100 = s.count100, cnt_140 = s.count140, cnt_180 = s.count180;
        
        const playerManual = manualGames.filter(mg => mg.player_name === name);
        for (const mg of playerManual) {
            const isOffline = !!mg.is_offline;
            games_played += isOffline ? 1 : 2;
            wins += isOffline ? (mg.legs_won > mg.legs_lost ? 1 : 0) : ((mg.game1_win ? 1 : 0) + (mg.game2_win ? 1 : 0));
            total_legs += isOffline ? (mg.legs_won + mg.legs_lost) : mg.legs_total;
            if (!isOffline) {
                cnt_80 += mg.cnt_80 || 0;
                cnt_100 += mg.cnt_100 || 0;
                cnt_140 += mg.cnt_140 || 0;
                cnt_180 += mg.cnt_180 || 0;
            }
        }
        
        const avg_total = s.dartsTotal > 0 ? (s.scoreTotal / s.dartsTotal) * 3 : 0;
        const avg_9 = s.dartsFirst9 > 0 ? (s.scoreFirst9 / s.dartsFirst9) * 3 : 0;
        const avg_18 = s.dartsFirst18 > 0 ? (s.scoreFirst18 / s.dartsFirst18) * 3 : 0;
        
        const sum_high_scores = cnt_80 + cnt_100 + cnt_140 + cnt_180;
        const avg_high_per_leg = total_legs > 0 ? Math.round((sum_high_scores / total_legs) * 100) / 100 : 0;
        const siegequote_pct = games_played > 0 ? Math.round((wins / games_played) * 10000) / 100 : 0;
        
        const points_k1 = calculatePointsK1toK3(avg_total);
        const points_k2 = calculatePointsK1toK3(avg_9);
        const points_k3 = calculatePointsK1toK3(avg_18);
        const points_k4 = calculatePointsK4(siegequote_pct);
        const points_k5 = calculatePointsK5(avg_high_per_leg);
        
        const weighted_sum = 
            (points_k1 * config.weight_k1) +
            (points_k2 * config.weight_k2) +
            (points_k3 * config.weight_k3) +
            (points_k4 * config.weight_k4) +
            (points_k5 * config.weight_k5);
        const total_points = Math.round(weighted_sum * 5 * 100) / 100;
        
        ranked.push({
            player_name: name,
            verein: name === "Jens Goltermann" ? "DC Wettmershagen A" : "Lions Weyhausen",
            gespielte_single_spiele: games_played,
            gespielte_legs: total_legs,
            avg_total, avg_9, avg_18,
            wins, games_played,
            siegequote_pct,
            cnt_80, cnt_100, cnt_140, cnt_180,
            sum_high_scores, avg_high_per_leg,
            points_k1, points_k2, points_k3, points_k4, points_k5,
            total_points
        });
    }
    
    ranked.sort((a, b) => b.total_points - a.total_points);
    
    const weekId = "Saison 2025/26 - Final";
    console.log(`\n[Snapshot] Creating snapshot "${weekId}" with ${ranked.length} players...`);
    
    // Delete previous recovery snapshot
    const existing = await prisma.snapshot.findFirst({ where: { week_id: weekId } });
    if (existing) {
        await prisma.snapshotPlayerValue.deleteMany({ where: { snapshot_id: existing.snapshot_id } });
        await prisma.snapshot.delete({ where: { snapshot_id: existing.snapshot_id } });
        console.log(`[Snapshot] Deleted existing recovery snapshot ${existing.snapshot_id}.`);
    }

    const snapshot = await prisma.snapshot.create({ data: { week_id: weekId, timestamp: new Date() } });
    
    for (let i = 0; i < ranked.length; i++) {
        const p = ranked[i];
        await prisma.snapshotPlayerValue.create({
            data: {
                snapshot_id: snapshot.snapshot_id,
                player_name: p.player_name,
                verein: p.verein,
                gespielte_single_spiele: p.gespielte_single_spiele,
                gespielte_legs: p.gespielte_legs,
                avg_total: p.avg_total,
                avg_9: p.avg_9,
                avg_18: p.avg_18,
                wins: p.wins,
                games_played: p.games_played,
                siegequote_pct: p.siegequote_pct,
                cnt_80: p.cnt_80,
                cnt_100: p.cnt_100,
                cnt_140: p.cnt_140,
                cnt_180: p.cnt_180,
                sum_high_scores: p.sum_high_scores,
                avg_high_per_leg: p.avg_high_per_leg,
                points_k1: p.points_k1,
                points_k2: p.points_k2,
                points_k3: p.points_k3,
                points_k4: p.points_k4,
                points_k5: p.points_k5,
                total_points: p.total_points,
                rank: i + 1,
                source: 'webscraper',
                veto_flag: false,
            }
        });
    }
    
    console.log(`[Snapshot] Success! Snapshot ID: ${snapshot.snapshot_id}`);
}

createSnapshotFromStats()
    .then(() => process.exit(0))
    .catch(e => { console.error("[Snapshot] Fatal error:", e); process.exit(1); });
