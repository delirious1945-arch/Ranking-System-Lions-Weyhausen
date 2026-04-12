import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const games = await prisma.manualGame.findMany({
            orderBy: { date: 'desc' },
            take: 200,
        });

        // Ensure we return an empty array instead of null
        return NextResponse.json(games || []);
    } catch (error: any) {
        console.error('API Error /api/manual-games:', error);
        // Fallback: return empty list so UI doesn't crash, but keep status 200
        return NextResponse.json([], { status: 200 });
    }
}
