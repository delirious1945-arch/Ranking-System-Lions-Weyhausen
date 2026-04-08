import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const users = await (prisma as any).userPassword.findMany();
        return NextResponse.json(users);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
