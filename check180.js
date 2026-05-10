const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const auto = await prisma.matchRecord.aggregate({ _sum: { count180: true }, where: { playerName: { contains: 'Sebastian Kirste' } }});
    const manual = await prisma.manualGame.aggregate({ _sum: { cnt_180: true }, where: { player_name: { contains: 'Sebastian Kirste' } }});
    console.log('Automated 180s:', auto._sum.count180);
    console.log('Manual 180s:', manual._sum.cnt_180);
}
main().finally(() => prisma.$disconnect());
