const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function inspectSample() {
    const eventId = 247;
    const encounterId = 462148;
    const gameId = 1111001; // dummy, let's find a real one
    
    console.log("Inspecting Encounter 462148...");
    const reportUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/match/${encounterId}/report`;
    const reportRes = await fetch(reportUrl, { headers: HEADERS });
    const reportData = await reportRes.json();
    const games = reportData.matchReportRows || Object.values(reportData);
    
    if (games.length > 0) {
        const firstGameId = games[0].id;
        console.log("Checking Game ID:", firstGameId);
        const statsUrl = `https://backend-ddv.3k-darts.com/2k-backend-ddv/api/v1/frontend/event/${eventId}/match/${firstGameId}/statistics`;
        const statsRes = await fetch(statsUrl, { headers: HEADERS });
        const statsData = await statsRes.json();
        
        const summariesArray = Array.isArray(statsData) ? statsData : Object.values(statsData);
        for (const s of summariesArray) {
            console.log("Player:", s.displayName);
            console.log("Participant Team:", s.participant?.displayName);
            console.log("Type:", s.type);
            console.log("---");
        }
    }
}

inspectSample();
