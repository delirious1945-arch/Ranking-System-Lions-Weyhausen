const { POST } = require('../src/app/api/update-snapshot/route.ts');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verifyFix() {
    console.log("Triggering robust update...");
    
    // Mock request
    const mockReq = { 
        json: async () => ({ targetWeekId: "Spieltag 16" })
    };
    
    // Run the POST handler logic directly
    const response = await POST(mockReq);
    const result = await response.json();
    
    console.log("API Result:", result);
    
    if (result.success) {
        const count = await prisma.snapshotPlayerValue.count({ where: { snapshot_id: result.snapshot_id } });
        console.log(`VERIFICATION: Snapshot ${result.snapshot_id} has ${count} players.`);
        
        if (count === 17) {
            console.log("SUCCESS: All 17 players are present.");
        } else {
            console.error(`FAILURE: Expected 17 players, found ${count}.`);
            const players = await prisma.snapshotPlayerValue.findMany({ where: { snapshot_id: result.snapshot_id } });
            console.log("Players found:", players.map(p => p.player_name).join(', '));
        }
    } else {
        console.error("API call failed.");
    }
}

verifyFix().finally(() => {
    prisma.$disconnect();
    process.exit();
});
