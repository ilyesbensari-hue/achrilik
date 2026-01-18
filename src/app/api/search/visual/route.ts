import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { features } = body;

        if (!features || !Array.isArray(features)) {
            return NextResponse.json(
                { error: 'Features array is required' },
                { status: 400 }
            );
        }

        // Récupérer tous les produits avec leurs images
        const products = await prisma.product.findMany({
            where: {
                images: { not: '' },
            },
            select: {
                id: true,
                title: true,
                price: true,
                images: true,
                category: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
                store: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
            },
            take: 100, // Limiter pour performance
        });

        // Pour le MVP, on va utiliser une approche simple :
        // Comparer les features avec les métadonnées des produits
        // (couleur dominante, catégorie, etc.)

        // Dans une vraie implémentation, on stockerait les features
        // dans la DB et on ferait la comparaison côté serveur

        // Pour l'instant, on retourne tous les produits
        // et on fera la comparaison côté client
        const results = products.map(product => ({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.images?.split(',')[0] || '',
            category: product.category?.name || '',
            store: product.store?.name || '',
            city: product.store?.city || '',
        }));

        return NextResponse.json({
            success: true,
            products: results,
            count: results.length,
        });
    } catch (error) {
        console.error('Visual search error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET endpoint pour récupérer les features pré-calculées
export async function GET() {
    try {
        // Récupérer tous les produits avec images
        const products = await prisma.product.findMany({
            where: {
                images: { not: '' },
            },
            select: {
                id: true,
                images: true,
            },
            take: 100,
        });

        const productImages = products.map(p => ({
            productId: p.id,
            imageUrl: p.images?.split(',')[0] || '',
        }));

        return NextResponse.json({
            success: true,
            products: productImages,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
