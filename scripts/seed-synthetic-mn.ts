import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

const SYNTHETIC_MN_PROPERTIES = [
  {
    title: "Minneapolis Tech Hub Flex Space",
    description: "Modern open-concept flex space in the North Loop. Exposed brick, high ceilings, and Gigabit fiber internet. Perfect for scaling tech startups.",
    propertyType: "FLEX" as const,
    sizeSqft: 5000,
    pricePerMonth: 14500,
    address: "North Loop, Minneapolis, MN 55401",
    status: "AVAILABLE",
    minDuration: 12,
    maxDuration: 60,
    images: [
      { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop", isHero: true },
      { url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop", isHero: false }
    ]
  },
  {
    title: "St. Paul Logistics Center",
    description: "Large scale warehouse with 36ft clear height and 12 loading docks. Easy access to I-94. Ideal for e-commerce distribution.",
    propertyType: "WAREHOUSE" as const,
    sizeSqft: 45000,
    pricePerMonth: 42000,
    address: "Midway, St. Paul, MN 55104",
    status: "AVAILABLE",
    minDuration: 24,
    maxDuration: 120,
    images: [
      { url: "https://images.unsplash.com/photo-1586528116311-ad8ed7e66a5a?q=80&w=2070&auto=format&fit=crop", isHero: true },
      { url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop", isHero: false }
    ]
  },
  {
    title: "Downtown Rochester Medical Office",
    description: "Class A medical office space located just blocks from the Mayo Clinic. Fully built-out exam rooms and spacious waiting area.",
    propertyType: "OFFICE" as const,
    sizeSqft: 3200,
    pricePerMonth: 12800,
    address: "Downtown, Rochester, MN 55902",
    status: "AVAILABLE",
    minDuration: 36,
    maxDuration: 120,
    images: [
      { url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop", isHero: true }
    ]
  },
  {
    title: "Bloomington Retail Anchor",
    description: "High-visibility retail space near the Mall of America. Massive signage potential and 100+ dedicated parking spots.",
    propertyType: "FLEX" as const,
    sizeSqft: 12000,
    pricePerMonth: 28000,
    address: "South Loop, Bloomington, MN 55425",
    status: "AVAILABLE",
    minDuration: 60,
    maxDuration: 240,
    images: [
      { url: "https://images.unsplash.com/photo-1555529733-0e67056058e1?q=80&w=1974&auto=format&fit=crop", isHero: true }
    ]
  },
  {
    title: "Duluth Harbor View Office",
    description: "Incredible views of Lake Superior from this premium corner office suite. Walkable to Canal Park restaurants.",
    propertyType: "OFFICE" as const,
    sizeSqft: 2800,
    pricePerMonth: 8500,
    address: "Canal Park, Duluth, MN 55802",
    status: "AVAILABLE",
    minDuration: 12,
    maxDuration: 60,
    images: [
      { url: "https://images.unsplash.com/photo-1497215842964-222b430dc094?q=80&w=2070&auto=format&fit=crop", isHero: true }
    ]
  },
  {
    title: "Edina Executive Suites",
    description: "Turn-key executive suites in a Class A suburban building. Includes shared conference rooms and on-site gym.",
    propertyType: "OFFICE" as const,
    sizeSqft: 1500,
    pricePerMonth: 5200,
    address: "Centennial Lakes, Edina, MN 55435",
    status: "AVAILABLE",
    minDuration: 6,
    maxDuration: 36,
    images: [
      { url: "https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=2070&auto=format&fit=crop", isHero: true }
    ]
  },
  {
    title: "Eagan Industrial Cold Storage",
    description: "Specialized cold storage warehouse with multiple temperature zones. Near major highways and airport.",
    propertyType: "WAREHOUSE" as const,
    sizeSqft: 30000,
    pricePerMonth: 38000,
    address: "Industrial Park, Eagan, MN 55121",
    status: "AVAILABLE",
    minDuration: 36,
    maxDuration: 120,
    images: [
      { url: "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1935&auto=format&fit=crop", isHero: true }
    ]
  },
  {
    title: "Minnetonka Lakeside Retail",
    description: "Charming retail storefront with lake views. Perfect for a boutique or high-end cafe. Excellent summer foot traffic.",
    propertyType: "FLEX" as const,
    sizeSqft: 2200,
    pricePerMonth: 9000,
    address: "Wayzata Blvd, Minnetonka, MN 55391",
    status: "AVAILABLE",
    minDuration: 24,
    maxDuration: 84,
    images: [
      { url: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=2072&auto=format&fit=crop", isHero: true }
    ]
  },
  {
    title: "Brooklyn Park R&D Flex",
    description: "Hybrid office and light manufacturing space. Upgraded power systems and heavy floor load capacity.",
    propertyType: "FLEX" as const,
    sizeSqft: 18000,
    pricePerMonth: 21500,
    address: "North Business Park, Brooklyn Park, MN 55428",
    status: "AVAILABLE",
    minDuration: 36,
    maxDuration: 120,
    images: [
      { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop", isHero: true }
    ]
  },
  {
    title: "Uptown Minneapolis Creative Studio",
    description: "Vibrant creative space in the heart of Uptown. Polished concrete floors, full kitchen, and private rooftop deck.",
    propertyType: "FLEX" as const,
    sizeSqft: 4000,
    pricePerMonth: 11000,
    address: "Uptown, Minneapolis, MN 55408",
    status: "AVAILABLE",
    minDuration: 12,
    maxDuration: 60,
    images: [
      { url: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2069&auto=format&fit=crop", isHero: true }
    ]
  }
];

async function seed() {
  console.log("Starting synthetic Minnesota seed...");
  
  let admin = await prisma.user.findFirst({ where: { email: 'admin@occupyo.com' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        clerkUserId: 'admin_synthetic_seed_user',
        email: 'admin@occupyo.com',
        role: 'ADMIN',
        companyName: 'Occupyo Capital Partners'
      }
    });
    console.log("Created mock admin user.");
  }

  for (const prop of SYNTHETIC_MN_PROPERTIES) {
    const { images, ...data } = prop;
    const createdProp = await prisma.property.create({
      data: {
        ...data,
        ownerId: admin.id,
      }
    });
    
    for (const img of images) {
      await prisma.image.create({
        data: {
          propertyId: createdProp.id,
          url: img.url,
          isHero: img.isHero
        }
      });
    }
  }
  
  console.log(`Successfully seeded ${SYNTHETIC_MN_PROPERTIES.length} synthetic properties in Minnesota.`);
}

seed().catch(console.error).finally(() => prisma.$disconnect());
