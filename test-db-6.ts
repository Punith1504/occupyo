import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const connectionString = "postgresql://postgres.nijtuihunotflqhtjrje:SaiPunithReddy9@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const count = await prisma.property.count();
    const props = await prisma.property.findMany({
      take: 2,
      select: { title: true, address: true, images: true }
    });
    
    // Check if embeddings exist
    const embeddedProps = await prisma.$queryRaw`SELECT COUNT(*) FROM "Property" WHERE embedding IS NOT NULL`;
    
    console.log(`Total properties in DB: ${count}`);
    console.log(`Properties with embeddings:`, embeddedProps);
    console.log(`Sample properties:`, JSON.stringify(props, null, 2));
  } catch (e) {
    console.error("DB check failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
