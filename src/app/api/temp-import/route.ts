import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const rawData = [
    { name: "Jens Goltermann", avg: 47.1, games: 17, won: 9, hs180: 0, hs140: 4, hs100: 42, hs80: 79, f9: 55.7, f12: 53.9, f15: 53.9, f18: 53.8 },
    { name: "Michael Gehrt", avg: 40.0, games: 13, won: 2, hs180: 0, hs140: 2, hs100: 15, hs80: 40, f9: 47.8, f12: 48.3, f15: 47.5, f18: 46.6 },
    { name: "Dirk Ostermann", avg: 40.9, games: 24, won: 10, hs180: 0, hs140: 0, hs100: 26, hs80: 80, f9: 48.3, f12: 48.2, f15: 48.2, f18: 47.6 },
    { name: "Sebastian Kirste", avg: 51.9, games: 28, won: 23, hs180: 2, hs140: 21, hs100: 88, hs80: 112, f9: 56.8, f12: 59.2, f15: 59.7, f18: 59.1 },
    { name: "Nicholas Stedman", avg: 43.1, games: 23, won: 12, hs180: 0, hs140: 7, hs100: 46, hs80: 73, f9: 48.3, f12: 49.1, f15: 49.5, f18: 49.7 },
    { name: "Kevin Emde", avg: 42.1, games: 21, won: 9, hs180: 1, hs140: 3, hs100: 21, hs80: 90, f9: 51.0, f12: 51.4, f15: 51.2, f18: 50.8 },
    { name: "Timo Feuerhahn", avg: 45.0, games: 16, won: 8, hs180: 2, hs140: 5, hs100: 46, hs80: 64, f9: 55.6, f12: 56.4, f15: 56.5, f18: 55.4 },
    { name: "Martin Wolnik", avg: 35.3, games: 6, won: 1, hs180: 0, hs140: 1, hs100: 4, hs80: 7, f9: 40.0, f12: 38.6, f15: 39.5, f18: 39.4 },
    { name: "Andre Rathje", avg: 35.5, games: 16, won: 5, hs180: 0, hs140: 1, hs100: 13, hs80: 42, f9: 44.5, f12: 44.7, f15: 44.1, f18: 43.7 },
    { name: "Maik Feuerhahn", avg: 37.3, games: 10, won: 6, hs180: 0, hs140: 2, hs100: 13, hs80: 32, f9: 45.9, f12: 46.2, f15: 46.5, f18: 45.6 },
    { name: "Michael Kranz", avg: 40.0, games: 25, won: 10, hs180: 0, hs140: 4, hs100: 28, hs80: 85, f9: 46.7, f12: 46.5, f15: 47.9, f18: 47.3 },
    { name: "Jannik Baier", avg: 40.5, games: 11, won: 4, hs180: 0, hs140: 2, hs100: 16, hs80: 38, f9: 49.8, f12: 48.9, f15: 48.8, f18: 48.4 },
    { name: "Karen Schulz", avg: 34.7, games: 14, won: 3, hs180: 0, hs140: 0, hs100: 8, hs80: 27, f9: 38.8, f12: 40.5, f15: 40.6, f18: 40.5 },
    { name: "Jochen Michael", avg: 39.5, games: 2, won: 0, hs180: 0, hs140: 0, hs100: 2, hs80: 5, f9: 38.5, f12: 44.6, f15: 43.1, f18: 45.6 },
    { name: "Malte Wolnik", avg: 35.1, games: 6, won: 0, hs180: 0, hs140: 0, hs100: 4, hs80: 16, f9: 39.5, f12: 39.7, f15: 41.3, f18: 41.9 },
    { name: "Joachim Koch", avg: 34.7, games: 10, won: 1, hs180: 0, hs140: 0, hs100: 8, hs80: 26, f9: 39.0, f12: 39.9, f15: 40.7, f18: 40.7 },
    { name: "Karsten Kohnert", avg: 31.9, games: 4, won: 1, hs180: 0, hs140: 0, hs100: 1, hs80: 7, f9: 33.4, f12: 35.9, f15: 38.2, f18: 38.5 },
    { name: "Uwe Kohnert", avg: 0, games: 0, won: 0, hs180: 0, hs140: 0, hs100: 0, hs80: 0, f9: 0, f12: 0, f15: 0, f18: 0 },
  ];

  const erikA = { avg: 43.9, games: 3, won: 1, hs180: 0, hs140: 0, hs100: 4, hs80: 18, f9: 46.5, f12: 46.7, f15: 46.4, f18: 49.5 };
  const erikB = { avg: 45.7, games: 8, won: 4, hs180: 0, hs140: 3, hs100: 6, hs80: 43, f9: 55.5, f12: 53.7, f15: 53.1, f18: 52.0 };

  const erikCombined = {
    name: "Erik Schremmer",
    games: erikA.games + erikB.games,
    won: erikA.won + erikB.won,
    hs180: erikA.hs180 + erikB.hs180,
    hs140: erikA.hs140 + erikB.hs140,
    hs100: erikA.hs100 + erikB.hs100,
    hs80: erikA.hs80 + erikB.hs80,
    avg: Number(((erikA.avg * erikA.games + erikB.avg * erikB.games) / (erikA.games + erikB.games)).toFixed(2)),
    f9: Number(((erikA.f9 * erikA.games + erikB.f9 * erikB.games) / (erikA.games + erikB.games)).toFixed(2)),
    f12: Number(((erikA.f12 * erikA.games + erikB.f12 * erikB.games) / (erikA.games + erikB.games)).toFixed(2)),
    f15: Number(((erikA.f15 * erikA.games + erikB.f15 * erikB.games) / (erikA.games + erikB.games)).toFixed(2)),
    f18: Number(((erikA.f18 * erikA.games + erikB.f18 * erikB.games) / (erikA.games + erikB.games)).toFixed(2))
  };

  rawData.push(erikCombined);

  try {
    const snapshot = await prisma.snapshot.findFirst({
      where: { week_id: "Saison 2025/26 - FINAL" }
    });

    if (!snapshot) {
      return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 });
    }

    const results = [];
    for (const player of rawData) {
      let dbName = player.name;
      if (dbName === "Andre Rathje") dbName = "André Rathje";

      const sumHS = (player.hs180 || 0) + (player.hs140 || 0) + (player.hs100 || 0) + (player.hs80 || 0);

      const updateData = {
        verein: "Lions Weyhausen",
        avg_total: player.avg || 0,
        avg_9: player.f9 || 0,
        avg_18: player.f18 || 0,
        wins: player.won || 0,
        games_played: player.games || 0,
        siegequote_pct: player.games > 0 ? (player.won / player.games) * 100 : 0,
        cnt_180: player.hs180 || 0,
        cnt_140: player.hs140 || 0,
        cnt_100: player.hs100 || 0,
        cnt_80: player.hs80 || 0,
        sum_high_scores: sumHS,
        gespielte_single_spiele: player.games || 0,
        gespielte_legs: (player.games || 0) * 4,
        avg_high_per_leg: sumHS / ((player.games || 1) * 4),
        total_points: 0,
        rank: 0,
        source: "manual-final",
        points_k1: 0,
        points_k2: 0,
        points_k3: 0,
        points_k4: 0,
        points_k5: 0,
        veto_flag: false
      };

      await prisma.snapshotPlayerValue.upsert({
        where: {
          snapshot_id_player_name: {
            snapshot_id: snapshot.snapshot_id,
            player_name: dbName
          }
        },
        update: updateData,
        create: {
          ...updateData,
          snapshot_id: snapshot.snapshot_id,
          player_name: dbName
        }
      });
      results.push(`Updated ${dbName}`);
    }

    return NextResponse.json({ message: 'Success', details: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
