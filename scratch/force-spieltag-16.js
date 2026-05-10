const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Mock the scoring logic
function calculatePointsK1toK3(avg) {
    if (avg < 25) return 0; if (avg < 30) return 1; if (avg < 35) return 2; if (avg < 40) return 3;
    if (avg < 42.5) return 4; if (avg < 45) return 5; if (avg < 47.5) return 6; if (avg < 50) return 7;
    if (avg < 55) return 8; if (avg < 60) return 9; return 10;
}
function calculatePointsK4(pct) {
    if (pct < 10) return 0; if (pct < 20) return 1; if (pct < 30) return 2; if (pct < 40) return 3;
    if (pct < 50) return 4; if (pct < 60) return 5; if (pct < 70) return 6; if (pct < 80) return 7;
    if (pct < 85) return 8; if (pct < 90) return 9; return 10;
}
function calculatePointsK5(hpl) {
    if (hpl <= 0.2) return 0; if (hpl <= 0.4) return 1; if (hpl <= 0.6) return 2; if (hpl <= 0.8) return 3;
    if (hpl <= 1.0) return 4; if (hpl <= 1.2) return 5; if (hpl <= 1.4) return 6; if (hpl <= 1.6) return 7;
    if (hpl <= 1.8) return 8; if (hpl <= 2.0) return 9; return 10;
}

const LIONS_NAMES = [
  "André Rathje", "Dirk Ostermann", "Erik Schremmer", "Jannik Baier", 
  "Jens Goltermann", "Joachim Koch", "Karen Schulz", "Karsten Kohnert", 
  "Kevin Emde", "Maik Feuerhahn", "Malte Wolnik", "Martin Wolnik", 
  "Michael Gehrt", "Michael Kranz", "Nicholas Stedman", "Sebastian Kirste", 
  "Timo Feuerhahn"
];

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' };

