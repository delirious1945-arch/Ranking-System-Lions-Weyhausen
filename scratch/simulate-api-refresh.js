const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

const LIONS_NAMES = new Set([
  "André Rathje", "Dirk Ostermann", "Erik Schremmer", "Jannik Baier", 
  "Jens Goltermann", "Joachim Koch", "Karen Schulz", "Karsten Kohnert", 
  "Kevin Emde", "Maik Feuerhahn", "Malte Wolnik", "Martin Wolnik", 
  "Michael Gehrt", "Michael Kranz", "Nicholas Stedman", "Sebastian Kirste", 
  "Timo Feuerhahn"
]);

const SCRAPE_EVENTS = [
    { eventId: 247, name: "Lions Weyhausen A" },
    { eventId: 251, name: "Lions Weyhausen B" },
    { eventId: 239, name: "DC Wettmershagen A" },
];

async function fetchSeasonStats() {
    const playersMap = new Map();
    for (const ev of SCRAPE_EVENTS) {
        console.log(`[fetchSeasonStats] Fetching ${ev.name}...`);
        const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${ev.eventId}/statistics`;
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) continue;
        const allStats = await res.json();
        const relevant = allStats.filter(s => {
            if (s.type !== 'MATCH') return false;
            if (ev.eventId === 239) return s.displayName === "Jens Goltermann";
            return LIONS_NAMES.has(s.displayName);
        });
        for (const s of relevant) {
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
                    player_name: name,
                    dartsTotal: s.dartsTotal || 0, scoreTotal: s.scoreTotal || 0,
                    dartsFirst9: s.dartsFirst9 || 0, scoreFirst9: s.scoreFirst9 || 0,
                    dartsFirst18: s.dartsFirst18 || 0, scoreFirst18: s.scoreFirst18 || 0,
                    legCount: s.legCount || 0, legCountOpponent: s.legCountOpponent || 0,
                    matchesWon: s.matchesWon || 0, matchesTotal: s.matchesTotal || 0,
                    count80: s.count80 || 0, count100: s.count100 || 0,
                    count140: s.count140 || 0, count180: s.count180 || 0,
                });
            }
        }
    }
    return Array.from(playersMap.values());
}

function getWeekId() {
    const now = new Date();
    const shifted = new Date(now);
    shifted.setDate(shifted.getDate() + 3);
    const d = new Date(Date.UTC(shifted.getFullYear(), shifted.getMonth(), shifted.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `Spieltag ${weekNo}`;
}

// Scoring helpers (simplified for scratch)
function calculatePointsK1toK3(avg) { if (avg < 25) return 0; if (avg < 30) return 1; if (avg < 35) return 2; if (avg < 40) return 3; if (avg < 42.5) return 4; if (avg < 45) return 5; if (avg < 47.5) return 6; if (avg < 50) return 7; if (avg < 55) return 8; if (avg < 60) return 9; return 10; }
function calculatePointsK4(winRatePct) { if (winRatePct < 10) return 0; if (winRatePct < 20) return 1; if (winRatePct < 30) return 2; if (winRatePct < 40) return 3; if (winRatePct < 50) return 4; if (winRatePct < 60) return 5; if (winRatePct < 70) return 6; if (winRatePct < 80) return 7; if (winRatePct < 85) return 8; if (winRatePct < 90) return 9; return 10; }
function calculatePointsK5(avg) { if (avg <= 0.2) return 0; if (avg <= 0.4) return 1; if (avg <= 0.6) return 2; if (avg <= 0.8) return 3; if (avg <= 1.0) return 4; if (avg <= 1.2) return 5; if (avg <= 1.4) return 6; if (avg <= 1.6) return 7; if (avg <= 1.8) return 8; if (avg <= 2.0) return 9; return 10; }

async function runSnapshotUpdateSimulator() {
    console.log("--- Simulating /api/update-snapshot logic ---");
    const allScrapedRaw = await fetchSeasonStats();
    const currentWeekId = getWeekId();
    const manualGames = await prisma.manualGame.findMany();
    
    const aggregatedMap = new Map();
    for (const s of allScrapedRaw) {
        const playerInfo = await prisma.player.findUnique({ where: { player_name: s.player_name } }).catch(() => null);
        const totalLegs = s.legCount + s.legCountOpponent;
        const avgTotal = s.dartsTotal > 0 ? (s.scoreTotal / s.dartsTotal) * 3 : 0;
        const avg9 = s.dartsFirst9 > 0 ? (s.scoreFirst9 / s.dartsFirst9) * 3 : 0;
        const avg18 = s.dartsFirst18 > 0 ? (s.scoreFirst18 / s.dartsFirst18) * 3 : 0;
        aggregatedMap.set(s.player_name, {
            player_name: s.player_name, verein: s.player_name === "Jens Goltermann" ? "DC Wettmershagen A" : (playerInfo?.verein || "Lions Weyhausen"),
            wins: s.matchesWon, gespielte_single_spiele: s.matchesTotal, gespielte_legs: totalLegs,
            weighted_avg_total: avgTotal * totalLegs, weighted_avg_9: avg9 * totalLegs, weighted_avg_18: avg18 * totalLegs,
            total_legs_for_avg: totalLegs, cnt_80: s.count80, cnt_100: s.count100, cnt_140: s.count140, cnt_180: s.count180
        });
    }
    
    // Manual merge (simplified)
    for (const mg of manualGames) {
        const existing = aggregatedMap.get(mg.player_name);
        const isOffline = !!mg.is_offline;
        const mgLegs = isOffline ? (mg.legs_won + mg.legs_lost) : mg.legs_total;
        const mgWinsCount = isOffline ? (mg.legs_won > mg.legs_lost ? 1 : 0) : ((mg.game1_win ? 1 : 0) + (mg.game2_win ? 1 : 0));
        if (existing) {
            existing.wins += mgWinsCount; existing.gespielte_single_spiele += (isOffline ? 1 : 2); existing.gespielte_legs += mgLegs;
        }
    }

    const ranked = Array.from(aggregatedMap.values()).map(p => {
        const avg_total = p.total_legs_for_avg > 0 ? p.weighted_avg_total / p.total_legs_for_avg : 0;
        const siegequote_pct = p.gespielte_single_spiele > 0 ? (p.wins / p.gespielte_single_spiele) * 100 : 0;
        const sum_high = p.cnt_80 + p.cnt_100 + p.cnt_140 + p.cnt_180;
        const avg_high = p.gespielte_legs > 0 ? sum_high / p.gespielte_legs : 0;
        const total = (calculatePointsK1toK3(avg_total) * 0.2 + calculatePointsK4(siegequote_pct) * 0.25 + calculatePointsK5(avg_high) * 0.25) * 5; // Simplified weights for test
        return { player_name: p.player_name, total_points: total };
    });
    ranked.sort((a,b) => b.total_points - a.total_points);

    // CLEANUP Logic
    const weekId = getWeekId();
    console.log(`Cleaning up snapshots for '${weekId}' and 'Saison 2025/26 - Final'...`);
    const snapshotsToDelete = await prisma.snapshot.findMany({
        where: { OR: [ { week_id: weekId }, { week_id: "Saison 2025/26 - Final" } ] },
        select: { snapshot_id: true }
    });
    for (const old of snapshotsToDelete) {
        await prisma.snapshotPlayerValue.deleteMany({ where: { snapshot_id: old.snapshot_id } });
        await prisma.snapshot.delete({ where: { snapshot_id: old.snapshot_id } });
        console.log(`  Deleted snapshot ${old.snapshot_id}`);
    }

    const snapshot = await prisma.snapshot.create({ data: { week_id: weekId, timestamp: new Date() } });
    console.log(`Created new snapshot ${snapshot.snapshot_id} for week ${weekId}`);
}

runSnapshotUpdateSimulator().catch(console.error).finally(()=>prisma.$disconnect());
