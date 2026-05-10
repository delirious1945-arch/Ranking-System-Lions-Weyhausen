const { Client } = require('pg');
const { prisma } = require('../src/lib/prisma');
const { updateMatchCache, getAggregateStatsUpTo } = require('../src/lib/match-service');

async function execute() {
    try {
        console.log('--- START EXECUTION: Restore S15 & Fix S16 ---');

        // 1. Refresh Match Cache from API
        console.log('Schritt 1: Aktualisiere Match-Cache (3K API)...');
        await updateMatchCache();
        console.log('Match-Cache aktualisiert.');

        // 2. Weights Check
        const rankingConfig = await prisma.rankingConfig.findUnique({ where: { id: 1 } });
        console.log('Nutze Gewichte aus DB:', rankingConfig);
        const weights = {
            k1: Number(rankingConfig.weight_k1),
            k2: Number(rankingConfig.weight_k2),
            k3: Number(rankingConfig.weight_k3),
            k4: Number(rankingConfig.weight_k4),
            k5: Number(rankingConfig.weight_k5)
        };

        // 3. Create/Restore S15
        console.log('Schritt 2: Generiere Spieltag 15 Snapshot...');
        const stats15 = await getAggregateStatsUpTo(15);
        
        // Remove old S15 if exists (just in case)
        const oldS15 = await prisma.snapshot.findFirst({ where: { week_id: 'Spieltag 15' } });
        if (oldS15) {
            await prisma.snapshotPlayerValue.deleteMany({ where: { snapshot_id: oldS15.snapshot_id } });
            await prisma.snapshot.delete({ where: { snapshot_id: oldS15.snapshot_id } });
        }

        const snap15 = await prisma.snapshot.create({
            data: { week_id: 'Spieltag 15', timestamp: new Date() }
        });

        for (let i = 0; i < stats15.length; i++) {
            const p = stats15[i];
            const pk1 = Math.round(p.avg_total);
            const pk2 = Math.round(p.avg_9);
            const pk3 = Math.round(p.avg_18);
            const pk4 = Math.round(p.siegequote_pct);
            const pk5 = Math.round(p.avg_high_per_leg * 100);

            const totalPoints = (pk1 * weights.k1) + (pk2 * weights.k2) + (pk3 * weights.k3) + (pk4 * weights.k4) + (pk5 * weights.k5);

            await prisma.snapshotPlayerValue.create({
                data: {
                    snapshot_id: snap15.snapshot_id,
                    player_name: p.player_name,
                    verein: p.verein,
                    gespielte_single_spiele: p.gespielte_single_spiele,
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
                    points_k1: pk1, points_k2: pk2, points_k3: pk3, points_k4: pk4, points_k5: pk5,
                    total_points: Math.round(totalPoints * 100) / 100,
                    rank: i + 1,
                    source: 'automated_restoration_s15'
                }
            });
        }
        console.log('Spieltag 15 Snapshot erstellt.');

        // 4. Create/Restore S16
        console.log('Schritt 3: Generiere Spieltag 16 Snapshot...');
        const stats16 = await getAggregateStatsUpTo(16);
        
        const oldS16 = await prisma.snapshot.findFirst({ where: { week_id: 'Spieltag 16' } });
        if (oldS16) {
            await prisma.snapshotPlayerValue.deleteMany({ where: { snapshot_id: oldS16.snapshot_id } });
            await prisma.snapshot.delete({ where: { snapshot_id: oldS16.snapshot_id } });
        }

        const snap16 = await prisma.snapshot.create({
            data: { week_id: 'Spieltag 16', timestamp: new Date() }
        });

        for (let i = 0; i < stats16.length; i++) {
            const p = stats16[i];
            const pk1 = Math.round(p.avg_total);
            const pk2 = Math.round(p.avg_9);
            const pk3 = Math.round(p.avg_18);
            const pk4 = Math.round(p.siegequote_pct);
            const pk5 = Math.round(p.avg_high_per_leg * 100);

            const totalPoints = (pk1 * weights.k1) + (pk2 * weights.k2) + (pk3 * weights.k3) + (pk4 * weights.k4) + (pk5 * weights.k5);

            await prisma.snapshotPlayerValue.create({
                data: {
                    snapshot_id: snap16.snapshot_id,
                    player_name: p.player_name,
                    verein: p.verein,
                    gespielte_single_spiele: p.gespielte_single_spiele,
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
                    points_k1: pk1, points_k2: pk2, points_k3: pk3, points_k4: pk4, points_k5: pk5,
                    total_points: Math.round(totalPoints * 100) / 100,
                    rank: i + 1,
                    source: 'automated_fix_s16'
                }
            });
        }
        console.log('Spieltag 16 Snapshot erstellt.');

    } catch (e) {
        console.error('Execution failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

execute();
