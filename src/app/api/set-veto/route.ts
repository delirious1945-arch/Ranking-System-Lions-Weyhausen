import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { player_name, reason, active, user_id = 1 } = body;

        if (!player_name || typeof active !== "boolean") {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Default to a system user if none provided (for demo purposes)
        const defaultUser = await prisma.user.upsert({
            where: { user_id: 1 },
            update: {},
            create: { user_id: 1, username: 'admin', role: 'admin' }
        });

        // Determine if player exists
        let player = await prisma.player.findUnique({
            where: { player_name }
        });

        if (!player) {
            player = await prisma.player.create({
                data: { player_name, verein: "Unknown" }
            });
        }

        const veto = await prisma.veto.create({
            data: {
                player_name,
                user_id: defaultUser.user_id,
                active,
                reason
            }
        });

        return NextResponse.json({ success: true, veto });

    } catch (error) {
        console.error("Error setting veto:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
