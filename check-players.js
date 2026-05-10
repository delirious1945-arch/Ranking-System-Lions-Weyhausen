const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const count = await prisma.matchRecord.count();
        console.log('MatchRecords count:', count);
        const mgs = await prisma.manualGame.findMany({select: {player_name: true}});
        const mrs = await prisma.matchRecord.findMany({select: {playerName: true}});
        console.log('Manual Players:', [...new Set(mgs.map(m=>m.player_name))]);
        console.log('Auto Players:', [...new Set(mrs.map(m=>m.playerName))]);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
