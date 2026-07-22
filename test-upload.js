const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("Starting test property upload to Neon DB...");

  // Get the first available owner
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { role: 'OWNER' },
        { role: 'ADMIN' }
      ]
    }
  });

  if (!user) {
    console.log("No OWNER or ADMIN user found. Run the app and sign in first.");
    return;
  }

  // A valid Base64 string of a tiny 1x1 red pixel image
  const dummyBase64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  const property = await prisma.property.create({
    data: {
      ownerId: user.id,
      title: "Test Base64 Property",
      description: "This is an automated test property to verify that massive Base64 strings are correctly saved in the Neon PostgreSQL database without crashing.",
      propertyType: "OFFICE",
      sizeSqft: 2500,
      pricePerMonth: 5000,
      pricePerHour: 50,
      pricePerDay: 400,
      minDuration: 1,
      maxDuration: 24,
      durationUnit: "MONTHS",
      address: "123 Neon Database Way, Cloud City, CA 90210",
      lat: 34.0522,
      lng: -118.2437,
      amenities: ["Wi-Fi", "24/7 Access", "Security Cameras"],
      images: {
        create: [
          {
            url: dummyBase64Image,
            isHero: true
          }
        ]
      }
    }
  });

  console.log(`✅ Successfully uploaded Test Property to Neon Database!`);
  console.log(`Property ID: ${property.id}`);
  console.log(`Title: ${property.title}`);
  
  // Verify it reads back correctly
  const savedImage = await prisma.image.findFirst({
    where: { propertyId: property.id }
  });

  if (savedImage && savedImage.url === dummyBase64Image) {
    console.log("✅ Base64 image verified in database!");
  } else {
    console.log("❌ Base64 image failed to save correctly.");
  }
}

main()
  .catch(e => {
    console.error("Error running test upload:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
