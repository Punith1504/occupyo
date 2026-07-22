require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Creating vector extension and HNSW index...");
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log("Vector extension verified.");
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Property_embedding_idx" 
      ON "Property" 
      USING hnsw (embedding vector_cosine_ops);
    `);
    console.log("HNSW index created successfully.");
  } catch (error) {
    console.error("Error creating index:", error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
