
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. Find the specific store
        const store = await prisma.store.findFirst({
            where: { name: { contains: 'Fashion Oran', mode: 'insensitive' } }
        });

        if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

        // 2. Get products
        const products = await prisma.product.findMany({
            where: { storeId: store.id },
            include: { Category: true },
            orderBy: { title: 'asc' }
        });

        // 3. Get all categories for the dropdowns
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({
            products: products.map(p => ({
                id: p.id,
                title: p.title,
                image: p.images.split(',')[0],
                categoryId: p.categoryId,
                categoryName: p.Category?.name || 'Non classé',
                slug: p.Category?.slug,
                status: p.status
            })),
            categories: categories.map(c => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                parentId: c.parentId
            }))
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

        return NextResponse.json({ success: true, updatedCount: results.length });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
