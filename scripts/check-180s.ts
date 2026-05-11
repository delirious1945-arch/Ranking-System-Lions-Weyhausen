
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const playerName = 'Sebastian Kirste';
  
  const matches = await prisma.matchRecord.findMany({
    where: { playerName: playerName }
  });

  const total180s = matches.reduce((sum, m) => sum + (m.count180 || 0), 0);
  console.log(`Total 180s in MatchRecord for ${playerName}: ${total180s}`);
  
  const manualGames = await prisma.manualGame.findMany({
    where: { player_name: playerName }
  });
  
  const manual180s = manualGames.reduce((sum, g) => sum + (g.cnt_180 || 0), 0);
  console.log(`Total 180s in ManualGame for ${playerName}: ${manual180s}`);

  const snapshots = await prisma.snapshotPlayerValue.findMany({
    where: { player_name: playerName },
    orderBy: { snapshot: { timestamp: 'desc' } },
    take: 1
  });
  
  if (snapshots.length > 0) {
    console.log(`180s in latest Snapshot for ${playerName}: ${snapshots[0].cnt_180}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
