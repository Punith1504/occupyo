import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function list() {
  const properties = await prisma.property.findMany({ select: { id: true, title: true, propertyType: true, description: true } });
  console.log(JSON.stringify(properties, null, 2));
}

list().catch(console.error).finally(() => prisma.$disconnect());
