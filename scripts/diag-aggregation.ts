
import { getAggregateStatsUpTo, updateMatchCache } from "../src/lib/match-service";
import { prisma } from "../src/lib/prisma";

async function diag() {
    console.log("--- Diagnostic Start ---");
    
    // 1. Check LIONS_NAMES
    const { LIONS_NAMES } = require("../src/lib/lions-config");
    console.log("LIONS_NAMES count:", LIONS_NAMES.length);

    // 2. Aggregate Spieltag 16
    console.log("Running getAggregateStatsUpTo(16)...");
    const stats = await getAggregateStatsUpTo(16);
    console.log("Aggregated players count:", stats.length);
    
    const withGames = stats.filter(s => s.games_played > 0);
    console.log("Players with games:", withGames.length);
    withGames.forEach(p => console.log(`- ${p.player_name}: ${p.games_played} games`));

    const zeroGames = stats.filter(s => s.games_played === 0);
    console.log("Players with 0 games:", zeroGames.length);

    console.log("--- Diagnostic End ---");
}

diag().catch(console.error).finally(() => prisma.$disconnect());
