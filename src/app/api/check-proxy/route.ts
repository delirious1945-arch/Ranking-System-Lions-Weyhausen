import { NextResponse } from "next/server";

export async function GET() {
    const testUrl = "https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/247/phase/231/round/0";
    try {
        const start = Date.now();
        const res = await fetch(testUrl, { signal: AbortSignal.timeout(5000) });
        const duration = Date.now() - start;
        
        if (res.ok) {
            const data = await res.json();
            return NextResponse.json({ 
                success: true, 
                status: res.status, 
                duration,
                matchCount: data.matches?.length || 0 
            });
        } else {
            return NextResponse.json({ 
                success: false, 
                status: res.status, 
                statusText: res.statusText,
                duration
            });
        }
    } catch (e: any) {
        return NextResponse.json({ 
            success: false, 
            error: e.message,
            cause: e.cause?.message || "Unknown cause"
        }, { status: 500 });
    }
}
