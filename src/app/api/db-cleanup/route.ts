import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await (prisma as any).userPassword.updateMany({
            where: { NOT: { player_name: 'Sebastian Kirste' } },
            data: { role: 'viewer' }
        });
        return NextResponse.json({ success: true, message: "Alle User ausser Sebastian auf 'viewer' gesetzt." });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
