import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        await prisma.manualGame.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[manual-game] Delete Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
