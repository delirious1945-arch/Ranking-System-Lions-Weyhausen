import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculatePointsK1toK3, calculatePointsK4, calculatePointsK5, calculateWeightedTotal } from '@/lib/scoring';

export async function GET() {
  try {
    const snapshot = await prisma.snapshot.findFirst({
      where: { week_id: "Saison 2025/26 - FINAL" }
    });

    if (!snapshot) {
      return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 });
    }

    // Load config weights
    const config = await prisma.rankingConfig.findFirst();
    const weights = config ? {
      weight_k1: config.weight_k1,
      weight_k2: config.weight_k2,
      weight_k3: config.weight_k3,
      weight_k4: config.weight_k4,
      weight_k5: config.weight_k5,
    } : {
      weight_k1: 0.20,
      weight_k2: 0.15,
      weight_k3: 0.15,
      weight_k4: 0.35,
      weight_k5: 0.15,
    };

    const players = await prisma.snapshotPlayerValue.findMany({
      where: { snapshot_id: snapshot.snapshot_id }
    });

    const results = [];

    for (const p of players) {
      const k1 = calculatePointsK1toK3(p.avg_total);
      const k2 = calculatePointsK1toK3(p.avg_9);
      const k3 = calculatePointsK1toK3(p.avg_18);
      const k4 = calculatePointsK4(p.siegequote_pct);

      const sumHS = p.cnt_80 + p.cnt_100 + p.cnt_140 + p.cnt_180;
      const avgHighPerLeg = p.gespielte_legs > 0 ? sumHS / p.gespielte_legs : 0;
      const k5 = calculatePointsK5(avgHighPerLeg);

      const total = calculateWeightedTotal(
        { p1: k1, p2: k2, p3: k3, p4: k4, p5: k5 },
        weights
      );

      await prisma.snapshotPlayerValue.update({
        where: { id: p.id },
        data: {
          points_k1: k1,
          points_k2: k2,
          points_k3: k3,
          points_k4: k4,
          points_k5: k5,
          sum_high_scores: sumHS,
          avg_high_per_leg: Math.round(avgHighPerLeg * 100) / 100,
          total_points: total
        }
      });

      results.push({
        name: p.player_name,
        k1, k2, k3, k4, k5,
        total,
        avg: p.avg_total,
        avg9: p.avg_9,
        avg18: p.avg_18,
        sieg: p.siegequote_pct.toFixed(1) + '%',
        hsPerLeg: avgHighPerLeg.toFixed(2)
      });
    }

    // Sort by total_points descending and assign ranks
    results.sort((a, b) => b.total - a.total);

    for (let i = 0; i < results.length; i++) {
      await prisma.snapshotPlayerValue.updateMany({
        where: {
          snapshot_id: snapshot.snapshot_id,
          player_name: results[i].name
        },
        data: { rank: i + 1 }
      });
      (results[i] as any).rank = i + 1;
    }

    return NextResponse.json({
      message: 'Scoring + Ranking Complete',
      weights,
      ranking: results
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
