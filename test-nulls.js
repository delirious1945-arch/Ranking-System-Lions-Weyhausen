const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        console.log("Checking for broken manualGames...");
        const mgs = await prisma.manualGame.findMany();
        let total180 = 0;
        for (const mg of mgs) {
            total180 += mg.cnt_180 || 0;
        }
        console.log("Total 180s in manualGame:", total180);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
