import { pipeline, env } from "@xenova/transformers";

// Disable local model checks to ensure it runs cleanly in serverless/node environments
env.allowLocalModels = false;

// Singleton to cache the pipeline
let imageExtractor: any = null;

export async function generateImageEmbedding(imageUrl: string): Promise<number[]> {
  if (!imageExtractor) {
    // We use image-feature-extraction for CLIP
    imageExtractor = await pipeline("image-feature-extraction", "Xenova/clip-vit-base-patch32");
  }

  // Generate the features
  const output = await imageExtractor(imageUrl);
  
  // output.data is a Float32Array containing the 512-dimension vector
  return Array.from(output.data);
}
