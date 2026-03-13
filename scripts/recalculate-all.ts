import { prisma } from '../src/lib/prisma';
import * as scoring from '../src/lib/scoring';
import fs from 'fs';
import path from 'path';

// Manually load .env from root
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
        }
    });
}

async function main() {
    console.log('--- Starte Neuberechnung aller historischen Scores ---');

    // Check if env is loaded
    if (!process.env.DATABASE_URL) {
        console.error('FEHLER: DATABASE_URL nicht gefunden. Hast du die .env Datei im Root-Verzeichnis?');
        process.exit(1);
    }

    // Need to re-init prisma or ensure it's loaded after env?
    // Since src/lib/prisma exports a singleton, if it was already imported, 
    // it might have seen the empty env.

    let config = await prisma.rankingConfig.findUnique({ where: { id: 1 } });
    if (!config) {
        config = {
            weight_k1: 0.20,
            weight_k2: 0.15,
            weight_k3: 0.15,
            weight_k4: 0.25,
            weight_k5: 0.25
        } as any;
    }

    const allValues = await prisma.snapshotPlayerValue.findMany();
    console.log(`${allValues.length} Spieler-Einträge gefunden.`);

    let updatedCount = 0;

    for (const v of allValues) {
        const newK1 = scoring.calculatePointsK1toK3(v.avg_total);
        const newK2 = scoring.calculatePointsK1toK3(v.avg_9);
        const newK3 = scoring.calculatePointsK1toK3(v.avg_18);
        const newK4 = scoring.calculatePointsK4(v.siegequote_pct);
        const newK5 = scoring.calculatePointsK5(v.avg_high_per_leg);

        const weighted_sum =
            (newK1 * config!.weight_k1) +
            (newK2 * config!.weight_k2) +
            (newK3 * config!.weight_k3) +
            (newK4 * config!.weight_k4) +
            (newK5 * config!.weight_k5);

        const newTotal = Math.round(weighted_sum * 5 * 100) / 100;

        if (
            v.points_k1 !== newK1 ||
            v.points_k2 !== newK2 ||
            v.points_k3 !== newK3 ||
            v.points_k4 !== newK4 ||
            v.points_k5 !== newK5 ||
            v.total_points !== newTotal
        ) {
            await prisma.snapshotPlayerValue.update({
                where: { id: v.id },
                data: {
                    points_k1: newK1,
                    points_k2: newK2,
                    points_k3: newK3,
                    points_k4: newK4,
                    points_k5: newK5,
                    total_points: newTotal,
                },
            });
            updatedCount++;
        }
    }

    console.log(`${updatedCount} Einträge wurden punktemäßig aktualisiert.`);

    // Ränge neu berechnen
    const snapshots = await prisma.snapshot.findMany({ select: { snapshot_id: true } });
    console.log(`Berechne Ränge für ${snapshots.length} Snapshots neu...`);

    for (const snap of snapshots) {
        const values = await prisma.snapshotPlayerValue.findMany({
            where: { snapshot_id: snap.snapshot_id },
            orderBy: [
                { total_points: 'desc' },
                { avg_total: 'desc' } // Tie-breaker
            ],
        });

        for (let i = 0; i < values.length; i++) {
            const newRank = i + 1;
            if (values[i].rank !== newRank) {
                await prisma.snapshotPlayerValue.update({
                    where: { id: values[i].id },
                    data: { rank: newRank }
                });
            }
        }
    }

    console.log('--- Neuberechnung abgeschlossen ---');
}

main()
    .catch((e) => {
        console.error('Unbehandelter Fehler:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
