import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function sha256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
    try {
        const { name, password } = await request.json();

        if (!name || !password) {
            return NextResponse.json({ error: 'Name und Passwort erforderlich' }, { status: 400 });
        }

        const userPw = await (prisma as any).userPassword.findUnique({
            where: { player_name: name }
        });

        if (!userPw) {
            return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
        }

        const hash = await sha256(password);
        if (hash !== userPw.password_hash) {
            return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            mustChange: userPw.must_change
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
