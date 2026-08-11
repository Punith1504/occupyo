import 'dotenv/config';
import { prisma } from '../src/lib/prisma'; 

async function main() {
  try {
    console.log("Running homepage query...");
    const properties = await prisma.property.findMany({
      where: { status: "AVAILABLE" },
      include: {
        images: {
          orderBy: { isHero: 'desc' }
        }
      },
      take: 12,
    });
    console.log(`Found ${properties.length} properties.`);
  } catch (error: any) {
    console.error("Homepage DB error:", error.message);
  }
}

main();
