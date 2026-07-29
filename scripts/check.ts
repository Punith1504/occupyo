import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function check() {
  const props = await prisma.property.findMany({ include: { images: true } });
  console.log('Total properties:', props.length);
  const noImages = props.filter((p: any) => p.images.length === 0);
  console.log('Properties without images:', noImages.length);
  for (const p of noImages) {
    const urls = [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop'
    ];
    await prisma.image.createMany({
      data: urls.map((url, i) => ({
        propertyId: p.id,
        url,
        isHero: i === 0
      }))
    });
    console.log(`Added default images to: ${p.title}`);
  }
  console.log('Fixed all missing images!');
}

check().finally(() => {});
