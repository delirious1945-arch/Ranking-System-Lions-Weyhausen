import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    calculatePointsK1toK3,
    calculatePointsK4,
    calculatePointsK5,
    calculateWeightedTotal
} from '@/lib/scoring';
import { LIONS_NAMES, DEFAULT_WEIGHTS } from '@/lib/lions-config';
import { getWeekId } from '@/lib/date-utils';
import { updateMatchCache, getAggregateStatsUpTo } from '@/lib/match-service';

/**
 * Robust Snapshot Update API
 * This route aggregates season statistics from 3k-darts (Events 247, 251, 239)
 * and merges them with local manualGame records.
 * 
 * FIXES:
 * 1. cache: 'no-store' added to fetch calls to bypass Next.js cache.
 * 2. Pre-initialization of all 17 players to ensure none are missing.
 * 3. Robust name matching (case-insensitive, trimmed).
 * 4. Cleanup of "Saison 2025/26 - Final" and current Spieltag.
 */

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// Removed fetchSeasonStats: Logic moved to MatchService

export async function POST(req?: Request) {
    let targetWeekId: string | null = null;

    if (req) {
        try {
            const body = await req.json();
            if (body?.targetWeekId) {
                targetWeekId = body.targetWeekId;
            }
        } catch (e) { /* ignore */ }
    }

    const currentWeekId = targetWeekId || getWeekId();
    console.log(`[update-snapshot] Working on ${currentWeekId}...`);

    try {
        // 1. Update Match Cache from 3k-Darts (Includes name canonicalization)
        console.log("[update-snapshot] Step 1: Updating Match Cache...");
        await updateMatchCache();

        // 2. Aggregate Stats up to targeting Spieltag (Guaranteed 17 Players)
        console.log("[update-snapshot] Step 2: Aggregating stats...");
        const weekNum = parseInt(currentWeekId.replace(/\D/g, '')) || 16;
        const seasonalStats = await getAggregateStatsUpTo(weekNum);

        console.log(`[update-snapshot] Step 3: Success. Aggregated ${seasonalStats.length} players for ${currentWeekId}`);

        // 6. Fetch Ranking Configuration
        let config = await prisma.rankingConfig.findUnique({ where: { id: 1 } });
        const weights = config ? {
            weight_k1: config.weight_k1,
            weight_k2: config.weight_k2,
            weight_k3: config.weight_k3,
            weight_k4: config.weight_k4,
            weight_k5: config.weight_k5,
        } : DEFAULT_WEIGHTS;

        // 7. Compute Final Snapshot Values
        const ranked = seasonalStats.map(p => {
            const points_k1 = calculatePointsK1toK3(p.avg_total);
            const points_k2 = calculatePointsK1toK3(p.avg_9);
            const points_k3 = calculatePointsK1toK3(p.avg_18);
            const points_k4 = calculatePointsK4(p.siegequote_pct);
            const points_k5 = calculatePointsK5(p.avg_high_per_leg);

            const total_points = calculateWeightedTotal(
                { p1: points_k1, p2: points_k2, p3: points_k3, p4: points_k4, p5: points_k5 },
                weights
            );

            return {
                ...p,
                points_k1, points_k2, points_k3, points_k4, points_k5,
                total_points,
            };
        });

        // Sort descending
        ranked.sort((a, b) => b.total_points - a.total_points || b.avg_total - a.avg_total);

        // 8. DB Cleanup and Save
        const snapshotsToDelete = await prisma.snapshot.findMany({
            where: {
                OR: [
                    { week_id: currentWeekId },
                    { week_id: "Saison 2025/26 - Final" }
                ]
            },
            select: { snapshot_id: true }
        });

        for (const old of snapshotsToDelete) {
            await prisma.snapshotPlayerValue.deleteMany({ where: { snapshot_id: old.snapshot_id } });
            await prisma.snapshot.delete({ where: { snapshot_id: old.snapshot_id } });
        }

        const snapshot = await prisma.snapshot.create({
            data: { week_id: currentWeekId, timestamp: new Date() }
        });

        for (let i = 0; i < ranked.length; i++) {
            const p = ranked[i];
            await prisma.snapshotPlayerValue.create({
                data: {
                    snapshot_id: snapshot.snapshot_id,
                    player_name: p.player_name,
                    verein: p.verein,
                    gespielte_single_spiele: p.gespielte_single_spiele || 0,
                    gespielte_legs: p.gespielte_legs || 0,
                    avg_total: p.avg_total || 0,
                    avg_9: p.avg_9 || 0,
                    avg_18: p.avg_18 || 0,
                    wins: p.wins || 0,
                    games_played: p.games_played || 0,
                    siegequote_pct: p.siegequote_pct || 0,
                    cnt_80: p.cnt_80 || 0,
                    cnt_100: p.cnt_100 || 0,
                    cnt_140: p.cnt_140 || 0,
                    cnt_180: p.cnt_180 || 0,
                    sum_high_scores: p.sum_high_scores || 0,
                    avg_high_per_leg: p.avg_high_per_leg || 0,
                    points_k1: p.points_k1 || 0,
                    points_k2: p.points_k2 || 0,
                    points_k3: p.points_k3 || 0,
                    points_k4: p.points_k4 || 0,
                    points_k5: p.points_k5 || 0,
                    total_points: p.total_points || 0,
                    rank: i + 1,
                    source: 'webscraper',
                    veto_flag: false,
                }
            });
        }

        console.log(`[update-snapshot] Snapshot ${snapshot.snapshot_id} (${currentWeekId}) saved with ${ranked.length} players`);

        return NextResponse.json({
            success: true,
            snapshot_id: snapshot.snapshot_id,
            week_id: currentWeekId,
            players_saved: ranked.length
        });

    } catch (error) {
        console.error('[update-snapshot] Error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
