import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ suggestions: [] });
        }

        // Search products with full-text search
        const products = await prisma.product.findMany({
            where: {
                AND: [
                    { status: 'APPROVED' }, // Only show approved products
                    {
                        OR: [
                            { title: { contains: query, mode: 'insensitive' } },
                            { description: { contains: query, mode: 'insensitive' } },
                        ]
                    }
                ]
            },
            take: 5,
            select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                image: true,
                category: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: [
                { createdAt: 'desc' } // Most recent first
            ]
        });

        // Transform to suggestion format
        const suggestions = products.map(product => ({
            id: product.id,
            type: 'product' as const,
            title: product.title,
            slug: product.slug,
            image: product.image?.split(',')[0] || null, // First image only
            price: product.price,
            category: product.category?.name || null,
        }));

        // Cache for 5 minutes
        return NextResponse.json(
            { suggestions },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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
