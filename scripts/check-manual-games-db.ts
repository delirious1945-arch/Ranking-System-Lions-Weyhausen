import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- Manual Games ---");
    const games = await prisma.manualGame.findMany({
        orderBy: { date: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(games, null, 2));
}

main().catch(console.error);
