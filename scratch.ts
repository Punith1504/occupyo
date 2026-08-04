import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const properties = await prisma.property.findMany({
    take: 10,
    include: {
      owner: true,
      images: true,
      suites: true
    }
  });

  console.log("Properties found:", properties.length);
  for (const p of properties) {
    console.log(p.id, p.title);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
