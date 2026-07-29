import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

// Categorized Unsplash IDs
const images = {
  OFFICE: [
    'photo-1497366216548-37526070297c',
    'photo-1497215728101-856f4ea42174',
    'photo-1524758631624-e2822e304c36',
    'photo-1416339442236-8ceb164046f8',
    'photo-1504384308090-c894fdcc538d',
    'photo-1497366754035-f200968a6e72',
    'photo-1504384764586-bb4cdc1707b0'
  ],
  WAREHOUSE: [
    'photo-1586528116311-ad8ed745eb33',
    'photo-1553413077-190dd305871c',
    'photo-1605810230434-7631ac76ec81',
    'photo-1504328345606-18bbc8c9d7d1',
    'photo-1587293852726-69477401a88b',
    'photo-1578575437130-527eed3abbec'
  ],
  FLEX: [
    'photo-1600607686527-6fb886090705',
    'photo-1517502884422-41eaead166d4',
    'photo-1527192491265-7e15c55b1ed2',
    'photo-1600607688969-a5bfcd64bd40',
    'photo-1556761175-5973dc0f32b7'
  ],
  RETAIL: [
    'photo-1555396273-367ea4eb4db5',
    'photo-1441986300917-64674bd600d8',
    'photo-1534422298391-e4f8c172dd36',
    'photo-1559925393-8be0ec4767c8',
    'photo-1581578731548-c64695cc6952'
  ]
};

async function run() {
  console.log('Assigning unique, context-aware images to properties...');
  
  const properties = await prisma.property.findMany();
  
  // Track used images to ensure uniqueness as much as possible
  const usedIds = new Set<string>();

  for (const p of properties) {
    let pool = images[p.propertyType as keyof typeof images] || images.FLEX;
    
    // If the title or description mentions specific keywords, override the pool
    const text = (p.title + ' ' + p.description).toLowerCase();
    if (text.includes('studio') || text.includes('art') || text.includes('film')) {
      pool = images.FLEX;
    } else if (text.includes('restaurant') || text.includes('cafe') || text.includes('kitchen')) {
      pool = images.RETAIL;
    } else if (text.includes('logistics') || text.includes('distribution')) {
      pool = images.WAREHOUSE;
    }
    
    // Find an unused image in the pool, or fallback to a random one if pool exhausted
    let selectedId = pool.find(id => !usedIds.has(id));
    if (!selectedId) {
      selectedId = pool[Math.floor(Math.random() * pool.length)];
    }
    usedIds.add(selectedId);
    
    const url = `https://images.unsplash.com/${selectedId}?q=80&w=1200&auto=format&fit=crop`;

    // First delete existing images for this property
    await prisma.image.deleteMany({
      where: { propertyId: p.id }
    });
    
    // Create new context-aware hero image
    await prisma.image.create({
      data: {
        propertyId: p.id,
        url: url,
        isHero: true
      }
    });
    
    console.log(`Updated [${p.propertyType}] ${p.title} -> ${selectedId}`);
  }
  
  console.log(`Successfully updated ${properties.length} properties with unique images!`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
