import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/server-auth';
import { withCache } from '@/lib/cache';
import cache from '@/lib/cache';
import { revalidatePath } from 'next/cache';

// GET - Fetch all banners (or only active ones for public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('activeOnly') === 'true';

        // Use cache for active banners (public data)
        // Cache for 60 seconds to balance freshness and performance
        const cacheKey = activeOnly ? 'banners:active' : 'banners:all';

        const banners = await withCache(
            cacheKey,
            async () => {
                return await prisma.banner.findMany({
                    where: activeOnly ? { isActive: true } : undefined,
                    orderBy: { order: 'asc' },
                });
            },
            activeOnly ? 60 : 30 // 60s for active, 30s for all
        );

        return NextResponse.json(banners);
    } catch (error) {
        console.error('Failed to fetch banners:', error);
        return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
    }
}

// POST - Create a new banner (Admin only)
export async function POST(request: NextRequest) {
    try {
        await requireAdminApi();

        const body = await request.json();
        const { title, subtitle, image, videoUrl, link, buttonText, isActive, order } = body;

        // Require either image OR videoUrl
        if (!title || (!image && !videoUrl)) {
            return NextResponse.json({ error: 'Title and image/video are required' }, { status: 400 });
        }

        const banner = await prisma.banner.create({
            data: {
                title,
                subtitle: subtitle || null,
                image: image || '',
                videoUrl: videoUrl || null,
                link: link || null,
                buttonText: buttonText || "Voir l'offre",
                isActive: isActive ?? true,
                order: order ?? 0,
            },
        });

        // Clear banner cache after creation
        cache.delete('banners:active');
        cache.delete('banners:all');

        // Force homepage revalidation to show new banner immediately
        revalidatePath('/');

        return NextResponse.json(banner, { status: 201 });
    } catch (error) {
        console.error('Failed to create banner:', error);
        return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
    }
}

// PUT - Update a banner (Admin only)
export async function PUT(request: NextRequest) {
    try {
        await requireAdminApi();

        const body = await request.json();
        const { id, title, subtitle, image, videoUrl, link, buttonText, isActive, order } = body;

        if (!id) {
            return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
        }

        const banner = await prisma.banner.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(subtitle !== undefined && { subtitle }),
                ...(image !== undefined && { image }),
                ...(videoUrl !== undefined && { videoUrl }),
                ...(link !== undefined && { link }),
                ...(buttonText && { buttonText }),
                ...(isActive !== undefined && { isActive }),
                ...(order !== undefined && { order }),
            },
        });

        // Clear banner cache after update
        cache.delete('banners:active');
        cache.delete('banners:all');

        // Force homepage revalidation to show updated banner immediately
        revalidatePath('/');

        return NextResponse.json(banner);
    } catch (error) {
        console.error('Failed to update banner:', error);
        return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
    }
}

// DELETE - Delete a banner (Admin only)
export async function DELETE(request: NextRequest) {
    try {
        await requireAdminApi();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
        }

        await prisma.banner.delete({
            where: { id },
        });

        // Clear banner cache after deletion
        cache.delete('banners:active');
        cache.delete('banners:all');

        // Force homepage revalidation to remove deleted banner immediately
        revalidatePath('/');

        return NextResponse.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Failed to delete banner:', error);
        return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
    }
}
