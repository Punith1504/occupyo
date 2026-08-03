import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');

  // Simple protection for demo
  if (secret !== 'occupyo-demo-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
        data: { clerkUserId: 'seed_owner_mn_' + Date.now(), email: 'mn_demo_owner@occupyo.com', role: 'OWNER', companyName: 'MN Premium Real Estate' }
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
            create: p.images.map((imgUrl, i) => ({
              url: imgUrl,
              isHero: i === 0
            }))
          }
        }
      });
      console.log(`Created property: ${created.title}`);
    }

    return NextResponse.json({ success: true, message: 'Seeded MN Demo properties successfully!' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
