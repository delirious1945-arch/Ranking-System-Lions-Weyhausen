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

// Admin-only: Reset a user's password back to the initial password
export async function POST(request: Request) {
    try {
        const { adminName, playerName } = await request.json();

        // Check if requester is admin in DB
        const adminUser = await (prisma as any).userPassword.findUnique({
            where: { player_name: adminName }
        });

        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Nicht autorisiert. Nur Admins können Passwörter zurücksetzen.' }, { status: 403 });
        }

        if (!playerName) {
            return NextResponse.json({ error: 'Spielername erforderlich' }, { status: 400 });
        }

        const hash = await sha256(INITIAL_PASSWORD);

        const existing = await (prisma as any).userPassword.findUnique({
            where: { player_name: playerName }
        });

        if (existing) {
            await (prisma as any).userPassword.update({
                where: { player_name: playerName },
                data: {
                    password_hash: hash,
                    must_change: true
                }
            });
        } else {
            await (prisma as any).userPassword.create({
                data: {
                    player_name: playerName,
                    password_hash: hash,
                    must_change: true
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
