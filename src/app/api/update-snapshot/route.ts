import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { prisma } from '@/lib/prisma';
import {
    calculatePointsK1toK3,
    calculatePointsK4,
    calculatePointsK5
} from '@/lib/scoring';

// ─── Configuration ────────────────────────────────────────────────
interface EventConfig {
    eventId: number;
    includeTeams: string[];        // Include players of these teams
    alwaysInclude: string[];       // Always include these player names
}

const EVENTS: EventConfig[] = [
    {
        eventId: 247,
        includeTeams: ['Lions Weyhausen A'],
        alwaysInclude: [],
    },
    {
        eventId: 251,
        includeTeams: ['Lions Weyhausen B'],
        alwaysInclude: [],
    },
    {
        eventId: 239,
        includeTeams: [],
        alwaysInclude: ['Jens Goltermann'],
    },
];

const BASE = 'https://2k-dart-software.com/frontend/events/10/event';

// ─── Helpers ───────────────────────────────────────────────────────
function parseFloat2(str: string): number {
    if (!str || str.trim() === '' || str.trim() === '-') return 0;
    const n = parseFloat(str.replace(/[Øø ]/g, '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
}

function parseInt2(str: string): number {
    if (!str || str.trim() === '' || str.trim() === '-') return 0;
    const n = parseInt(str.replace(/[+]/g, ''), 10);
    return isNaN(n) ? 0 : n;
}

function getWeekId(): string {
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// ─── Scrape one event ─────────────────────────────────────────────
interface ScrapedPlayer {
    player_name: string;
    verein: string;
    avg_total: number;
    avg_9: number;
    avg_18: number;
    cnt_180: number;
    cnt_140: number;
    cnt_100: number;
    cnt_80: number;
    gespielte_single_spiele: number;
    wins: number;
    legs_won: number;
    legs_lost: number;
}

async function scrapeEvent(page: any, eventId: number, config: EventConfig): Promise<ScrapedPlayer[]> {
    const baseUrl = `${BASE}/${eventId}`;

    // 1. Stats page
    await page.goto(`${baseUrl}/statistics/statistics`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('p-table tbody tr', { timeout: 20000 });

    const statsRows = await page.evaluate(() =>
        Array.from(document.querySelectorAll('p-table tbody tr')).map(tr =>
            Array.from(tr.querySelectorAll('td')).map(td => (td as HTMLElement).innerText?.trim() ?? '')
        )
    );

    const statsMap = new Map<string, {
        avg_total: number; avg_9: number; avg_18: number;
        cnt_180: number; cnt_140: number; cnt_100: number; cnt_80: number;
    }>();

    for (const row of statsRows) {
        const name = row[1]?.trim();
        if (!name || name.includes('&')) continue; // skip Doppel entries
        statsMap.set(name, {
            avg_total: parseFloat2(row[2]),
            cnt_180: parseInt2(row[5]),
            cnt_140: parseInt2(row[6]),
            cnt_100: parseInt2(row[7]),
            cnt_80: parseInt2(row[8]),
            avg_9: parseFloat2(row[9]),
            avg_18: parseFloat2(row[12]),
        });
    }

    // 2. Bilanz page (team name + Spiele/Legs)
    await page.goto(`${baseUrl}/statistics/player/results`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('p-table tbody tr', { timeout: 20000 });

    const bilanzRows = await page.evaluate(() =>
        Array.from(document.querySelectorAll('p-table tbody tr')).map(tr =>
            Array.from(tr.querySelectorAll('td')).map(td => (td as HTMLElement).innerText?.trim() ?? '')
        )
    );

    const players: ScrapedPlayer[] = [];

    for (const row of bilanzRows) {
        const name = row[1]?.trim();
        const verein = row[2]?.trim();
        if (!name || !verein) continue;

        const isTargetTeam = config.includeTeams.includes(verein);
        const isAlwaysInclude = config.alwaysInclude.includes(name);
        if (!isTargetTeam && !isAlwaysInclude) continue;

        const stats = statsMap.get(name);
        const wins = parseInt2(row[4]);
        const losses = parseInt2(row[6]);
        const legs_won = parseInt2(row[10]);
        const legs_lost = parseInt2(row[12]);

        players.push({
            player_name: name,
            verein,
            avg_total: stats?.avg_total ?? 0,
            avg_9: stats?.avg_9 ?? 0,
            avg_18: stats?.avg_18 ?? 0,
            cnt_180: stats?.cnt_180 ?? 0,
            cnt_140: stats?.cnt_140 ?? 0,
            cnt_100: stats?.cnt_100 ?? 0,
            cnt_80: stats?.cnt_80 ?? 0,
            gespielte_single_spiele: wins + losses,
            wins,
            legs_won,
            legs_lost,
        });
    }

    console.log(`[Event ${eventId}] Found ${players.length} eligible players`);
    return players;
}

// ─── Route Handler ────────────────────────────────────────────────
export async function POST() {
    let browser: any | undefined;

    try {
        const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

        if (isProd) {
            // Vercel / Production launch
            const chromiumAny = chromium as any;
            browser = await puppeteer.launch({
                args: chromiumAny.args,
                defaultViewport: chromiumAny.defaultViewport,
                executablePath: await chromiumAny.executablePath(),
                headless: chromiumAny.headless,
            });
        } else {
            // Local fallback (requires full puppeteer installed)
            const localPuppeteer = require('puppeteer');
            browser = await localPuppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
        }

        const page = await browser.newPage();
        await page.setDefaultTimeout(60000);

        // Scrape all events
        const allScrapedRaw: ScrapedPlayer[] = [];

        for (const eventConfig of EVENTS) {
            const players = await scrapeEvent(page, eventConfig.eventId, eventConfig);
            allScrapedRaw.push(...players);
        }

        await browser.close();
        browser = undefined;

        // --- Fetch Manual Games ---
        // Calculate current week ID
        const now = new Date();
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        const currentWeekId = `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;

        const manualGames = await prisma.manualGame.findMany({
            where: { week_id: currentWeekId }
        });

        console.log(`[update-snapshot] Found ${manualGames.length} manual games for ${currentWeekId}`);

        console.log(`[update-snapshot] Total raw players collected: ${allScrapedRaw.length}`);

        // --- Aggregation Logic ---
        // If a player is in multiple events, we sum their counts and weight their averages.
        const aggregatedMap = new Map<string, {
            player_name: string;
            verein: string;
            wins: number;
            legs_won: number;
            legs_lost: number;
            gespielte_single_spiele: number;
            cnt_80: number;
            cnt_100: number;
            cnt_140: number;
            cnt_180: number;
            weighted_avg_total: number;
            weighted_avg_9: number;
            weighted_avg_18: number;
            total_legs_for_avg: number;
        }>();

        for (const p of allScrapedRaw) {
            const existing = aggregatedMap.get(p.player_name);
            const currentLegs = p.legs_won + p.legs_lost;

            if (existing) {
                existing.wins += p.wins;
                existing.legs_won += p.legs_won;
                existing.legs_lost += p.legs_lost;
                existing.gespielte_single_spiele += p.gespielte_single_spiele;
                existing.cnt_80 += p.cnt_80;
                existing.cnt_100 += p.cnt_100;
                existing.cnt_140 += p.cnt_140;
                existing.cnt_180 += p.cnt_180;

                // Average weighting
                existing.weighted_avg_total += (p.avg_total * currentLegs);
                existing.weighted_avg_9 += (p.avg_9 * currentLegs);
                existing.weighted_avg_18 += (p.avg_18 * currentLegs);
                existing.total_legs_for_avg += currentLegs;

                // Keep the primary team name (e.g., Lions A preferred over Jens Liga)
                if (p.verein.includes('Lions')) {
                    existing.verein = p.verein;
                }
            } else {
                aggregatedMap.set(p.player_name, {
                    player_name: p.player_name,
                    verein: p.verein,
                    wins: p.wins,
                    legs_won: p.legs_won,
                    legs_lost: p.legs_lost,
                    gespielte_single_spiele: p.gespielte_single_spiele,
                    cnt_80: p.cnt_80,
                    cnt_100: p.cnt_100,
                    cnt_140: p.cnt_140,
                    cnt_180: p.cnt_180,
                    weighted_avg_total: p.avg_total * currentLegs,
                    weighted_avg_9: p.avg_9 * currentLegs,
                    weighted_avg_18: p.avg_18 * currentLegs,
                    total_legs_for_avg: currentLegs,
                });
            }
        }

        // --- Merge Manual Games ---
        for (const mg of manualGames) {
            const existing = aggregatedMap.get(mg.player_name);
            const mgLegs = mg.legs_total;
            const halfLegs = mgLegs / 2;
            const mgWins = (mg.game1_win ? 1 : 0) + (mg.game2_win ? 1 : 0);

            const mgWeightedTotal = (mg.game1_avg * halfLegs) + (mg.game2_avg * halfLegs);
            const mgWeighted9 = (mg.game1_avg_9 * halfLegs) + (mg.game2_avg_9 * halfLegs);
            const mgWeighted18 = (mg.game1_avg_18 * halfLegs) + (mg.game2_avg_18 * halfLegs);

            if (existing) {
                existing.wins += mgWins;
                existing.legs_won += halfLegs;
                existing.legs_lost += halfLegs;
                existing.gespielte_single_spiele += 2;
                existing.cnt_80 += mg.cnt_80;
                existing.cnt_100 += mg.cnt_100;
                existing.cnt_140 += mg.cnt_140;
                existing.cnt_180 += mg.cnt_180;
                existing.weighted_avg_total += mgWeightedTotal;
                existing.weighted_avg_9 += mgWeighted9;
                existing.weighted_avg_18 += mgWeighted18;
                existing.total_legs_for_avg += mgLegs;
            } else {
                aggregatedMap.set(mg.player_name, {
                    player_name: mg.player_name,
                    verein: "Lions Weyhausen",
                    wins: mgWins,
                    legs_won: halfLegs,
                    legs_lost: halfLegs,
                    gespielte_single_spiele: 2,
                    cnt_80: mg.cnt_80,
                    cnt_100: mg.cnt_100,
                    cnt_140: mg.cnt_140,
                    cnt_180: mg.cnt_180,
                    weighted_avg_total: mgWeightedTotal,
                    weighted_avg_9: mgWeighted9,
                    weighted_avg_18: mgWeighted18,
                    total_legs_for_avg: mgLegs,
                });
            }
        }

        // --- Fetch Ranking Configuration ---
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

        // --- Compute ranking for each player ---
        interface RankedPlayer {
            player_name: string;
            verein: string;
            gespielte_single_spiele: number;
            gespielte_legs: number;
            avg_total: number;
            avg_9: number;
            avg_18: number;
            wins: number;
            games_played: number;
            siegequote_pct: number;
            cnt_80: number;
            cnt_100: number;
            cnt_140: number;
            cnt_180: number;
            sum_high_scores: number;
            avg_high_per_leg: number;
            points_k1: number;
            points_k2: number;
            points_k3: number;
            points_k4: number;
            points_k5: number;
            total_points: number;
        }

        const ranked: RankedPlayer[] = Array.from(aggregatedMap.values()).map(p => {
            const gespielte_legs = p.legs_won + p.legs_lost;
            const avg_total = p.total_legs_for_avg > 0 ? p.weighted_avg_total / p.total_legs_for_avg : 0;
            const avg_9 = p.total_legs_for_avg > 0 ? p.weighted_avg_9 / p.total_legs_for_avg : 0;
            const avg_18 = p.total_legs_for_avg > 0 ? p.weighted_avg_18 / p.total_legs_for_avg : 0;

            const sum_high_scores = p.cnt_80 + p.cnt_100 + p.cnt_140 + p.cnt_180;
            const avg_high_per_leg = gespielte_legs > 0
                ? Math.round((sum_high_scores / gespielte_legs) * 100) / 100 : 0;

            const games_played = p.gespielte_single_spiele;
            const siegequote_pct = games_played > 0
                ? Math.round((p.wins / games_played) * 10000) / 100 : 0;

            const points_k1 = calculatePointsK1toK3(avg_total);
            const points_k2 = calculatePointsK1toK3(avg_9);
            const points_k3 = calculatePointsK1toK3(avg_18);
            const points_k4 = calculatePointsK4(siegequote_pct);
            const points_k5 = calculatePointsK5(avg_high_per_leg);

            // Apply dynamic weights
            const total_points =
                (points_k1 * (config!.weight_k1 / 0.1)) + // Normalized weight where 0.1 = 1x factor for a 10pt category?
                // Wait, if weights sum to 1.0 (100%), and categories are 0-10, 
                // we should multiply categorical points by (weight * 10) likely or just sum them directly if 
                // the user wants the total points to reflect the weighted sum of 0-10 values.
                // 10 points * 0.20 = 2.0. Sum would be up to 10.0.
                (points_k1 * config!.weight_k1) +
                (points_k2 * config!.weight_k2) +
                (points_k3 * config!.weight_k3) +
                (points_k4 * config!.weight_k4) +
                (points_k5 * config!.weight_k5);

            // Multiply by 10 to keep it in a familiar range (0-100 total points possible)
            const final_total = Math.round(total_points * 10 * 100) / 100;

            return {
                player_name: p.player_name,
                verein: p.verein,
                gespielte_single_spiele: games_played,
                gespielte_legs,
                avg_total,
                avg_9,
                avg_18,
                wins: p.wins,
                games_played,
                siegequote_pct,
                cnt_80: p.cnt_80,
                cnt_100: p.cnt_100,
                cnt_140: p.cnt_140,
                cnt_180: p.cnt_180,
                sum_high_scores,
                avg_high_per_leg,
                points_k1,
                points_k2,
                points_k3,
                points_k4,
                points_k5,
                total_points: final_total,
            };
        });

        // Sort descending by total_points
        ranked.sort((a, b) => b.total_points - a.total_points);

        // Save snapshot — delete any existing one for same week first
        const weekId = getWeekId();
        // Removed: deleting old snapshot for same week. 
        // We now keep multiple snapshots per week to allow "jumping back".


        const snapshot = await prisma.snapshot.create({
            data: { week_id: weekId, timestamp: new Date() }
        });

        for (let i = 0; i < ranked.length; i++) {
            const p = ranked[i];
            await prisma.snapshotPlayerValue.create({
                data: {
                    snapshot_id: snapshot.snapshot_id,
                    player_name: p.player_name,
                    verein: p.verein,
                    gespielte_single_spiele: p.gespielte_single_spiele,
                    gespielte_legs: p.gespielte_legs,
                    avg_total: p.avg_total,
                    avg_9: p.avg_9,
                    avg_18: p.avg_18,
                    wins: p.wins,
                    games_played: p.games_played,
                    siegequote_pct: p.siegequote_pct,
                    cnt_80: p.cnt_80,
                    cnt_100: p.cnt_100,
                    cnt_140: p.cnt_140,
                    cnt_180: p.cnt_180,
                    sum_high_scores: p.sum_high_scores,
                    avg_high_per_leg: p.avg_high_per_leg,
                    points_k1: p.points_k1,
                    points_k2: p.points_k2,
                    points_k3: p.points_k3,
                    points_k4: p.points_k4,
                    points_k5: p.points_k5,
                    total_points: p.total_points,
                    rank: i + 1,
                    source: 'webscraper',
                    veto_flag: false,
                }
            });
        }

        console.log(`[update-snapshot] Snapshot ${snapshot.snapshot_id} (${weekId}) saved with ${ranked.length} players`);

        return NextResponse.json({
            success: true,
            snapshot_id: snapshot.snapshot_id,
            week_id: weekId,
            players_saved: ranked.length,
            preview: ranked.slice(0, 10).map((p, i) => ({
                rank: i + 1,
                name: p.player_name,
                team: p.verein,
                total_points: p.total_points,
            }))
        });

    } catch (error) {
        console.error('[update-snapshot] Error:', error);
        if (browser) await browser.close();
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
