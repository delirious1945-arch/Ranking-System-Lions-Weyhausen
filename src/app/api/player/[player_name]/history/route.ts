import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ player_name: string }> }
) {
    try {
        const p = await params;
        const player_name = decodeURIComponent(p.player_name);

        // Fetch all snapshots for the player
        const history = await prisma.snapshotPlayerValue.findMany({
            where: { player_name },
            include: {
                snapshot: true
            },
            orderBy: {
                snapshot: {
                    timestamp: 'asc'
                }
            }
        });

        if (history.length === 0) {
            return NextResponse.json({ error: "Player not found" }, { status: 404 });
        }

        // Calculate Deltas (compared to previous snapshot)
        const historyWithDeltas = history.map((curr, idx) => {
            if (idx === 0) return { ...curr, deltas: null };

            const prev = history[idx - 1];
            return {
                ...curr,
                deltas: {
                    total_points: curr.total_points - prev.total_points,
                    avg_total: parseFloat((curr.avg_total - prev.avg_total).toFixed(2)),
                    avg_high_per_leg: parseFloat((curr.avg_high_per_leg - prev.avg_high_per_leg).toFixed(2)),
                    rank: prev.rank - curr.rank // Positive delta means rank improved (smaller number)
                }
            };
        });

        return NextResponse.json({
            player_name,
            history: historyWithDeltas
        });

    } catch (error) {
        console.error("Error fetching player history:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
