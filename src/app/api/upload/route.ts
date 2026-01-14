import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'Aucun fichier fourni' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Type de fichier non autorisé. Utilisez JPEG, PNG, WebP ou GIF.' },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'Fichier trop volumineux. Maximum 5MB.' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExt = file.name.split('.').pop() || 'jpg';
        const uniqueId = randomBytes(16).toString('hex');
        const filename = `${Date.now()}-${uniqueId}.${fileExt}`;

        // Save to public/uploads/products
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // Return the public URL path
        const publicUrl = `/uploads/products/${filename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'upload' },
            { status: 500 }
        );
    }
}
