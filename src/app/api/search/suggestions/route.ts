import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Fuse from 'fuse.js';

const TEST_FILTER = process.env.NODE_ENV === 'production' ? {
    title: { not: { startsWith: '[TEST]' } },
    NOT: { id: { startsWith: 'prod-' } }
} : {};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ suggestions: [] });
        }

        // Fetch a broad set of approved products (enough for fuzzy matching)
        const products = await prisma.product.findMany({
            where: {
                status: 'APPROVED',
                ...TEST_FILTER,
            },
            take: 200,
            select: {
                id: true,
                title: true,
                price: true,
                discountPrice: true,
                images: true,
                brand: true,
                Category: {
                    select: { name: true }
                },
                Store: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // ─── Fuzzy search with Fuse.js ─────────────────────────────────────────
        // Threshold 0.45 = fairly permissive: "pont" → "pantalon", "rob" → "robe"
        const fuse = new Fuse(products, {
            keys: [
                { name: 'title', weight: 0.7 },
                { name: 'brand', weight: 0.2 },
                { name: 'Category.name', weight: 0.1 },
                { name: 'Store.name', weight: 0.05 },
            ],
            threshold: 0.45,
            distance: 200,
            minMatchCharLength: 2,
            ignoreLocation: true, // match anywhere in the string
        });

        const fuseResults = fuse.search(query, { limit: 8 });

        // Also include exact contains matches that Fuse might have missed
        const containsIds = new Set(fuseResults.map(r => r.item.id));
        const exactMatches = products.filter(
            p => !containsIds.has(p.id) &&
                 p.title.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);

        const allResults = [
            ...fuseResults.map(r => r.item),
            ...exactMatches
        ].slice(0, 8);

        const suggestions = allResults.map(product => ({
            id: product.id,
            type: 'product' as const,
            title: product.title,
            slug: product.id,
            image: product.images
                ? (Array.isArray(product.images) ? product.images[0] : product.images.split(',')[0])
                : null,
            price: product.discountPrice || product.price,
            originalPrice: product.discountPrice ? product.price : null,
            category: product.Category?.name || null,
            storeName: product.Store?.name || null,
        }));

        return NextResponse.json(
            { suggestions, query },
            {
                headers: {
                    // Cache 2 min — fresh enough for UX
                    'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
                }
            }
        );
    } catch (error) {
        console.error('Search suggestions error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch suggestions', suggestions: [] },
            { status: 500 }
        );
    }
}
