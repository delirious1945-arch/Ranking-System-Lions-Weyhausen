import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { adminName, playerName } = await request.json();

        // Check if requester is admin in DB
        const adminUser = await (prisma as any).userPassword.findUnique({
            where: { player_name: adminName }
        });

        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Nicht autorisiert. Nur Admins können Nutzer entfernen.' }, { status: 403 });
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
