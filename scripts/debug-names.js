const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- Manual Games Names Check ---");
    const games = await prisma.manualGame.findMany({
        orderBy: { id: 'desc' },
        take: 10
    });
    
    games.forEach(g => {
        console.log(`ID: ${g.id} | Name: "${g.player_name}" | Date: ${g.date} | Offline: ${g.is_offline}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
