// Use Cloudinary (free tier)
// OR ImgBB (free tier)
// OR Upload.io (free tier)
export const storageConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
}; 