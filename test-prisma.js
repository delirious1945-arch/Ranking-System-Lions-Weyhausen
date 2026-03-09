const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

try {
    const prisma1 = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
    console.log("datasourceUrl works");
    prisma1.$disconnect();
} catch (e) {
    console.log("Error with datasourceUrl:", e.message);
}
