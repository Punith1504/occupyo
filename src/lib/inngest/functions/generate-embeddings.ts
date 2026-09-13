// @ts-nocheck
import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import OpenAI from "openai";
import { generateImageEmbedding } from "@/lib/vision/clip";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
});

export const generateEmbeddings = inngest.createFunction(
  { id: "generate-embeddings", triggers: [{ event: "property.created" }] },
  async ({ event, step }) => {
    const { id } = (event.data || {}) as { id: string };

    // 1. Fetch the property
    const property = await step.run("fetch-property", async () => {
      const p = await prisma.property.findUnique({
        where: { id },
        include: { images: true }
      });
      if (!p) throw new Error(`Property ${id} not found`);
      return p;
    });

    // 2. Generate Text Embedding
    const textEmbeddingString = await step.run("generate-text-embedding", async () => {
      const textToEmbed = `${property.title}. ${property.description}. Located at ${property.address}. Type: ${property.propertyType}. Size: ${property.sizeSqft} sqft. Amenities: ${JSON.stringify(property.amenities || [])}.`;
      
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: textToEmbed,
        encoding_format: "float",
      });
      
      const embedding = response.data[0].embedding;
      return `[${embedding.join(',')}]`;
    });

    // 3. Generate Vision Embedding (if an image exists)
    let imageEmbeddingString: string | null = null;
    
    // Check for hero image first, otherwise fallback to first image, otherwise fallback to sourceUrl (for external listings)
    const heroImage = property.images?.find((img: any) => img.isHero) || property.images?.[0];
    const imageUrlToEmbed = heroImage?.url || property.sourceUrl;
    
    if (imageUrlToEmbed && imageUrlToEmbed.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      imageEmbeddingString = await step.run("generate-vision-embedding", async () => {
        try {
          const vector = await generateImageEmbedding(imageUrlToEmbed);
          return `[${vector.join(',')}]`;
        } catch (error) {
          console.warn("Failed to generate image embedding for URL:", imageUrlToEmbed, error);
          return null;
        }
      });
    }

    // 4. Update the Database with raw SQL for vectors
    await step.run("update-database", async () => {
      // If we have both, we update both. If just text, we update text.
      // We use Prisma.sql to safely construct this.
      if (imageEmbeddingString) {
        await prisma.$executeRaw`
          UPDATE "Property"
          SET 
            "embedding" = ${textEmbeddingString}::vector,
            "imageEmbedding" = ${imageEmbeddingString}::vector
          WHERE "id" = ${id}
        `;
      } else {
        await prisma.$executeRaw`
          UPDATE "Property"
          SET 
            "embedding" = ${textEmbeddingString}::vector
          WHERE "id" = ${id}
        `;
      }
    });

    return { success: true, textVector: !!textEmbeddingString, imageVector: !!imageEmbeddingString };
  }
);
