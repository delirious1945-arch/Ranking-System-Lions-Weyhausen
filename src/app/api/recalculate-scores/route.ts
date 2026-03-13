import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { calculatePointsK1toK3, calculatePointsK4, calculatePointsK5 } from "@/lib/scoring";

export async function POST(request: Request) {
    // Simple auth check
    const { secret } = await request.json().catch(() => ({ secret: "" }));
    if (secret !== process.env.ADMIN_SECRET && secret !== "dev-lions-2026") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
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

        const allValues = await prisma.snapshotPlayerValue.findMany();

        let updated = 0;

        for (const v of allValues) {
            const newK1 = calculatePointsK1toK3(v.avg_total);
            const newK2 = calculatePointsK1toK3(v.avg_9);
            const newK3 = calculatePointsK1toK3(v.avg_18);
            const newK4 = calculatePointsK4(v.siegequote_pct);
            const newK5 = calculatePointsK5(v.avg_high_per_leg);

            const weighted_sum =
                (newK1 * config!.weight_k1) +
                (newK2 * config!.weight_k2) +
                (newK3 * config!.weight_k3) +
                (newK4 * config!.weight_k4) +
                (newK5 * config!.weight_k5);

            const newTotal = Math.round(weighted_sum * 5 * 100) / 100;

            // Only update if something changed
            if (
                v.points_k1 !== newK1 ||
                v.points_k2 !== newK2 ||
                v.points_k3 !== newK3 ||
                v.points_k4 !== newK4 ||
                v.points_k5 !== newK5 ||
                v.total_points !== newTotal
            ) {
                await prisma.snapshotPlayerValue.update({
                    where: { id: v.id },
                    data: {
                        points_k1: newK1,
                        points_k2: newK2,
                        points_k3: newK3,
                        points_k4: newK4,
                        points_k5: newK5,
                        total_points: newTotal,
                    },
                });
                updated++;
            }
        }

        // Also re-rank within each snapshot
        const snapshots = await prisma.snapshot.findMany({ select: { snapshot_id: true } });

        for (const snap of snapshots) {
            const values = await prisma.snapshotPlayerValue.findMany({
                where: { snapshot_id: snap.snapshot_id },
                orderBy: { total_points: "desc" },
            });

            for (let i = 0; i < values.length; i++) {
                if (values[i].rank !== i + 1) {
                    await prisma.snapshotPlayerValue.update({
                        where: { id: values[i].id },
                        data: { rank: i + 1 },
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `${updated} von ${allValues.length} Spieler-Datensätzen aktualisiert. ${snapshots.length} Snapshots neu gerankt.`,
        });
    } catch (error: any) {
        console.error("[recalculate-scores] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
