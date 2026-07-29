import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function cleanup() {
  console.log('Cleaning up duplicate and test properties...');
  
  // 1. Delete garbage test properties
  const garbageProperties = await prisma.property.findMany({
    where: {
      OR: [
        { title: { contains: 'Test Property' } },
        { title: { contains: 'Live OpenAI' } },
        { title: { contains: 'Vector Search' } },
        { title: '' },
      ]
    },
    select: { id: true }
  });

  const garbageIds = garbageProperties.map(p => p.id);

  if (garbageIds.length > 0) {
    await prisma.image.deleteMany({ where: { propertyId: { in: garbageIds } } });
    await prisma.deal.deleteMany({ where: { propertyId: { in: garbageIds } } });
    
    const deleted = await prisma.property.deleteMany({
      where: { id: { in: garbageIds } }
    });
    console.log(`Deleted ${deleted.count} test properties.`);
  } else {
    console.log('No test properties found to delete.');
  }

  // 2. Fix images for all remaining properties
  // The user wants to change images to the "same" (the working Unsplash ones)
  console.log('Replacing all property images with working Unsplash images...');
  
  const allProperties = await prisma.property.findMany();
  
  const workingUrls = [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop', // Office building
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop', // Modern interior
    'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?q=80&w=1200&auto=format&fit=crop'  // Clean workspace
  ];

  for (const p of allProperties) {
    // Delete existing images to avoid duplicates/broken links
    await prisma.image.deleteMany({
      where: { propertyId: p.id }
    });
    
    // Add working images
    await prisma.image.createMany({
      data: workingUrls.map((url, i) => ({
        propertyId: p.id,
        url,
        isHero: i === 0
      }))
    });
  }
  
  console.log(`Updated images for ${allProperties.length} properties.`);
}

cleanup().catch(console.error).finally(() => prisma.$disconnect());
