import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary
 * @param fileBuffer - The image file buffer
 * @param folder - The folder name in Cloudinary (default: 'products')
 * @returns The secure URL of the uploaded image
 */
export async function uploadToCloudinary(
    fileBuffer: Buffer,
    folder: string = 'products'
): Promise<string> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto',
                transformation: [
                    { width: 1200, height: 1500, crop: 'limit' }, // Max dimensions
                    { quality: 'auto:good' }, // Auto optimize quality
                ],
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve(result.secure_url);
                } else {
                    reject(new Error('Upload failed'));
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
