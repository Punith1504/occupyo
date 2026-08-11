import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  console.log("Connecting to:", connectionString);
  const pool = new Pool({ connectionString });
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
