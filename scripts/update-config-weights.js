const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        console.log("Updating RankingConfig to new weights (20/15/15/35/15)...");
        const updated = await prisma.rankingConfig.upsert({
            where: { id: 1 },
            update: {
                weight_k1: 0.20, // K1 Konstanz / Gesamtaverage
                weight_k2: 0.15, // K2 First-9-Dart-Average
                weight_k3: 0.15, // K3 First-18-Dart-Average
                weight_k4: 0.35, // K4 Siegquote
                weight_k5: 0.15, // K5 Bestleistungen & High Scores
                updated_at: new Date()
            },
            create: {
                id: 1,
                weight_k1: 0.20,
                weight_k2: 0.15,
                weight_k3: 0.15,
                weight_k4: 0.35,
                weight_k5: 0.15
            }
        });
        console.log("DB Updated Successfully:", updated);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
