import { prisma } from '../src/lib/prisma';
import { updateMatchCache, getAggregateStatsUpTo } from '../src/lib/match-service';
import { calculatePointsK1toK3, calculatePointsK4, calculatePointsK5, calculateWeightedTotal } from '../src/lib/scoring';
import { DEFAULT_WEIGHTS } from '../src/lib/lions-config';

async function run() {
    const targetWeekId = 'Spieltag 16';
    const weekNum = 16;
    
    console.log(`Starting manual regeneration for ${targetWeekId}...`);
    
    try {
        // 1. Update Cache
        console.log("Step 1: Updating Match Cache...");
        await updateMatchCache();
        
        // 2. Aggregate
        console.log("Step 2: Aggregating stats...");
        const seasonalStats = await getAggregateStatsUpTo(weekNum);
        console.log(`Found ${seasonalStats.length} players.`);
        
        // 3. Config
        let config = await prisma.rankingConfig.findUnique({ where: { id: 1 } });
        const weights = config ? {
            weight_k1: config.weight_k1,
            weight_k2: config.weight_k2,
            weight_k3: config.weight_k3,
            weight_k4: config.weight_k4,
            weight_k5: config.weight_k5,
        } : DEFAULT_WEIGHTS;
        
        // 4. Calculate
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

        ranked.sort((a, b) => b.total_points - a.total_points || b.avg_total - a.avg_total);
        
        // 5. Save
        console.log("Step 3: Saving to DB...");
        const snapshot = await prisma.snapshot.create({
            data: { week_id: targetWeekId, timestamp: new Date() }
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
                    source: 'script_regeneration',
                    veto_flag: false,
                }
            });
        }
        
        console.log("Done! Snapshot created successfully.");
        
    } catch (e) {
        console.error("Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
