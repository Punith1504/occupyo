import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import OpenAI from "openai";
import { generateImageEmbedding } from "@/lib/vision/clip";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
});

export const generateEmbeddings = inngest.createFunction(
  { id: "generate-embeddings", event: "property.created", retries: 3 },
  async ({ event, step }) => {
    const { id } = event.data;

    // 1. Fetch the property
    const property = await step.run("fetch-property", async () => {
      const p = await prisma.property.findUnique({
        where: { id },
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
    // Assuming the property has a sourceUrl or an image attached we want to embed.
    // Wait, the schema has `sourceUrl`. If there is an array of images, we'd pick the first.
    // For now, if there's no specific image field on property, we'll use `sourceUrl` as a proxy if it's an image, or we might need to skip if not available.
    // Let's assume we can fetch an image if available. The prompt says "Generate ... vision embeddings for property images".
    // I will use sourceUrl for now.
    let imageEmbeddingString: string | null = null;
    if (property.sourceUrl && property.sourceUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      imageEmbeddingString = await step.run("generate-vision-embedding", async () => {
        try {
          const vector = await generateImageEmbedding(property.sourceUrl!);
          return `[${vector.join(',')}]`;
        } catch (error) {
          console.warn("Failed to generate image embedding for URL:", property.sourceUrl, error);
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
