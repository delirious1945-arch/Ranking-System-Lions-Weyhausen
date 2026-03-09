import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
        console.error("CRITICAL: DATABASE_URL is undefined!");
    } else {
        // Safety check: Log the format without showing the password
        try {
            const url = new URL(connectionString);
            console.log(`DB Connection: host=${url.hostname}, port=${url.port}, protocol=${url.protocol}`);
        } catch (e) {
            console.error("CRITICAL: DATABASE_URL is not a valid URL format!");
        }
    }

    const pool = new pg.Pool({
        connectionString: connectionString,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: {
            rejectUnauthorized: false
        }
    })

    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
