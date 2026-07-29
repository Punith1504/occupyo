import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  console.log('Seeding beautiful properties...');
  let owner = await prisma.user.findFirst({ where: { role: 'OWNER' } });
  if (!owner) {
    owner = await prisma.user.create({
      data: { clerkUserId: 'seed_owner', email: 'seed_owner@occupyo.com', role: 'OWNER', companyName: 'Occupyo Seed Properties' }
    });
  }

  const propertiesToCreate = [
    {
      title: 'Modern Glass Tower Office Suite',
      description: 'Stunning Class A office space with floor-to-ceiling glass windows, sweeping city views, and open-plan layout perfect for a tech headquarters.',
      propertyType: 'OFFICE',
      sizeSqft: 4500,
      pricePerMonth: 15000,
      address: '100 Financial District Blvd, New York, NY 10005',
      amenities: JSON.stringify(['High-Speed Internet', 'Lobby Security', 'Conference Rooms', 'Cafe']),
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop',
      ]
    },
    {
      title: 'Creative Loft Flex Space',
      description: 'Industrial-chic loft space with exposed brick, polished concrete floors, and soaring ceilings. Ideal for creative agencies or studio work.',
      propertyType: 'FLEX',
      sizeSqft: 2200,
      pricePerMonth: 6500,
      address: '250 Arts District Ln, Los Angeles, CA 90013',
      amenities: JSON.stringify(['Exposed Brick', 'Concrete Floors', 'Freight Elevator', 'Kitchenette']),
      images: [
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop',
      ]
    },
    {
      title: 'Prime High-Street Retail Frontage',
      description: 'High foot-traffic retail location with massive display windows. Previously a luxury boutique, ready for immediate move-in.',
      propertyType: 'FLEX',
      sizeSqft: 1800,
      pricePerMonth: 12000,
      address: '500 Mag Mile, Chicago, IL 60611',
      amenities: JSON.stringify(['Display Windows', 'Stock Room', 'Fitting Rooms']),
      images: [
        'https://images.unsplash.com/photo-1581575261356-9aeb24e4c3fa?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=1200&auto=format&fit=crop',
      ]
    },
    {
      title: 'Massive Distribution Warehouse',
      description: 'Logistics dream: 30ft clear heights, 4 loading docks, and easy access to major interstate highways. Perfect for last-mile distribution.',
      propertyType: 'WAREHOUSE',
      sizeSqft: 25000,
      pricePerMonth: 35000,
      address: '77 Logistics Way, Dallas, TX 75201',
      amenities: JSON.stringify(['Loading Docks', '30ft Ceilings', 'Office Buildout', 'Gated Truck Court']),
      images: [
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1587293852726-59cb2f797273?q=80&w=1200&auto=format&fit=crop',
      ]
    },
    {
      title: 'Boutique Coworking & Private Offices',
      description: 'Turnkey private offices within a premium coworking environment. Includes access to shared lounges, phone booths, and free coffee.',
      propertyType: 'OFFICE',
      sizeSqft: 500,
      pricePerMonth: 2000,
      address: '42 Startup Ave, Austin, TX 78701',
      amenities: JSON.stringify(['Furnished', 'Phone Booths', 'Lounge', 'Coffee Bar']),
      images: [
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
      ]
    }
  ];

  for (const p of propertiesToCreate) {
    const created = await (prisma.property as any).create({
      data: {
        ownerId: owner.id,
        title: p.title,
        description: p.description,
        propertyType: p.propertyType as any,
        sizeSqft: p.sizeSqft,
        pricePerMonth: p.pricePerMonth,
        address: p.address,
        amenities: p.amenities,
        images: {
          create: p.images.map((url, i) => ({
            url,
            isHero: i === 0
          }))
        }
      }
    });
    console.log(`Created property: ${created.title}`);
    
    // Attempt to update embedding if OpenAI key exists
    if (process.env.OPENAI_API_KEY) {
      try {
        const { default: OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const res = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: p.title + ' ' + p.description,
          encoding_format: 'float'
        });
        const vector = `[${res.data[0].embedding.join(',')}]`;
        await prisma.$executeRawUnsafe(`UPDATE "Property" SET embedding = $1::vector WHERE id = $2`, vector, created.id);
        console.log(` -> Added vector embedding`);
      } catch (e: any) {
        console.log(` -> Failed to add vector embedding:`, e.message);
      }
    }
  }
}

main().then(() => {
  console.log('Seed complete!');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
