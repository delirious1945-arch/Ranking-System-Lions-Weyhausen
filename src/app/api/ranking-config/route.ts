import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        let config = await prisma.rankingConfig.findUnique({
            where: { id: 1 }
        });

        if (!config) {
            config = await prisma.rankingConfig.create({
                data: {
                    id: 1,
                    weight_k1: 0.20,
                    weight_k2: 0.15,
                    weight_k3: 0.15,
                    weight_k4: 0.25,
                    weight_k5: 0.25,
                }
            });
        }

        return NextResponse.json(config);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const config = await prisma.rankingConfig.upsert({
            where: { id: 1 },
            update: {
                weight_k1: parseFloat(data.weight_k1),
                weight_k2: parseFloat(data.weight_k2),
                weight_k3: parseFloat(data.weight_k3),
                weight_k4: parseFloat(data.weight_k4),
                weight_k5: parseFloat(data.weight_k5),
            },
            create: {
                id: 1,
                weight_k1: parseFloat(data.weight_k1),
                weight_k2: parseFloat(data.weight_k2),
                weight_k3: parseFloat(data.weight_k3),
                weight_k4: parseFloat(data.weight_k4),
                weight_k5: parseFloat(data.weight_k5),
            }
        });

        return NextResponse.json({ success: true, config });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
