import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let connectionString = process.env.DATABASE_URL || '';
connectionString = connectionString.replace('?sslmode=require', '?').replace('&sslmode=require', '').replace('&sslaccept=accept_invalid_certs', '').replace('?sslaccept=accept_invalid_certs', '?');

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

