const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const games = await prisma.manualGame.findMany({ take: 2, orderBy: { date: 'desc' } });
    console.log("GAMES:", games);
  } catch(e) {
    console.error("ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
