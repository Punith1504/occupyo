/* eslint-disable-next-line @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:", users);
  const properties = await prisma.property.findMany();
  console.log("Properties:", properties);
}

main().catch(console.error).finally(() => prisma.$disconnect());
