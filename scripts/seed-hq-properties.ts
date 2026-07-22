import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const HQ_PROPERTIES = [
  {
    title: "The Industrial Loft @ Soho",
    description: "Incredible exposed brick and timber loft in the heart of Soho. Perfect for creative agencies, production studios, or tech startups looking for an inspiring workspace with 18ft ceilings.",
    propertyType: "FLEX",
    sizeSqft: 4500,
    pricePerMonth: 12500,
    address: "Spring St, New York, NY 10012",
    status: "AVAILABLE",
    capRate: 6.5,
    noi: 150000,
    leaseType: "NNN",
    minDuration: 12,
    maxDuration: 60,
    durationUnit: "MONTHS",
    amenities: ["Fiber Internet", "Private Elevator", "Exposed Brick", "Loading Dock"],
    images: [
      { url: "https://images.unsplash.com/photo-1590402235941-866cd4009312?q=80&w=2070&auto=format&fit=crop", isHero: true },
      { url: "https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?q=80&w=2081&auto=format&fit=crop", isHero: false }
    ]
  },
  {
    title: "Modern Glass High-Rise Suite",
    description: "Premium corner suite with panoramic city views. Class A finishes, dedicated reception, and boardroom. Ideal for law firms or financial services.",
    propertyType: "OFFICE",
    sizeSqft: 3200,
    pricePerMonth: 18000,
    address: "Financial District, San Francisco, CA 94104",
    status: "AVAILABLE",
    capRate: 5.2,
    noi: 216000,
    leaseType: "Gross",
    minDuration: 36,
    maxDuration: 120,
    durationUnit: "MONTHS",
    amenities: ["Concierge", "Underground Parking", "Gym", "Cafeteria"],
    images: [
      { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop", isHero: true },
      { url: "https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=2070&auto=format&fit=crop", isHero: false }
    ]
  },
  {
    title: "Massive Logistics Warehouse HQ",
    description: "State-of-the-art logistics facility with 32ft clear heights, 10 dock doors, and heavy power. Immediate highway access for seamless supply chain operations.",
    propertyType: "WAREHOUSE",
    sizeSqft: 25000,
    pricePerMonth: 35000,
    address: "Industrial Pkwy, Dallas, TX 75236",
    status: "AVAILABLE",
    capRate: 7.1,
    noi: 420000,
    leaseType: "NNN",
    minDuration: 60,
    maxDuration: 120,
    durationUnit: "MONTHS",
    amenities: ["32ft Clearance", "10 Dock Doors", "Heavy Power", "Highway Access"],
    images: [
      { url: "https://images.unsplash.com/photo-1586528116311-ad8ed7e66a5a?q=80&w=2070&auto=format&fit=crop", isHero: true },
      { url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop", isHero: false }
    ]
  },
  {
    title: "Creative Arts Studio & Gallery",
    description: "Bright, airy ground-floor gallery space with incredible foot traffic. High visibility storefront, concrete floors, and museum-grade track lighting.",
    propertyType: "RETAIL",
    sizeSqft: 1800,
    pricePerMonth: 6500,
    address: "Arts District, Los Angeles, CA 90012",
    status: "AVAILABLE",
    capRate: 6.8,
    noi: 78000,
    leaseType: "Modified Gross",
    minDuration: 12,
    maxDuration: 60,
    durationUnit: "MONTHS",
    amenities: ["Storefront", "Track Lighting", "Concrete Floors", "High Foot Traffic"],
    images: [
      { url: "https://images.unsplash.com/photo-1520699049698-acd2fceb893a?q=80&w=2070&auto=format&fit=crop", isHero: true },
      { url: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2069&auto=format&fit=crop", isHero: false }
    ]
  }
];

async function seed() {
  console.log("Starting DB seed with HQ properties...");

  // 1. Ensure a mock owner exists
  let owner = await prisma.user.findFirst({ where: { email: 'admin@occupyo.com' } });
  if (!owner) {
    owner = await prisma.user.create({
      data: {
        clerkUserId: 'admin_seed_user',
        email: 'admin@occupyo.com',
        role: 'ADMIN',
        companyName: 'Occupyo Capital Partners'
      }
    });
    console.log("Created mock admin owner.");
  }

  // 2. Clear old properties to keep it clean (optional, but requested for hq experience)
  await prisma.property.deleteMany({ where: { ownerId: owner.id } });
  console.log("Cleared old mock properties.");

  // 3. Inject new HQ properties
  for (const prop of HQ_PROPERTIES) {
    const { images, ...data } = prop;
    
    const createdProp = await prisma.property.create({
      data: {
        ...data,
        ownerId: owner.id,
      }
    });

    for (const img of images) {
      await prisma.propertyImage.create({
        data: {
          propertyId: createdProp.id,
          url: img.url,
          isHero: img.isHero
        }
      });
    }
    console.log(`Seeded: ${createdProp.title}`);
  }

  console.log("Seeding complete! 🚀");
}

seed().catch(console.error).finally(() => prisma.$disconnect());
