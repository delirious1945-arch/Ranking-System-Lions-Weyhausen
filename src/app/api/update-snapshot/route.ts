import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    calculatePointsK1toK3,
    calculatePointsK4,
    calculatePointsK5
} from '@/lib/scoring';
import { updateMatchCache, getSnapshotStats } from '@/lib/match-service';

// Configuration and Helpers moved to match-service or scoring

// ─── Shared getWeekId logic ───
function getWeekId(): string {
    const now = new Date();
    const shifted = new Date(now);
    shifted.setDate(shifted.getDate() + 3);
    const d = new Date(Date.UTC(shifted.getFullYear(), shifted.getMonth(), shifted.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const spieltag = weekNo;
    return `Spieltag ${spieltag}`;
}

export async function POST(req?: Request) {
    let targetWeekId: string | null = null;

    if (req) {
        try {
            const body = await req.json();
            if (body?.targetWeekId) {
                targetWeekId = body.targetWeekId;
            }
        } catch (e) {
            // ignore
        }
    }

    try {
        // 1. Optional: Update Match Cache from 2k-dart-software API
        // We only do this if explicitly requested or if it's likely to be fast.
        // For the two-step process, we prefer calling /api/sync-matches separately.
        const url = new URL(req?.url || "");
        const shouldSync = url.searchParams.get("sync") === "true";
        
        if (shouldSync) {
            console.log("[update-snapshot] Syncing match cache as requested...");
            await updateMatchCache();
        }

        // 2. Aggregate all matches from current DB state
        const allScrapedRaw = await getSnapshotStats();


        const currentWeekId = targetWeekId || getWeekId();

        // 3. Fetch all Manual Games across the season
        const manualGames = await prisma.manualGame.findMany();

        console.log(`[update-snapshot] Total players from API: ${allScrapedRaw.length}`);

        // --- Aggregation & Manual Games Merge ---
        const aggregatedMap = new Map<string, any>();

        for (const p of allScrapedRaw) {
            const playerInfo = await prisma.player.findUnique({ where: { player_name: p.player_name } });
            
            aggregatedMap.set(p.player_name, {
                ...p,
                verein: playerInfo?.verein || "Lions Weyhausen",
                weighted_avg_total: p.avg_total * p.gespielte_legs,
                weighted_avg_9: p.avg_9 * p.gespielte_legs,
                weighted_avg_18: p.avg_18 * p.gespielte_legs,
                total_legs_for_avg: p.gespielte_legs,
            });
        }

        // --- Merge Manual Games ---
        for (const mg of manualGames) {
            const existing = aggregatedMap.get(mg.player_name);
            const isOffline = !!mg.is_offline;
            
            // For offline matches, we use the actual reported score (legs_won/lost)
            // For standard matches, we still use the legs_total logic
            const mgLegs = isOffline ? (mg.legs_won + mg.legs_lost) : mg.legs_total;
            const halfLegs = mgLegs / 2;
            const mgWins = isOffline ? (mg.legs_won > mg.legs_lost ? 1 : 0) : ((mg.game1_win ? 1 : 0) + (mg.game2_win ? 1 : 0));
            const mgWinsCount = isOffline ? (mg.legs_won > mg.legs_lost ? 1 : 0) : ((mg.game1_win ? 1 : 0) + (mg.game2_win ? 1 : 0));
            const mgGamesCount = isOffline ? 1 : 2;

            if (existing) {
                existing.wins += mgWinsCount;
                existing.legs_won += isOffline ? mg.legs_won : halfLegs;
                existing.gespielte_single_spiele += mgGamesCount;
                existing.gespielte_legs += mgLegs;
                
                if (!isOffline) {
                    const mgWeightedTotal = (mg.game1_avg * halfLegs) + (mg.game2_avg * halfLegs);
                    const mgWeighted9 = (mg.game1_avg_9 * halfLegs) + (mg.game2_avg_9 * halfLegs);
                    const mgWeighted18 = (mg.game1_avg_18 * halfLegs) + (mg.game2_avg_18 * halfLegs);
                    
                    existing.cnt_80 += mg.cnt_80;
                    existing.cnt_100 += mg.cnt_100;
                    existing.cnt_140 += mg.cnt_140;
                    existing.cnt_180 += mg.cnt_180;
                    existing.weighted_avg_total += mgWeightedTotal;
                    existing.weighted_avg_9 += mgWeighted9;
                    existing.weighted_avg_18 += mgWeighted18;
                    existing.total_legs_for_avg += mgLegs;
                    existing.sum_high_scores += (mg.cnt_80 * 80 + mg.cnt_100 * 100 + mg.cnt_140 * 140 + mg.cnt_180 * 180);
                }
            } else {
                aggregatedMap.set(mg.player_name, {
                    player_name: mg.player_name,
                    verein: "Lions Weyhausen",
                    wins: mgWinsCount,
                    legs_won: isOffline ? mg.legs_won : halfLegs,
                    gespielte_single_spiele: mgGamesCount,
                    gespielte_legs: mgLegs,
                    // If offline, these start at 0 and stay there
                    weighted_avg_total: isOffline ? 0 : ((mg.game1_avg * halfLegs) + (mg.game2_avg * halfLegs)),
                    weighted_avg_9: isOffline ? 0 : ((mg.game1_avg_9 * halfLegs) + (mg.game2_avg_9 * halfLegs)),
                    weighted_avg_18: isOffline ? 0 : ((mg.game1_avg_18 * halfLegs) + (mg.game2_avg_18 * halfLegs)),
                    total_legs_for_avg: isOffline ? 0 : mgLegs,
                    cnt_80: isOffline ? 0 : mg.cnt_80,
                    cnt_100: isOffline ? 0 : mg.cnt_100,
                    cnt_140: isOffline ? 0 : mg.cnt_140,
                    cnt_180: isOffline ? 0 : mg.cnt_180,
                    sum_high_scores: isOffline ? 0 : (mg.cnt_80 * 80 + mg.cnt_100 * 100 + mg.cnt_140 * 140 + mg.cnt_180 * 180),
                });
            }
        }

        // --- Fetch Ranking Configuration ---
        let config = await prisma.rankingConfig.findUnique({ where: { id: 1 } });
        if (!config) {
            config = {
                weight_k1: 0.20,
                weight_k2: 0.15,
                weight_k3: 0.15,
                weight_k4: 0.25,
                weight_k5: 0.25
            } as any;
        }

        // --- Compute ranking for each player ---
        interface RankedPlayer {
            player_name: string;
            verein: string;
            gespielte_single_spiele: number;
            gespielte_legs: number;
            avg_total: number;
            avg_9: number;
            avg_18: number;
            wins: number;
            games_played: number;
            siegequote_pct: number;
            cnt_80: number;
            cnt_100: number;
            cnt_140: number;
            cnt_180: number;
            sum_high_scores: number;
            avg_high_per_leg: number;
            points_k1: number;
            points_k2: number;
            points_k3: number;
            points_k4: number;
            points_k5: number;
            total_points: number;
        }

        const ranked: RankedPlayer[] = Array.from(aggregatedMap.values()).map(p => {
            const gespielte_legs = p.gespielte_legs;
            const avg_total = p.total_legs_for_avg > 0 ? p.weighted_avg_total / p.total_legs_for_avg : 0;
            const avg_9 = p.total_legs_for_avg > 0 ? p.weighted_avg_9 / p.total_legs_for_avg : 0;
            const avg_18 = p.total_legs_for_avg > 0 ? p.weighted_avg_18 / p.total_legs_for_avg : 0;

            const sum_high_scores = p.cnt_80 + p.cnt_100 + p.cnt_140 + p.cnt_180;
            const avg_high_per_leg = gespielte_legs > 0
                ? Math.round((sum_high_scores / gespielte_legs) * 100) / 100 : 0;

            const games_played = p.gespielte_single_spiele;
            const siegequote_pct = games_played > 0
                ? Math.round((p.wins / games_played) * 10000) / 100 : 0;

            const points_k1 = calculatePointsK1toK3(avg_total);
            const points_k2 = calculatePointsK1toK3(avg_9);
            const points_k3 = calculatePointsK1toK3(avg_18);
            const points_k4 = calculatePointsK4(siegequote_pct);
            const points_k5 = calculatePointsK5(avg_high_per_leg);

            // Apply dynamic weights
            // Categories are 0-10 points. Weights sum to 1.0 (100%).
            // (weighted_sum) gives a value between 0 and 10.
            // Multiplying by 5 gives a total points range of 0-50 (consistent with 5 categories * 10 pts).
            const weighted_sum =
                (points_k1 * config!.weight_k1) +
                (points_k2 * config!.weight_k2) +
                (points_k3 * config!.weight_k3) +
                (points_k4 * config!.weight_k4) +
                (points_k5 * config!.weight_k5);

            const final_total = Math.round(weighted_sum * 5 * 100) / 100;

            return {
                player_name: p.player_name,
                verein: p.verein,
                gespielte_single_spiele: games_played,
                gespielte_legs,
                avg_total,
                avg_9,
                avg_18,
                wins: p.wins,
                games_played,
                siegequote_pct,
                cnt_80: p.cnt_80,
                cnt_100: p.cnt_100,
                cnt_140: p.cnt_140,
                cnt_180: p.cnt_180,
                sum_high_scores,
                avg_high_per_leg,
                points_k1,
                points_k2,
                points_k3,
                points_k4,
                points_k5,
                total_points: final_total,
            };
        });

        // Sort descending by total_points
        ranked.sort((a, b) => b.total_points - a.total_points);

        // Save snapshot — upsert: keep only ONE snapshot per week
        const weekId = getWeekId();

        // Delete existing snapshots for this week (and their player values)
        const existingSnapshots = await prisma.snapshot.findMany({
            where: { week_id: weekId },
            select: { snapshot_id: true }
        });

        for (const old of existingSnapshots) {
            await prisma.snapshotPlayerValue.deleteMany({
                where: { snapshot_id: old.snapshot_id }
            });
            await prisma.snapshot.delete({
                where: { snapshot_id: old.snapshot_id }
            });
        }

        const snapshot = await prisma.snapshot.create({
            data: { week_id: weekId, timestamp: new Date() }
        });

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

        console.log(`[update-snapshot] Snapshot ${snapshot.snapshot_id} (${weekId}) saved with ${ranked.length} players`);

        return NextResponse.json({
            success: true,
            snapshot_id: snapshot.snapshot_id,
            week_id: weekId,
            players_saved: ranked.length,
            preview: ranked.slice(0, 10).map((p, i) => ({
                rank: i + 1,
                name: p.player_name,
                team: p.verein,
                total_points: p.total_points,
            }))
        });

    } catch (error) {
        console.error('[update-snapshot] Error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
