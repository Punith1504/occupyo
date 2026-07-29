import 'dotenv/config';
import { prisma } from '../src/lib/prisma'; // Make sure path is correct since it's in scripts/

async function main() {
  console.log('Wiping existing database records for Landlord Demo...');
  
  // Wipe everything out
  await prisma.image.deleteMany({});
  await prisma.lease.deleteMany({});
  await prisma.deal.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.suite.deleteMany({});
  await prisma.spaceRequest.deleteMany({});
  await prisma.userEvent.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.property.deleteMany({});

  console.log('Database wiped. Seeding authentic Minnesota properties...');

  let owner = await prisma.user.findFirst({ where: { role: 'OWNER' } });
  if (!owner) {
    owner = await prisma.user.create({
      data: { clerkUserId: 'seed_owner_mn', email: 'mn_demo_owner@occupyo.com', role: 'OWNER', companyName: 'MN Premium Real Estate' }
    });
  }

  const mnProperties = [
    {
      title: 'North Loop Creative Brick & Timber Loft',
      description: 'Stunning authentic warehouse conversion in the highly desirable North Loop neighborhood of Minneapolis. Features exposed brick, original timber beams, and massive arched windows.',
      propertyType: 'FLEX',
      sizeSqft: 3500,
      pricePerMonth: 9500,
      address: '212 3rd Ave N, Minneapolis, MN 55401',
      lat: 44.9832,
      lng: -93.2725,
      amenities: JSON.stringify(['Exposed Brick', 'Timber Beams', 'Polished Concrete', 'High-Speed Fiber', 'Coffee Bar']),
      images: [
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop',
      ]
    },
    {
      title: 'Class A IDS Center Executive Suites',
      description: 'Premium executive office space on the 40th floor of the iconic IDS Center. Unmatched panoramic views of the Minneapolis skyline, luxury finishes, and access to the Crystal Court.',
      propertyType: 'OFFICE',
      sizeSqft: 12000,
      pricePerMonth: 45000,
      address: '80 S 8th St, Minneapolis, MN 55402',
      lat: 44.9758,
      lng: -93.2730,
      amenities: JSON.stringify(['Skyway Connected', 'Concierge Security', 'Executive Boardrooms', 'Fitness Center']),
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop',
      ]
    },
    {
      title: 'Bloomington Interstate Distribution Hub',
      description: 'Massive Class A industrial warehouse near MSP Airport and I-494. 32-foot clear height, 14 loading docks, and heavy power. Perfect for logistics or last-mile delivery.',
      propertyType: 'WAREHOUSE',
      sizeSqft: 50000,
      pricePerMonth: 65000,
      address: '1000 E 80th St, Bloomington, MN 55420',
      lat: 44.8601,
      lng: -93.2650,
      amenities: JSON.stringify(['14 Loading Docks', '32ft Ceilings', 'ESFR Sprinklers', 'Drive-in Doors']),
      images: [
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1587293852726-59cb2f797273?q=80&w=1200&auto=format&fit=crop',
      ]
    },
    {
      title: 'St. Paul Lowertown Artist Studio & Retail',
      description: 'Vibrant ground-floor retail or studio space in the historic Lowertown district. Massive foot traffic, near CHS Field and the Union Depot.',
      propertyType: 'FLEX',
      sizeSqft: 1800,
      pricePerMonth: 4200,
      address: '300 Wall St, St Paul, MN 55101',
      lat: 44.9495,
      lng: -93.0850,
      amenities: JSON.stringify(['Storefront Glass', 'Historic Charm', 'Light Rail Access']),
      images: [
        'https://images.unsplash.com/photo-1581575261356-9aeb24e4c3fa?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=1200&auto=format&fit=crop',
      ]
    },
    {
      title: 'Rochester Med-Tech R&D Facility',
      description: 'State-of-the-art flex lab space located minutes from the Mayo Clinic. Features clean rooms, upgraded HVAC, and heavy floor load capacity.',
      propertyType: 'FLEX',
      sizeSqft: 8500,
      pricePerMonth: 22000,
      address: '200 1st St SW, Rochester, MN 55902',
      lat: 44.0223,
      lng: -92.4665,
      amenities: JSON.stringify(['Clean Room Compatible', 'High-Capacity HVAC', 'Loading Dock', 'Secure Access']),
      images: [
        'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop',
      ]
    },
    {
      title: 'Edina Galleria Premium Retail Pad',
      description: 'Unmatched luxury retail presence near the Edina Galleria. Incredible demographics, dedicated parking, and premium neighbors.',
      propertyType: 'FLEX',
      sizeSqft: 4000,
      pricePerMonth: 18000,
      address: '3510 Galleria, Edina, MN 55435',
      lat: 44.8780,
      lng: -93.3245,
      amenities: JSON.stringify(['Dedicated Parking', 'High Visibility', 'Premium Finishes']),
      images: [
        'https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1200&auto=format&fit=crop',
      ]
    },
    {
      title: 'Northeast Minneapolis Brewery/Maker Space',
      description: 'Industrial warehouse previously used as a brewery taproom. Includes floor drains, heavy power, and a large outdoor patio area. The heart of the NE Arts District.',
      propertyType: 'FLEX',
      sizeSqft: 6000,
      pricePerMonth: 12500,
      address: '1500 Jackson St NE, Minneapolis, MN 55413',
      lat: 45.0041,
      lng: -93.2505,
      amenities: JSON.stringify(['Floor Drains', 'Heavy Power', 'Outdoor Patio', 'Roll-up Door']),
      images: [
        'https://images.unsplash.com/photo-1552243259-24765d759a2f?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1572111504260-2591a27e025b?q=80&w=1200&auto=format&fit=crop',
      ]
    },
    {
      title: 'Minnetonka Corporate HQ Campus',
      description: 'Sprawling suburban office campus surrounded by nature trails and water features. Ample free parking, cafeteria, and auditorium on site.',
      propertyType: 'OFFICE',
      sizeSqft: 35000,
      pricePerMonth: 75000,
      address: '10000 Wayzata Blvd, Minnetonka, MN 55305',
      lat: 44.9723,
      lng: -93.4241,
      amenities: JSON.stringify(['Free Surface Parking', 'Cafeteria', 'Auditorium', 'Nature Trails']),
      images: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop',
      ]
    },
    {
      title: 'Eagan Cold Storage Facility',
      description: 'Fully operational refrigerated warehouse facility in Eagan. Immediate access to I-35E and Hwy 77. Ideal for food distribution.',
      propertyType: 'WAREHOUSE',
      sizeSqft: 40000,
      pricePerMonth: 55000,
      address: '3200 Lone Oak Rd, Eagan, MN 55121',
      lat: 44.8210,
      lng: -93.1554,
      amenities: JSON.stringify(['Freezer/Cooler Zones', 'Food Grade', 'Cross Dock', 'Trailer Parking']),
      images: [
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1200&auto=format&fit=crop',
      ]
    },
    {
      title: 'Wayzata Lakefront Boutique Office',
      description: 'Incredible boutique office space overlooking Lake Minnetonka. Walkable to Wayzata\'s best restaurants and shops.',
      propertyType: 'OFFICE',
      sizeSqft: 2500,
      pricePerMonth: 10500,
      address: '700 E Lake St, Wayzata, MN 55391',
      lat: 44.9712,
      lng: -93.5085,
      amenities: JSON.stringify(['Lake Views', 'Walkable Amenities', 'Executive Finishes', 'Private Balcony']),
      images: [
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',
      ]
    }
  ];

  for (const p of mnProperties) {
    const created = await (prisma.property as any).create({
      data: {
        ownerId: owner.id,
        title: p.title,
        description: p.description,
        propertyType: p.propertyType as any,
        sizeSqft: p.sizeSqft,
        pricePerMonth: p.pricePerMonth,
        address: p.address,
        lat: p.lat,
        lng: p.lng,
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
          input: p.title + ' ' + p.description + ' ' + p.address,
          encoding_format: 'float'
        });
        const vector = `[${res.data[0].embedding.join(',')}]`;
        await prisma.$executeRawUnsafe(`UPDATE "Property" SET embedding = $1::vector WHERE id = $2`, vector, created.id);
        
        // Also update geospatial point if we have lat/lng
        if (p.lat && p.lng) {
          await prisma.$executeRawUnsafe(`UPDATE "Property" SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`, p.lng, p.lat, created.id);
        }
        
        console.log(` -> Added vector embedding and geospatial point`);
      } catch (e: any) {
        console.log(` -> Failed to add vector embedding:`, e.message);
      }
    }
  }
}

main().then(() => {
  console.log('Minnesota Demo Seed complete!');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
