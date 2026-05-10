import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const INITIAL_PASSWORD = 'Lions2026!';

async function sha256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function GET() {
    try {
        const users = await (prisma as any).userPassword.findMany({
            select: { player_name: true },
            orderBy: { player_name: 'asc' }
        });
        return NextResponse.json(users.map((u: any) => u.player_name));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { adminName, newPlayerName } = await request.json();

        // Check if requester is admin in DB
        const adminUser = await (prisma as any).userPassword.findUnique({
            where: { player_name: adminName }
        });

        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Nicht autorisiert. Nur Admins können Nutzer verwalten.' }, { status: 403 });
        }

        if (!newPlayerName || !newPlayerName.trim()) {
            return NextResponse.json({ error: 'Name erforderlich' }, { status: 400 });
        }

        const name = newPlayerName.trim();

        const existing = await (prisma as any).userPassword.findUnique({
            where: { player_name: name }
        });

        if (existing) {
            return NextResponse.json({ error: 'Nutzer existiert bereits' }, { status: 400 });
        }

        const hash = await sha256(INITIAL_PASSWORD);

        await (prisma as any).userPassword.create({
            data: {
                player_name: name,
                password_hash: hash,
                must_change: true
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
