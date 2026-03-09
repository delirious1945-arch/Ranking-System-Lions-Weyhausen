export function validateValue(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function calculatePointsK1toK3(avg: number): number {
  if (avg < 0 || avg > 200) throw new Error("Invalid average value");
  
  if (avg < 30.0) return 0;
  if (avg <= 39.99) return 1; // 30.00 to 39.99 (since 39.90 is upper bound in prompt, use 39.99 for gapless)
  if (avg <= 44.99) return 2; // 40.00 to 44.99
  if (avg <= 49.99) return 3; // 45.00 to 49.99
  if (avg <= 54.99) return 4; // 50.00 to 54.99
  if (avg <= 59.99) return 5; // 55.00 to 59.99
  return 5; // >= 60.00 Cap
}

export function calculatePointsK4(winRatePct: number): number {
  if (winRatePct < 0 || winRatePct > 100) throw new Error("Invalid win rate percentage");

  if (winRatePct < 10.0) return 0;
  if (winRatePct <= 19.99) return 1;
  if (winRatePct <= 44.99) return 2;
  if (winRatePct <= 49.99) return 2; // Prompt explicitly assigns 2 points here as well.
  if (winRatePct <= 79.99) return 3;
  if (winRatePct <= 89.99) return 4;
  return 5; // >= 90.00
}

export function calculatePointsK5(avgHighPerLeg: number): number {
  if (avgHighPerLeg < 0) throw new Error("Invalid avg high per leg");

  if (avgHighPerLeg <= 0.40) return 1;
  if (avgHighPerLeg <= 0.80) return 2;
  if (avgHighPerLeg <= 1.20) return 3;
  if (avgHighPerLeg <= 1.60) return 4;
  if (avgHighPerLeg <= 2.00) return 5;
  return 5; // > 2.00 Cap
}

export interface PlayerRawData {
  source_id?: string;
  source: string;
  team: string; // Verein
  timestamp_source?: Date;
  gespielte_single_spiele: number;
  gespielte_legs: number;
  avg_total: number;
  avg_9: number;
  avg_18: number;
  wins: number;
  games_played: number;
  cnt_80: number;
  cnt_100: number;
  cnt_140: number;
  cnt_180: number;
}

export interface PlayerComputedData extends PlayerRawData {
  siegequote_pct: number;
  sum_high_scores: number;
  avg_high_per_leg: number;
  points_k1: number;
  points_k2: number;
  points_k3: number;
  points_k4: number;
  points_k5: number;
  total_points: number;
  aggregations_meta: any[];
}

export function aggregatePlayerData(records: PlayerRawData[]): PlayerComputedData {
  if (records.length === 0) throw new Error("No data to aggregate");

  const meta = records.map(r => ({
    source: r.source,
    source_id: r.source_id,
    team: r.team,
    timestamp: r.timestamp_source,
    gespielte_single_spiele: r.gespielte_single_spiele
  }));

  // Ensure all records have valid 'gespielte_single_spiele' for weighting
  const invalidWeight = records.some(r => r.gespielte_single_spiele === undefined || r.gespielte_single_spiele < 0);
  if (invalidWeight) {
    throw new Error("Missing or invalid 'gespielte_single_spiele' for weighting");
  }

  const totalSingleSpiele = records.reduce((sum, r) => sum + r.gespielte_single_spiele, 0);
  const totalLegs = records.reduce((sum, r) => sum + r.gespielte_legs, 0);
  const totalWins = records.reduce((sum, r) => sum + r.wins, 0);
  const totalGamesPlayed = records.reduce((sum, r) => sum + r.games_played, 0);

  const cnt_80 = records.reduce((sum, r) => sum + r.cnt_80, 0);
  const cnt_100 = records.reduce((sum, r) => sum + r.cnt_100, 0);
  const cnt_140 = records.reduce((sum, r) => sum + r.cnt_140, 0);
  const cnt_180 = records.reduce((sum, r) => sum + r.cnt_180, 0);
  
  const sum_high_scores = cnt_80 + cnt_100 + cnt_140 + cnt_180;

  let avg_high_per_leg = 0;
  if (totalLegs === 0) {
    if (sum_high_scores > 0) {
      throw new Error("0 legs played but high scores exist");
    }
  } else {
    avg_high_per_leg = sum_high_scores / totalLegs;
    // Round to 2 decimal places as per requirement
    avg_high_per_leg = Math.round(avg_high_per_leg * 100) / 100;
  }

  let avg_total = 0;
  let avg_9 = 0;
  let avg_18 = 0;

  if (totalSingleSpiele > 0) {
    avg_total = records.reduce((sum, r) => sum + (r.avg_total * r.gespielte_single_spiele), 0) / totalSingleSpiele;
    avg_9 = records.reduce((sum, r) => sum + (r.avg_9 * r.gespielte_single_spiele), 0) / totalSingleSpiele;
    avg_18 = records.reduce((sum, r) => sum + (r.avg_18 * r.gespielte_single_spiele), 0) / totalSingleSpiele;
    
    avg_total = Math.round(avg_total * 100) / 100;
    avg_9 = Math.round(avg_9 * 100) / 100;
    avg_18 = Math.round(avg_18 * 100) / 100;
  }

  let siegequote_pct = 0;
  if (totalGamesPlayed > 0) {
    siegequote_pct = (totalWins / totalGamesPlayed) * 100;
    siegequote_pct = Math.round(siegequote_pct * 100) / 100;
  }

  // Calculate Points
  const points_k1 = calculatePointsK1toK3(avg_total);
  const points_k2 = calculatePointsK1toK3(avg_9);
  const points_k3 = calculatePointsK1toK3(avg_18);
  const points_k4 = calculatePointsK4(siegequote_pct);
  const points_k5 = calculatePointsK5(avg_high_per_leg);

  const total_points = points_k1 + points_k2 + points_k3 + points_k4 + points_k5;

  return {
    source: "aggregated",
    team: records[0].team, // Assume user stays in same verein
    gespielte_single_spiele: totalSingleSpiele,
    gespielte_legs: totalLegs,
    avg_total,
    avg_9,
    avg_18,
    wins: totalWins,
    games_played: totalGamesPlayed,
    cnt_80,
    cnt_100,
    cnt_140,
    cnt_180,
    siegequote_pct,
    sum_high_scores,
    avg_high_per_leg,
    points_k1,
    points_k2,
    points_k3,
    points_k4,
    points_k5,
    total_points,
    aggregations_meta: meta
  };
}
