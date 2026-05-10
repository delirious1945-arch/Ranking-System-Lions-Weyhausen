import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        // Use custom spieltag number if provided, otherwise default to "Spieltag 16" (current target)
        // Ideally this should be dynamic or selected by the user in the form.
        let weekId = "Spieltag 16";
        if (data.spieltag_num) {
            weekId = `Spieltag ${data.spieltag_num}`;
        }

        const game = await prisma.manualGame.create({
            data: {
                player_name: data.player_name,
                begegnung: data.begegnung || '',
                game1_avg: parseFloat(data.game1_avg || 0),
                game1_avg_9: parseFloat(data.game1_avg_9 || data.game1_avg || 0),
                game1_avg_18: parseFloat(data.game1_avg_18 || data.game1_avg || 0),
                game1_win: data.game1_win,
                game2_avg: parseFloat(data.game2_avg || 0),
                game2_avg_9: parseFloat(data.game2_avg_9 || data.game2_avg || 0),
                game2_avg_18: parseFloat(data.game2_avg_18 || data.game2_avg || 0),
                game2_win: data.game2_win,
                cnt_80: parseInt(data.cnt_80 || 0),
                cnt_100: parseInt(data.cnt_100 || 0),
                cnt_140: parseInt(data.cnt_140 || 0),
                cnt_180: parseInt(data.cnt_180 || 0),
                legs_total: parseInt(data.legs_total || 0),
                is_offline: !!data.is_offline,
                legs_won: parseInt(data.legs_won || 0),
                legs_lost: parseInt(data.legs_lost || 0),
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
