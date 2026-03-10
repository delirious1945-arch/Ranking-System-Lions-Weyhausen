import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function sha256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function validatePassword(pw: string): string | null {
    if (pw.length < 10) return 'Mindestens 10 Zeichen';
    if (!/[A-Z]/.test(pw)) return 'Mindestens ein Großbuchstabe';
    if (!/[0-9]/.test(pw)) return 'Mindestens eine Zahl';
    if (!/[^A-Za-z0-9]/.test(pw)) return 'Mindestens ein Sonderzeichen';
    return null;
}

export async function POST(request: Request) {
    try {
        const { name, oldPassword, newPassword } = await request.json();

        if (!name || !oldPassword || !newPassword) {
            return NextResponse.json({ error: 'Alle Felder erforderlich' }, { status: 400 });
        }

        const validationError = validatePassword(newPassword);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const userPw = await (prisma as any).userPassword.findUnique({
            where: { player_name: name }
        });

        if (!userPw) {
            return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
        }

        const oldHash = await sha256(oldPassword);
        if (oldHash !== userPw.password_hash) {
            return NextResponse.json({ error: 'Altes Passwort ist falsch' }, { status: 401 });
        }

        if (oldPassword === newPassword) {
            return NextResponse.json({ error: 'Neues Passwort muss sich vom alten unterscheiden' }, { status: 400 });
        }

        const newHash = await sha256(newPassword);
        await (prisma as any).userPassword.update({
            where: { player_name: name },
            data: {
                password_hash: newHash,
                must_change: false
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
