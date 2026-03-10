import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Simply take current week for now, or could be specified
        const now = new Date();
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        const weekId = `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;

        const game = await prisma.manualGame.create({
            data: {
                player_name: data.player_name,
                begegnung: data.begegnung || '',
                game1_avg: parseFloat(data.game1_avg),
                game1_avg_9: parseFloat(data.game1_avg_9 || data.game1_avg),
                game1_avg_18: parseFloat(data.game1_avg_18 || data.game1_avg),
                game1_win: data.game1_win,
                game2_avg: parseFloat(data.game2_avg),
                game2_avg_9: parseFloat(data.game2_avg_9 || data.game2_avg),
                game2_avg_18: parseFloat(data.game2_avg_18 || data.game2_avg),
                game2_win: data.game2_win,
                cnt_80: parseInt(data.cnt_80),
                cnt_100: parseInt(data.cnt_100),
                cnt_140: parseInt(data.cnt_140),
                cnt_180: parseInt(data.cnt_180),
                legs_total: parseInt(data.legs_total),
                week_id: weekId,
                date: data.date ? new Date(data.date) : new Date()
            }
        });

        return NextResponse.json({ success: true, game });
    } catch (error: any) {
        console.error("[manual-game] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
