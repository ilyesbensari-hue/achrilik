import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';

// GET - Fetch all banners (or only active ones for public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('activeOnly') === 'true';

        const banners = await prisma.banner.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            orderBy: { order: 'asc' },
        });

        return NextResponse.json(banners);
    } catch (error) {
        console.error('Failed to fetch banners:', error);
        return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
    }
}

// POST - Create a new banner (Admin only)
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await verifyToken(token);

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, subtitle, image, link, buttonText, isActive, order } = body;

        if (!title || !image) {
            return NextResponse.json({ error: 'Title and image are required' }, { status: 400 });
        }

        const banner = await prisma.banner.create({
            data: {
                title,
                subtitle: subtitle || null,
                image,
                link: link || null,
                buttonText: buttonText || "Voir l'offre",
                isActive: isActive ?? true,
                order: order ?? 0,
            },
        });

        return NextResponse.json(banner, { status: 201 });
    } catch (error) {
        console.error('Failed to create banner:', error);
        return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
    }
}

// PUT - Update a banner (Admin only)
export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await verifyToken(token);

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, title, subtitle, image, link, buttonText, isActive, order } = body;

        if (!id) {
            return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
        }

        const banner = await prisma.banner.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(subtitle !== undefined && { subtitle }),
                ...(image && { image }),
                ...(link !== undefined && { link }),
                ...(buttonText && { buttonText }),
                ...(isActive !== undefined && { isActive }),
                ...(order !== undefined && { order }),
            },
        });

        return NextResponse.json(banner);
    } catch (error) {
        console.error('Failed to update banner:', error);
        return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
    }
}

// DELETE - Delete a banner (Admin only)
export async function DELETE(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await verifyToken(token);

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
        }

        await prisma.banner.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Failed to delete banner:', error);
        return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
    }
}
