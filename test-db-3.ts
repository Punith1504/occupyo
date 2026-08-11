import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const connectionString = "postgresql://postgres.nijtuihunotflqhtjrje:SaiPunithReddy9@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&sslaccept=accept_invalid_certs";
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  try {
    const user = await prisma.user.findFirst();
    console.log("Success! DB is working on aws-0. Result:", user);
  } catch (e) {
    console.error("DB Connection/Query Error on aws-0:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