async function runRecovery() {
    console.log("Starting Recovery for Spieltag 16...");
    const targetWeekId = "Spieltag 16";
    
    // 1. Fetch from API
    const aggregatedMap = new Map();
    for (const name of LIONS_NAMES) {
        aggregatedMap.set(name, { player_name: name, verein: name === "Jens Goltermann" ? "DC Wettmershagen A" : "Lions Weyhausen", wins: 0, gespielte_single_spiele: 0, gespielte_legs: 0, weighted_avg_total: 0, weighted_avg_9: 0, weighted_avg_18: 0, total_legs_for_avg: 0, cnt_80: 0, cnt_100: 0, cnt_140: 0, cnt_180: 0 });
    }

    const events = [247, 251, 239];
    const normalizedLions = new Map(LIONS_NAMES.map(n => [n.trim().toLowerCase(), n]));

    for (const id of events) {
        const url = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${id}/statistics`;
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) continue;
        const stats = await res.json();
        for (const s of stats) {
            if (s.type !== 'MATCH') continue;
            const norm = (s.displayName || "").trim().toLowerCase();
            if (id === 239 && norm !== "jens goltermann") continue;
            if (!normalizedLions.has(norm)) continue;
            
            const name = normalizedLions.get(norm);
            const p = aggregatedMap.get(name);
            const legs = (s.legCount || 0) + (s.legCountOpponent || 0);
            p.wins += (s.matchesWon || 0);
            p.gespielte_single_spiele += (s.matchesTotal || 0);
            p.gespielte_legs += legs;
            p.weighted_avg_total += (s.scoreTotal && s.dartsTotal) ? (s.scoreTotal / s.dartsTotal * 3 * legs) : 0;
            p.weighted_avg_9 += (s.scoreFirst9 && s.dartsFirst9) ? (s.scoreFirst9 / s.dartsFirst9 * 3 * legs) : 0;
            p.weighted_avg_18 += (s.scoreFirst18 && s.dartsFirst18) ? (s.scoreFirst18 / s.dartsFirst18 * 3 * legs) : 0;
            p.total_legs_for_avg += legs;
            p.cnt_80 += (s.count80 || 0);
            p.cnt_100 += (s.count100 || 0);
            p.cnt_140 += (s.count140 || 0);
            p.cnt_180 += (s.count180 || 0);
        }
    }

    // 2. Merge Manual
    const manual = await prisma.manualGame.findMany();
    for (const mg of manual) {
        const p = aggregatedMap.get(mg.player_name);
        if (!p) continue;
        const isOff = !!mg.is_offline;
        const mgLegs = isOff ? (mg.legs_won + mg.legs_lost) : mg.legs_total;
        const mgWins = isOff ? (mg.legs_won > mg.legs_lost ? 1 : 0) : ((mg.game1_win ? 1 : 0) + (mg.game2_win ? 1 : 0));
        p.wins += mgWins; p.gespielte_single_spiele += (isOff ? 1 : 2); p.gespielte_legs += mgLegs;
        if (!isOff) {
            p.weighted_avg_total += (mg.game1_avg + mg.game2_avg) * (mgLegs / 4); // simplistic but compatible
            p.weighted_avg_9 += (mg.game1_avg_9 + mg.game2_avg_9) * (mgLegs / 4);
            p.weighted_avg_18 += (mg.game1_avg_18 + mg.game2_avg_18) * (mgLegs / 4);
            p.total_legs_for_avg += mgLegs; p.cnt_80 += mg.cnt_80; p.cnt_100 += mg.cnt_100; p.cnt_140 += mg.cnt_140; p.cnt_180 += mg.cnt_180;
        }
    }

    const ranked = Array.from(aggregatedMap.values()).map(p => {
        const avg = p.total_legs_for_avg > 0 ? p.weighted_avg_total / p.total_legs_for_avg : 0;
        const avg9 = p.total_legs_for_avg > 0 ? p.weighted_avg_9 / p.total_legs_for_avg : 0;
        const avg18 = p.total_legs_for_avg > 0 ? p.weighted_avg_18 / p.total_legs_for_avg : 0;
        const hpl = p.gespielte_legs > 0 ? (p.cnt_80 + p.cnt_100 + p.cnt_140 + p.cnt_180) / p.gespielte_legs : 0;
        const sq = p.gespielte_single_spiele > 0 ? (p.wins / p.gespielte_single_spiele * 100) : 0;
        const p1 = calculatePointsK1toK3(avg); const p2 = calculatePointsK1toK3(avg9); const p3 = calculatePointsK1toK3(avg18); const p4 = calculatePointsK4(sq); const p5 = calculatePointsK5(hpl);
        const total = Math.round((p1 * 0.2 + p2 * 0.15 + p3 * 0.15 + p4 * 0.25 + p5 * 0.25) * 5 * 100) / 100;
        return { ...p, avg_total: avg, avg_9: avg9, avg_18: avg18, siegequote_pct: sq, avg_high_per_leg: hpl, points_k1: p1, points_k2: p2, points_k3: p3, points_k4: p4, points_k5: p5, total_points: total };
    });
    ranked.sort((a,b) => b.total_points - a.total_points);

    // 3. Save
    const old = await prisma.snapshot.findMany({ where: { OR: [{ week_id: targetWeekId }, { week_id: "Saison 2025/26 - Final" }] } });
    for (const o of old) { await prisma.snapshotPlayerValue.deleteMany({ where: { snapshot_id: o.snapshot_id } }); await prisma.snapshot.delete({ where: { snapshot_id: o.snapshot_id } }); }
    
    const snap = await prisma.snapshot.create({ data: { week_id: targetWeekId, timestamp: new Date() } });
    for (let i=0; i<ranked.length; i++) {
        const r = ranked[i];
        await prisma.snapshotPlayerValue.create({ data: { snapshot_id: snap.snapshot_id, player_name: r.player_name, verein: r.verein, gespielte_single_spiele: r.gespielte_single_spiele, gespielte_legs: r.gespielte_legs, avg_total: r.avg_total, avg_9: r.avg_9, avg_18: r.avg_18, wins: r.wins, games_played: r.gespielte_single_spiele, siegequote_pct: r.siegequote_pct, cnt_80: r.cnt_80, cnt_100: r.cnt_100, cnt_140: r.cnt_140, cnt_180: r.cnt_180, sum_high_scores: r.cnt_80+r.cnt_100+r.cnt_140+r.cnt_180, avg_high_per_leg: r.avg_high_per_leg, points_k1: r.points_k1, points_k2: r.points_k2, points_k3: r.points_k3, points_k4: r.points_k4, points_k5: r.points_k5, total_points: r.total_points, rank: i+1, source: 'recovery' } });
    }
    console.log(`Snapshot ${snap.snapshot_id} created with ${ranked.length} players.`);
}

runRecovery().finally(() => { pool.end(); prisma.$disconnect(); });
