import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const legsData = [
    { name: "Jens Goltermann", spiele_g: 9, spiele_v: 10, legs_g: 35, legs_v: 39 },
    { name: "Michael Gehrt", spiele_g: 3, spiele_v: 14, legs_g: 23, legs_v: 47 },
    { name: "Dirk Ostermann", spiele_g: 13, spiele_v: 15, legs_g: 53, legs_v: 52 },
    { name: "Sebastian Kirste", spiele_g: 27, spiele_v: 5, legs_g: 84, legs_v: 39 },
    { name: "Nicholas Stedman", spiele_g: 14, spiele_v: 13, legs_g: 52, legs_v: 53 },
    { name: "Kevin Emde", spiele_g: 9, spiele_v: 12, legs_g: 40, legs_v: 44 },
    { name: "Timo Feuerhahn", spiele_g: 8, spiele_v: 8, legs_g: 32, legs_v: 33 },
    { name: "Martin Wolnik", spiele_g: 1, spiele_v: 5, legs_g: 4, legs_v: 16 },
    { name: "André Rathje", spiele_g: 5, spiele_v: 11, legs_g: 24, legs_v: 37 },
    { name: "Erik Schremmer", spiele_g: 5, spiele_v: 6, legs_g: 19, legs_v: 25 },
    { name: "Maik Feuerhahn", spiele_g: 6, spiele_v: 4, legs_g: 22, legs_v: 16 },
    { name: "Michael Kranz", spiele_g: 10, spiele_v: 15, legs_g: 43, legs_v: 59 },
    { name: "Jannik Baier", spiele_g: 4, spiele_v: 7, legs_g: 19, legs_v: 24 },
    { name: "Karen Schulz", spiele_g: 3, spiele_v: 11, legs_g: 14, legs_v: 36 },
    { name: "Jochen Michael", spiele_g: 0, spiele_v: 2, legs_g: 1, legs_v: 6 },
    { name: "Uwe Kohnert", spiele_g: 0, spiele_v: 0, legs_g: 0, legs_v: 0 },
    { name: "Malte Wolnik", spiele_g: 0, spiele_v: 6, legs_g: 3, legs_v: 18 },
    { name: "Joachim Koch", spiele_g: 1, spiele_v: 9, legs_g: 13, legs_v: 27 },
    { name: "Karsten Kohnert", spiele_g: 1, spiele_v: 3, legs_g: 4, legs_v: 10 },
  ];

  try {
    const snapshot = await prisma.snapshot.findFirst({
      where: { week_id: "Saison 2025/26 - FINAL" }
    });

    if (!snapshot) {
      return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 });
    }

    const results = [];
    for (const player of legsData) {
      const totalSpiele = player.spiele_g + player.spiele_v;
      const totalLegs = player.legs_g + player.legs_v;

      await prisma.snapshotPlayerValue.update({
        where: {
          snapshot_id_player_name: {
            snapshot_id: snapshot.snapshot_id,
            player_name: player.name
          }
        },
        data: {
          gespielte_single_spiele: totalSpiele,
          gespielte_legs: totalLegs,
          games_played: totalSpiele,
          wins: player.spiele_g,
          siegequote_pct: totalSpiele > 0 ? (player.spiele_g / totalSpiele) * 100 : 0,
        }
      });
      results.push(`${player.name}: ${player.spiele_g}-${player.spiele_v} Spiele, ${player.legs_g}-${player.legs_v} Legs`);
    }

    return NextResponse.json({ message: 'Legs-Update Success', details: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
