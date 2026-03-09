import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ week_id: string }> }
) {
    try {
        const p = await params;
        const week_id = p.week_id;

        // Get the snapshot
        const snapshot = await prisma.snapshot.findFirst({
            where: { week_id },
            include: {
                values: {
                    orderBy: {
                        rank: 'asc'
                    }
                }
            },
            orderBy: {
                timestamp: 'desc'
            }
        });

        if (!snapshot) {
            return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
        }

        // Get vetos to attach to response
        const activeVetos = await prisma.veto.findMany({
            where: { active: true }
        });

        const vetoPlayerNames = new Set(activeVetos.map(v => v.player_name));

        const enrichedValues = snapshot.values.map(val => ({
            ...val,
            veto_flag: vetoPlayerNames.has(val.player_name) || val.veto_flag
        }));

        return NextResponse.json({
            snapshot: { ...snapshot, values: undefined },
            leaderboard: enrichedValues
        });

    } catch (error) {
        console.error("Error fetching snapshot:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
