import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
        console.error("DATABASE_URL is not defined in environment variables!")
    }

    // Using specialized config for Supabase on Vercel
    const pool = new pg.Pool({
        connectionString: connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        // Supabase needs SSL for external connections
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
