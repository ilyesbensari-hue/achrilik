import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'banners');

// Ensure upload directory exists
function ensureUploadDir() {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
}

/**
 * Save base64 image to filesystem
 * @param base64Data - Base64 encoded image data (with or without data:image prefix)
 * @returns Public URL path to the saved image
 */
export async function saveBase64Image(base64Data: string): Promise<string> {
    ensureUploadDir();

    // Extract MIME type and data
    const matches = base64Data.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);

    let imageBuffer: Buffer;
    let extension: string;

    if (matches && matches.length === 3) {
        // Has data:image prefix
        extension = matches[1].replace('+', ''); // e.g., "jpeg", "png", "webp"
        const base64Content = matches[2];
        imageBuffer = Buffer.from(base64Content, 'base64');
    } else {
        // Assume it's raw base64 (default to png)
        extension = 'png';
        imageBuffer = Buffer.from(base64Data, 'base64');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageBuffer.length > maxSize) {
        throw new Error('Image size exceeds 5MB limit');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = randomBytes(8).toString('hex');
    const filename = `banner-${timestamp}-${randomId}.${extension}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Save file
    fs.writeFileSync(filepath, imageBuffer);

    // Return public URL path
    return `/uploads/banners/${filename}`;
}

/**
 * Delete image from filesystem
 * @param imageUrl - Public URL path (e.g., /uploads/banners/banner-123.png)
 */
export async function deleteImage(imageUrl: string): Promise<void> {
    try {
        // Extract filename from URL
        const filename = path.basename(imageUrl);
        const filepath = path.join(UPLOAD_DIR, filename);

        // Delete file if exists
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        // Don't throw - deletion is not critical
    }
}

/**
 * Validate image MIME type
 * @param base64Data - Base64 encoded image
 * @returns true if valid image type
 */
export function isValidImageType(base64Data: string): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const match = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,/);

    if (!match) {
        return true; // Assume valid if no prefix (raw base64)
    }

    return validTypes.includes(match[1]);
}
