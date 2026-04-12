import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const matchRecordsCount = await prisma.matchRecord.count();
        const manualGamesCount = await prisma.manualGame.count();
        const playersCount = await prisma.player.count();
        
        const sampleMatches = await prisma.matchRecord.findMany({
            take: 5,
            select: { playerName: true, opponentName: true, spieltag: true, gameId: true }
        });

        const sampleManual = await prisma.manualGame.findMany({
            take: 5,
            select: { player_name: true, begegnung: true, week_id: true }
        });

        const distinctMatchPlayers = await prisma.matchRecord.findMany({
            distinct: ['playerName'],
            select: { playerName: true }
        });

        return NextResponse.json({ 
            counts: {
                matchRecords: matchRecordsCount,
                manualGames: manualGamesCount,
                players: playersCount
            },
            distinctMatchPlayers: distinctMatchPlayers.map(p => p.playerName),
            sampleMatches,
            sampleManual
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
