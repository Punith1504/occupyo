import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  let connectionString = process.env.DATABASE_URL || '';
  
  // Apply our SSL fix from prisma.ts
  connectionString = connectionString.replace('?sslmode=require', '?').replace('&sslmode=require', '').replace('&sslaccept=accept_invalid_certs', '').replace('?sslaccept=accept_invalid_certs', '?');
  
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  try {
    const user = await prisma.user.findFirst();
    console.log("Success! DB is working. Result:", user);
  } catch (e) {
    console.error("DB Connection/Query Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
