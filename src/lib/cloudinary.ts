export function getOptimizedImageUrl(url: string, options: { width?: number; height?: number; crop?: string } = {}) {
  if (!url || !url.includes('res.cloudinary.com')) return url;

  const { width, height, crop = 'fill' } = options;
  const transformations = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  transformations.push('q_auto'); // automatic quality
  transformations.push('f_auto'); // automatic format

  const transformString = transformations.join(',');

  // The URL structure is typically:
  // https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<public_id>
  // We want to insert the transform string right after "upload/"
  return url.replace('/upload/', `/upload/${transformString}/`);
}
