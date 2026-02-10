import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch products with promotions directly from database
        // Much faster than fetching all products and filtering client-side
        const promos = await prisma.product.findMany({
            where: {
                status: 'APPROVED',
                OR: [
                    // Has promotion label
                    {
                        AND: [
                            { promotionLabel: { not: null } },
                            { promotionLabel: { not: '' } }
                        ]
                    },
                    // Has discount price
                    {
                        AND: [
                            { discountPrice: { not: null } },
                            { discountPrice: { gt: 0 } }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                title: true,
                price: true,
                images: true,
                discountPrice: true,
                promotionLabel: true,
                Category: {
                    select: {
                        name: true
                    }
                }
            },
            take: 50,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(promos, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        });
    } catch (error) {
        console.error('GET /api/products/promotions error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch promotions' },
            { status: 500 }
        );
    }
}
