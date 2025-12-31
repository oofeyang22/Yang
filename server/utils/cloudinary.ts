// server/utils/cloudinary.ts
export function getCloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  };
}

// Keep for potential future server-side use
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadToCloudinary(
  filePath: string, 
  folder: string = 'posts'
): Promise<UploadApiResponse> {
  if (!filePath) {
    throw new Error("File path is required for Cloudinary upload.");
  }
  
  return await cloudinary.uploader.upload(filePath, { folder });
}

export { cloudinary };