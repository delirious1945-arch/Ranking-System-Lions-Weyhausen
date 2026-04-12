import { DEFAULT_WEIGHTS } from "./lions-config";

export function validateValue(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function calculatePointsK1toK3(avg: number): number {
  if (avg < 0 || avg > 200) throw new Error("Invalid average value");

  if (avg < 25.0) return 0;
  if (avg < 30.0) return 1;  // 25.00–29.99
  if (avg < 35.0) return 2;  // 30.00–34.99
  if (avg < 40.0) return 3;  // 35.00–39.99
  if (avg < 42.5) return 4;  // 40.00–42.49
  if (avg < 45.0) return 5;  // 42.50–44.99
  if (avg < 47.5) return 6;  // 45.00–47.49
  if (avg < 50.0) return 7;  // 47.50–49.99
  if (avg < 55.0) return 8;  // 50.00–54.99
  if (avg < 60.0) return 9;  // 55.00–59.99
  return 10; // >= 60.00
}

export function calculatePointsK4(winRatePct: number): number {
  if (winRatePct < 0 || winRatePct > 100) throw new Error("Invalid win rate percentage");

  if (winRatePct < 10.0) return 0;
  if (winRatePct < 20.0) return 1;  // 10–19%
  if (winRatePct < 30.0) return 2;  // 20–29%
  if (winRatePct < 40.0) return 3;  // 30–39%
  if (winRatePct < 50.0) return 4;  // 40–49%
  if (winRatePct < 60.0) return 5;  // 50–59%
  if (winRatePct < 70.0) return 6;  // 60–69%
  if (winRatePct < 80.0) return 7;  // 70–79%
  if (winRatePct < 85.0) return 8;  // 80–84%
  if (winRatePct < 90.0) return 9;  // 85–89%
  return 10; // >= 90%
}

export function calculatePointsK5(avgHighPerLeg: number): number {
  if (avgHighPerLeg < 0) throw new Error("Invalid avg high per leg");

  if (avgHighPerLeg <= 0.20) return 0;
  if (avgHighPerLeg <= 0.40) return 1;
  if (avgHighPerLeg <= 0.60) return 2;
  if (avgHighPerLeg <= 0.80) return 3;
  if (avgHighPerLeg <= 1.00) return 4;
  if (avgHighPerLeg <= 1.20) return 5;
  if (avgHighPerLeg <= 1.40) return 6;
  if (avgHighPerLeg <= 1.60) return 7;
  if (avgHighPerLeg <= 1.80) return 8;
  if (avgHighPerLeg <= 2.00) return 9;
  return 10; // > 2.00 Cap
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
  is_offline?: boolean;
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

/**
 * Calculates the total weighted score based on K1-K5 points
 */
export function calculateWeightedTotal(
  points: { p1: number; p2: number; p3: number; p4: number; p5: number },
  weights: typeof DEFAULT_WEIGHTS = DEFAULT_WEIGHTS
): number {
  const rawSum = 
    (points.p1 * weights.weight_k1) +
    (points.p2 * weights.weight_k2) +
    (points.p3 * weights.weight_k3) +
    (points.p4 * weights.weight_k4) +
    (points.p5 * weights.weight_k5);
    
  // Multiply by 5 and round to 2 decimal places to match current frontend expectations
  return Math.round(rawSum * 5 * 100) / 100;
}

export function aggregatePlayerData(records: PlayerRawData[], weights: typeof DEFAULT_WEIGHTS = DEFAULT_WEIGHTS): PlayerComputedData {
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

  let siegequote_pct = 0;
  if (totalGamesPlayed > 0) {
    siegequote_pct = (totalWins / totalGamesPlayed) * 100;
    siegequote_pct = Math.round(siegequote_pct * 100) / 100;
  }

  // Averages for K1, K2, K3
  let avg_total = 0;
  let avg_9 = 0;
  let avg_18 = 0;

  const recordsWithAvg = records.filter(r => !r.is_offline);
  const totalSingleSpieleWithAvg = recordsWithAvg.reduce((sum, r) => sum + r.gespielte_single_spiele, 0);

  if (totalSingleSpieleWithAvg > 0) {
    avg_total = recordsWithAvg.reduce((sum, r) => sum + (r.avg_total * r.gespielte_single_spiele), 0) / totalSingleSpieleWithAvg;
    avg_9 = recordsWithAvg.reduce((sum, r) => sum + (r.avg_9 * r.gespielte_single_spiele), 0) / totalSingleSpieleWithAvg;
    avg_18 = recordsWithAvg.reduce((sum, r) => sum + (r.avg_18 * r.gespielte_single_spiele), 0) / totalSingleSpieleWithAvg;

    avg_total = Math.round(avg_total * 100) / 100;
    avg_9 = Math.round(avg_9 * 100) / 100;
    avg_18 = Math.round(avg_18 * 100) / 100;
  }

  // Avg High per Leg (K5)
  let avg_high_per_leg = 0;
  const totalLegsWithStats = recordsWithAvg.reduce((sum, r) => sum + r.gespielte_legs, 0);
  const sumHighScoresWithStats = recordsWithAvg.reduce((sum, r) => sum + (r.cnt_80 + r.cnt_100 + r.cnt_140 + r.cnt_180), 0);

  if (totalLegsWithStats > 0) {
    avg_high_per_leg = sumHighScoresWithStats / totalLegsWithStats;
    avg_high_per_leg = Math.round(avg_high_per_leg * 100) / 100;
  }

  // Calculate Points
  const points_k1 = calculatePointsK1toK3(avg_total);
  const points_k2 = calculatePointsK1toK3(avg_9);
  const points_k3 = calculatePointsK1toK3(avg_18);
  const points_k4 = calculatePointsK4(siegequote_pct);
  const points_k5 = calculatePointsK5(avg_high_per_leg);

  const total_points = calculateWeightedTotal(
    { p1: points_k1, p2: points_k2, p3: points_k3, p4: points_k4, p5: points_k5 },
    weights
  );

  return {
    source: "aggregated",
    team: records[0].team,
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
