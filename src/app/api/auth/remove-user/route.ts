import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { adminName, playerName } = await request.json();

        // Basic admin check
        if (adminName !== 'Sebastian Kirste') {
            return NextResponse.json({ error: 'Nur der Admin kann Nutzer entfernen' }, { status: 403 });
        }

        if (playerName === 'Sebastian Kirste') {
            return NextResponse.json({ error: 'Der Haupt-Admin kann nicht entfernt werden' }, { status: 400 });
        }

        await (prisma as any).userPassword.delete({
            where: { player_name: playerName }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
