import { pipeline, env } from "@xenova/transformers";

// Disable local model checks to ensure it runs cleanly in serverless/node environments
env.allowLocalModels = false;

// Singleton to cache the pipeline
let imageExtractor: any = null;

export async function generateImageEmbedding(imageUrl: string): Promise<number[]> {
  const urlObj = new URL(imageUrl);
  if (urlObj.protocol !== 'https:') {
    throw new Error('Only HTTPS URLs are allowed');
  }
  
  const isLocal = urlObj.hostname === 'localhost' || 
                  urlObj.hostname === '127.0.0.1' || 
                  urlObj.hostname === '169.254.169.254' ||
                  urlObj.hostname.startsWith('10.') || 
                  urlObj.hostname.startsWith('192.168.') || 
                  (urlObj.hostname.startsWith('172.') && parseInt(urlObj.hostname.split('.')[1]) >= 16 && parseInt(urlObj.hostname.split('.')[1]) <= 31) ||
                  urlObj.hostname.endsWith('.internal');
                  
  if (isLocal) {
    throw new Error('Local URLs are not allowed');
  }

  if (!imageExtractor) {
    // We use image-feature-extraction for CLIP
    imageExtractor = await pipeline("image-feature-extraction", "Xenova/clip-vit-base-patch32");
  }

  // Generate the features
  const output = await imageExtractor(imageUrl);
  
  // output.data is a Float32Array containing the 512-dimension vector
  return Array.from(output.data);
}
