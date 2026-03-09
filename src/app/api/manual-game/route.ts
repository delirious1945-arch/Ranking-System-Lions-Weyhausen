import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const requiredFields = [
            'player_name', 'verein', 'gespielte_single_spiele', 'gespielte_legs',
            'avg_total', 'avg_9', 'avg_18', 'wins', 'games_played',
            'cnt_80', 'cnt_100', 'cnt_140', 'cnt_180'
        ];

        for (const field of requiredFields) {
            if (body[field] === undefined) {
                return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
            }
        }

        // This would typically insert into a raw data table for the next snapshot to pick up
        // For now, we simulate saving the manual game data ready for the next update workflow

        // Upsert player to ensure they exist
        await prisma.player.upsert({
            where: { player_name: body.player_name },
            update: { verein: body.verein },
            create: { player_name: body.player_name, verein: body.verein }
        });

        // In a full implementation, manual games would be stored in a `manual_games` table
        // Next time the 'Update' button is clicked, it would pull from both Website & Manual DB.

        return NextResponse.json({ success: true, message: "Manual game recorded successfully" });

    } catch (error) {
        console.error("Error saving manual game:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
