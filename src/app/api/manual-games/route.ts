import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const games = await prisma.manualGame.findMany({
            orderBy: { date: 'desc' },
            take: 20,
        });

        return NextResponse.json(games);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
