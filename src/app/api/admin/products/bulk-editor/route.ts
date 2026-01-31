
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get('storeId');
        const limit = parseInt(searchParams.get('limit') || '100');

        const where: any = {};
        if (storeId) {
            where.storeId = storeId;
        }

        const products: any[] = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: { Category: true, Store: true }
        });

        // Fetch categories for the dropdown
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                parentId: true
            }
        });

        // Fetch stores for filter dropdown
        const stores = await prisma.store.findMany({
            select: { id: true, name: true }
        });

        return NextResponse.json({
            products: products.map(p => ({
                id: p.id,
                title: p.title,
                image: p.images ? p.images.split(',')[0] : null,
                categoryId: p.categoryId,
                categoryName: p.Category?.name || 'Non classé',
                slug: p.Category?.slug,
                status: p.status,
                storeName: p.Store?.name
            })),
            categories: categories.map(c => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                parentId: c.parentId
            })),
            stores
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { updates } = body; // Array of { id, categoryId, status }

        if (!Array.isArray(updates)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const results = [];
        for (const update of updates) {
            const data: any = {};
            if (update.categoryId !== undefined) data.categoryId = update.categoryId;
            if (update.status !== undefined) data.status = update.status;

            const res = await prisma.product.update({
                where: { id: update.id },
                data
            });
            results.push(res.id);
        }

        return NextResponse.json({ success: true, updated: results.length });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
