import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Snapshots for Erik Schremmer...");
    const snapshots = await prisma.snapshot.findMany({
        orderBy: { timestamp: 'desc' },
        include: {
            values: {
                where: { player_name: 'Erik Schremmer' }
            }
        }
    });

    snapshots.forEach(s => {
        console.log(`Snapshot ID: ${s.snapshot_id} | Week: ${s.week_id} | Timestamp: ${s.timestamp}`);
        if (s.values.length > 0) {
            const v = s.values[0];
            console.log(`  Name: ${v.player_name}`);
            console.log(`  Avg Total: ${v.avg_total}`);
            console.log(`  Avg High/Leg: ${v.avg_high_per_leg}`);
            console.log(`  Total Points: ${v.total_points}`);
        } else {
            console.log("  No value found for Erik Schremmer in this snapshot.");
        }
        console.log("---");
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
