/**
 * Converts various image URL formats to direct image URLs
 * Handles Google Drive, Unsplash, and other common image hosting services
 */
export function getDirectImageUrl(url: string): string {
  if (!url) return url;

  // If it's already a direct image URL (ends with image extensions), return as-is
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url)) {
    return url;
  }

  // If it's already an Unsplash images URL, return as-is
  if (url.includes('images.unsplash.com')) {
    return url;
  }

  // Google Drive URLs
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }

  // Google Drive short URLs
  // Format: https://drive.google.com/open?id=FILE_ID
  const driveShortMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (driveShortMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveShortMatch[1]}`;
  }

  // Unsplash photo page URLs
  // Format: https://unsplash.com/photos/description-photo-id
  // Note: Unsplash photo page URLs cannot be directly converted to image URLs
  // Users need to right-click the image and "Copy image address" to get the direct URL
  // For now, we'll return the URL as-is and let the browser try to load it
  // The error handler in the component will show a helpful message
  const unsplashMatch = url.match(/unsplash\.com\/photos\//);
  if (unsplashMatch) {
    // Return as-is - the component will handle the error and show instructions
    return url;
  }

  // If it's already a direct image URL or doesn't match any pattern, return as-is
  return url;
}

