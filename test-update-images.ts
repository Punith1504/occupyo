import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Updating test property with real AI-generated images...");

  const property = await prisma.property.findFirst({
    where: { title: "Test Base64 Property" }
  });

  if (!property) {
    console.log("Could not find the Test Property. Run the seed script first.");
    return;
  }

  const imagePaths = [
    "C:\\Users\\punit\\.gemini\\antigravity-ide\\brain\\cd700e8c-28c8-4a63-9a84-14fc92d8ba06\\premium_office_1_1780175360363.png",
    "C:\\Users\\punit\\.gemini\\antigravity-ide\\brain\\cd700e8c-28c8-4a63-9a84-14fc92d8ba06\\premium_office_2_1780175384248.png"
  ];

  const imageUrls: string[] = [];

  for (const imgPath of imagePaths) {
    if (fs.existsSync(imgPath)) {
      const buffer = fs.readFileSync(imgPath);
      const base64 = buffer.toString('base64');
      imageUrls.push(`data:image/png;base64,${base64}`);
      console.log(`Loaded image: ${imgPath}`);
    } else {
      console.log(`File not found: ${imgPath}`);
    }
  }

  if (imageUrls.length === 0) {
    console.log("No images found to upload.");
    return;
  }

  // Delete existing images
  await prisma.image.deleteMany({
    where: { propertyId: property.id }
  });

  // Create new images
  console.log(`Uploading ${imageUrls.length} massive Base64 strings to Neon DB...`);
  await prisma.image.createMany({
    data: imageUrls.map((url, index) => ({
      url,
      propertyId: property.id,
      isHero: index === 0
    }))
  });

  console.log(`✅ Successfully updated Test Property images!`);
}

main()
  .catch(e => {
    console.error("Error running update:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
