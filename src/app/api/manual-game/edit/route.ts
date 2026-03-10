import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        const numericFields = ['game1_avg', 'game1_avg_9', 'game1_avg_18', 'game2_avg', 'game2_avg_9', 'game2_avg_18', 'cnt_80', 'cnt_100', 'cnt_140', 'cnt_180', 'legs_total'];
        for (const field of numericFields) {
            if (body[field] !== undefined) {
                body[field] = Number(body[field]);
            }
        }

        const date = body.date ? new Date(body.date) : undefined;

        const updatedGame = await (prisma as any).manualGame.update({
            where: { id: Number(body.id) },
            data: {
                begegnung: body.begegnung,
                date: date,
                game1_avg: body.game1_avg,
                game1_avg_9: body.game1_avg_9,
                game1_avg_18: body.game1_avg_18,
                game1_win: body.game1_win === true || body.game1_win === 'true',
                game2_avg: body.game2_avg,
                game2_avg_9: body.game2_avg_9,
                game2_avg_18: body.game2_avg_18,
                game2_win: body.game2_win === true || body.game2_win === 'true',
                cnt_80: body.cnt_80,
                cnt_100: body.cnt_100,
                cnt_140: body.cnt_140,
                cnt_180: body.cnt_180,
                legs_total: body.legs_total,
            }
        });

        return NextResponse.json({ success: true, game: updatedGame });
    } catch (error: any) {
        console.error('Error updating manual game:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
