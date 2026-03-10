import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_ALLOWED_NAMES = [
    'Sebastian Kirste', 'Jens Goltermann', 'Erik Schremmer', 'Timo Feuerhahn',
    'Dirk Ostermann', 'Nicholas Stedman', 'Kevin Emde', 'Maik Feuerhahn',
    'Jannik Baier', 'Michael Kranz', 'Michael Gehrt', 'André Rathje',
    'Malte Wolnik', 'Karen Schulz', 'Joachim Koch', 'Martin Wolnik',
    'Karsten Kohnert', 'Uwe Kohnert',
];

const INITIAL_PASSWORD = 'Lions2026!';

async function sha256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST() {
    try {
        const hash = await sha256(INITIAL_PASSWORD);
        let created = 0;
        let skipped = 0;

        for (const name of DEFAULT_ALLOWED_NAMES) {
            const existing = await (prisma as any).userPassword.findUnique({
                where: { player_name: name }
            });
            if (existing) {
                skipped++;
                continue;
            }
            await (prisma as any).userPassword.create({
                data: {
                    player_name: name,
                    password_hash: hash,
                    must_change: true
                }
            });
            created++;
        }

        return NextResponse.json({
            success: true,
            created,
            skipped,
            total: DEFAULT_ALLOWED_NAMES.length
        });
    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
