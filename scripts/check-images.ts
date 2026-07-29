import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function check() {
  const props = await prisma.property.findMany({
    include: { images: true }
  });
  
  let withImages = 0;
  let withoutImages = 0;
  
  for (const p of props) {
    if (p.images.length > 0) {
      withImages++;
    } else {
      withoutImages++;
      console.log(`No images: ${p.title}`);
    }
  }
  
  console.log(`\nTotal: ${props.length}`);
  console.log(`With images: ${withImages}`);
  console.log(`Without images: ${withoutImages}`);
}

check().catch(console.error).finally(() => prisma.$disconnect());
