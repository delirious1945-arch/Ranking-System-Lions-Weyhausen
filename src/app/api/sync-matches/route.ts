import { NextResponse } from 'next/server';
import { updateMatchCache } from '@/lib/match-service';

export const maxDuration = 60; // Increase timeout for Vercel Pro if needed, or just handle it

export async function POST(req: Request) {
    try {
        console.log("[sync-matches] Starting manual sync...");
        const start = Date.now();
        await updateMatchCache();
        const duration = (Date.now() - start) / 1000;
        
        console.log(`[sync-matches] Sync complete in ${duration}s`);
        
        return NextResponse.json({ 
            success: true, 
            message: "Match-Daten erfolgreich synchronisiert",
            duration_s: duration
        });
    } catch (error) {
        console.error('[sync-matches] Error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

export async function GET() {
    return POST(new Request("http://localhost"));
}
