
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const playerName = 'Sebastian Kirste';
  
  const matches = await prisma.matchRecord.findMany({
    where: { playerName: playerName },
    orderBy: { date: 'asc' }
  });

  console.log(`Total matches for ${playerName}: ${matches.length}`);
  
  if (matches.length > 0) {
    const spieltage = [...new Set(matches.map(m => m.spieltag))].sort((a, b) => a - b);
    console.log('Spieltage found:', spieltage);
    
    const firstHalf = matches.filter(m => m.spieltag <= 9);
    const secondHalf = matches.filter(m => m.spieltag > 9);
    
    console.log('--- Hinrunde (1-9) ---');
    console.log('Singles Won:', firstHalf.filter(m => !m.isDouble && m.won).length);
    console.log('Doubles Won:', firstHalf.filter(m => m.isDouble && m.won).length);
    
    console.log('--- Rückrunde (10+) ---');
    console.log('Singles Won:', secondHalf.filter(m => !m.isDouble && m.won).length);
    console.log('Doubles Won:', secondHalf.filter(m => m.isDouble && m.won).length);
    
    console.log('--- Trend (Last 8) ---');
    const last8 = matches.slice(-8);
    console.log(last8.map(m => m.won ? 'W' : 'L').join(' '));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
