
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const playerName = 'Sebastian Kirste';
  
  const singles = await prisma.matchRecord.findMany({
    where: { playerName: playerName, isDouble: false }
  });
  const doubles = await prisma.matchRecord.findMany({
    where: { playerName: playerName, isDouble: true }
  });

  const single180s = singles.reduce((sum, m) => sum + (m.count180 || 0), 0);
  const double180s = doubles.reduce((sum, m) => sum + (m.count180 || 0), 0);
  
  console.log(`Sebastian Kirste 180s:`);
  console.log(`- Singles: ${single180s}`);
  console.log(`- Doubles: ${double180s}`);
  console.log(`- Total MatchRecord: ${single180s + double180s}`);
  
  const manualGames = await prisma.manualGame.findMany({
    where: { player_name: playerName }
  });
  const manual180s = manualGames.reduce((sum, g) => sum + (g.cnt_180 || 0), 0);
  console.log(`- Manual: ${manual180s}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
