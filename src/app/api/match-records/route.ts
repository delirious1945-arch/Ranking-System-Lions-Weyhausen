import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            playerName,
            spieltag,
            isDouble,
            won,
            count180,
            checkoutMax,
            avgTotal,
            opponentName,
            date,
            gameId
        } = body;

        // Basic validation
        if (!playerName) {
            return NextResponse.json({ error: "Player name is required" }, { status: 400 });
        }

        // Create the match record
        const record = await prisma.matchRecord.create({
            data: {
                gameId,
                playerName,
                spieltag,
                isDouble: !!isDouble,
                won: !!won,
                count180: parseInt(count180) || 0,
                checkoutMax: parseInt(checkoutMax) || 0,
                avgTotal: parseFloat(avgTotal) || 0,
                opponentName: opponentName || "Admin Korrektur",
                date: new Date(date),
                // Default values for required fields in schema
                encounterId: 0,
                eventId: 0,
                legsWon: won ? 3 : 0, // Mocked
                legsLost: won ? 0 : 3, // Mocked
                dartsTotal: 0,
                scoreTotal: 0,
                avg9: 0,
                darts9: 0,
                score9: 0,
                avg18: 0,
                darts18: 0,
                score18: 0,
                count80: 0,
                count100: 0,
                count140: 0
            }
        });

        return NextResponse.json(record);
    } catch (error: any) {
        console.error("Error creating match record:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
