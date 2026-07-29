import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

const exactMapping: Record<string, string> = {
  "cmpaakobn000104kyst1iyhsw": "photo-1586528116311-ad8ed745eb33", // Flex wearhouse
  "cmpdhwrri000004l4anomeq28": "photo-1553413077-190dd305871c", // hello
  "cmpsudhf800007g58qzi8v6oq": "photo-1497366216548-37526070297c", // Test Base64 Property
  "cmrwcfe77000604l2myczgh8q": "photo-1605810230434-7631ac76ec81", // Flex warehouse
  "cmrzdiayd000s1kmbkpdfh327": "photo-1517502884422-41eaead166d4", // The Industrial Loft @ Soho
  "cmrzdibku000v1kmb0r4fx308": "photo-1497215728101-856f4ea42174", // Modern Glass High-Rise Suite
  "cmrzdicd5000y1kmbkk0fjnrs": "photo-1504328345606-18bbc8c9d7d1", // Massive Logistics Warehouse HQ
  "cmrzdid2q00111kmbiqwiswxu": "photo-1600607688969-a5bfcd64bd40", // Creative Arts Studio & Gallery
  "cms2smn5g0000w4mb8oo53aq7": "photo-1524758631624-e2822e304c36", // Modern Glass Tower Office Suite 1
  "cms2smpwu0003w4mbwt5wskoi": "photo-1600607686527-6fb886090705", // Creative Loft Flex Space 1
  "cms2snvqk0000nsmbzvhejf8g": "photo-1416339442236-8ceb164046f8", // Modern Glass Tower Office Suite 2
  "cms2sny1y0003nsmb6co37r8t": "photo-1527192491265-7e15c55b1ed2", // Creative Loft Flex Space 2
  "cms2snzit0006nsmb83fs2b2d": "photo-1559925393-8be0ec4767c8", // Prime High-Street Retail Frontage
  "cms2so1040009nsmb2jzoe7yn": "photo-1587293852726-69477401a88b", // Massive Distribution Warehouse
  "cms2so2lu000cnsmbr27dgvze": "photo-1497366754035-f200968a6e72", // Boutique Coworking & Private Offices
};

async function run() {
  console.log('Assigning exact hand-picked images to properties...');
  
  for (const [id, imageId] of Object.entries(exactMapping)) {
    const url = `https://images.unsplash.com/${imageId}?q=80&w=1200&auto=format&fit=crop`;

    // First delete existing images for this property
    await prisma.image.deleteMany({
      where: { propertyId: id }
    });
    
    // Create new context-aware hero image
    await prisma.image.create({
      data: {
        propertyId: id,
        url: url,
        isHero: true
      }
    });
    
    console.log(`Updated property ${id} with exact image ${imageId}`);
  }
  
  console.log(`Successfully assigned perfect images!`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
