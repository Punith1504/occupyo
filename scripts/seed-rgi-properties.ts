import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const rgiProperties = [
  {
    title: "Premium Flex Warehouse - Maple Grove",
    description: "State-of-the-art flexible warehouse space located in Maple Grove. Perfect for e-commerce, distribution, and light manufacturing. Features high ceilings, dock doors, and modern office spaces.",
    pricePerMonth: 4500,
    sizeSqft: 6000,
    address: "11200 93rd Ave N, Maple Grove, MN 55369",
    lat: 45.1278,
    lng: -93.4357,
    status: "AVAILABLE",
    propertyType: "WAREHOUSE",
    amenities: ["Dock Doors", "High Ceilings", "Office Space", "Parking", "24/7 Access", "Climate Control"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop",
        isHero: true,
      },
      {
        url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop",
        isHero: false,
      }
    ]
  },
  {
    title: "Executive Office Suites - Eden Prairie",
    description: "Professional office environment with private suites, co-working areas, and premium amenities. Located in the heart of Eden Prairie with easy access to major highways.",
    pricePerMonth: 1200,
    sizeSqft: 1500,
    address: "11000 Prairie Lakes Dr, Eden Prairie, MN 55344",
    lat: 44.8546,
    lng: -93.4262,
    status: "AVAILABLE",
    propertyType: "OFFICE",
    amenities: ["High-speed Internet", "Conference Rooms", "Kitchen", "Reception", "Printing Services"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
        isHero: true,
      },
      {
        url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop",
        isHero: false,
      }
    ]
  },
  {
    title: "Creative Studio Space - Northeast Minneapolis",
    description: "Vibrant creative studio in the Arts District. Exposed brick, natural light, and open floor plan. Ideal for artists, designers, and creative agencies.",
    pricePerMonth: 2800,
    sizeSqft: 3200,
    address: "1500 Jackson St NE, Minneapolis, MN 55413",
    lat: 45.0035,
    lng: -93.2505,
    status: "AVAILABLE",
    propertyType: "FLEX",
    amenities: ["Natural Light", "Exposed Brick", "Loading Dock", "Freight Elevator", "Pet Friendly"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?q=80&w=2070&auto=format&fit=crop",
        isHero: true,
      }
    ]
  },
  {
    title: "RGI Medical Plaza - Minnetonka",
    description: "Class A medical office space. Move-in ready suites with plumbing, patient waiting areas, and exam rooms. Ample free parking for patients and staff.",
    pricePerMonth: 5500,
    sizeSqft: 4500,
    address: "15450 Highway 7, Minnetonka, MN 55345",
    lat: 44.9123,
    lng: -93.4831,
    status: "AVAILABLE",
    propertyType: "OFFICE",
    amenities: ["Plumbing", "Waiting Area", "Exam Rooms", "Handicap Accessible", "Ample Parking"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
        isHero: true,
      }
    ]
  },
  {
    title: "Light Industrial & Showroom - Bloomington",
    description: "Versatile space combining retail showroom frontage with rear warehouse storage. Excellent visibility on major thoroughfare.",
    pricePerMonth: 3800,
    sizeSqft: 5000,
    address: "9401 James Ave S, Bloomington, MN 55431",
    lat: 44.8329,
    lng: -93.3038,
    status: "AVAILABLE",
    propertyType: "FLEX",
    amenities: ["Showroom Window", "Drive-in Door", "Signage", "Retail Frontage", "Storage"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1553456558-aff63285aa49?q=80&w=2064&auto=format&fit=crop",
        isHero: true,
      }
    ]
  }
];

async function seed() {
  console.log("Seeding RGI Group Properties into live database...");

  try {
    // 1. Get an existing owner to attach these to.
    const owner = await prisma.user.findFirst({
      where: { role: "OWNER" },
    });

    if (!owner) {
      console.log("No OWNER found in the database. Cannot seed.");
      return;
    }

    console.log(`Found owner: ${owner.id}, ${owner.email}. Attaching RGI properties...`);

    let count = 0;
    for (const propData of rgiProperties) {
      const existing = await prisma.property.findFirst({
        where: { address: propData.address }
      });

      if (!existing) {
        const { images, amenities, propertyType, ...coreProp } = propData;
        
        await prisma.property.create({
          data: {
            ...coreProp,
            propertyType: propertyType as any,
            ownerId: owner.id,
            amenities: amenities,
            images: {
              create: images
            }
          }
        });
        console.log(`Created: ${propData.title}`);
        count++;
      } else {
        console.log(`Skipped (already exists): ${propData.title}`);
      }
    }
    console.log(`Seeding complete. Created ${count} new properties.`);

  } catch (err) {
    console.error("Failed to seed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
