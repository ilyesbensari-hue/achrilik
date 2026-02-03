
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper: Recursively get all descendant category IDs
async function getAllDescendantCategoryIds(categoryId: string): Promise<string[]> {
    const childCategories = await prisma.category.findMany({
        where: { parentId: categoryId },
        select: { id: true }
    });

    if (childCategories.length === 0) {
        return [categoryId];
    }

    // Recursively get descendants of each child
    const descendantIds = await Promise.all(
        childCategories.map(child => getAllDescendantCategoryIds(child.id))
    );

    // Flatten and include current category
    return [categoryId, ...descendantIds.flat()];
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

        if (!categoryId) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        // Get all descendant category IDs recursively to include subcategory products
        const categoryIds = await getAllDescendantCategoryIds(categoryId);

        const products = await prisma.product.findMany({
            where: {
                categoryId: { in: categoryIds },
                status: 'APPROVED'
            },
            include: {
                Category: true,
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });

        const mappedProducts = products.map(p => {
            const images = p.images ? p.images.split(',') : [];
            return {
                id: p.id,
                title: p.title,
                price: p.price,
                discountPrice: p.discountPrice,
                image: images[0] || '/placeholder-product.png',
                categoryName: p.Category?.name || '',
                categoryId: p.categoryId
            };
        });

        return NextResponse.json(mappedProducts);
    } catch (error) {
        console.error('GET /api/products/by-category error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
