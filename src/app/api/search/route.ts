import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Fuse from 'fuse.js';

// GET /api/search?q=xxx - Recherche intelligente avec fuzzy matching
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        if (!query) {
            return NextResponse.json({
                products: [],
                stores: [],
                message: 'Aucune requête fournie'
            });
        }

        // Fetch all published products and active stores in parallel
        const [products, stores] = await Promise.all([
            prisma.product.findMany({
                where: {
                    status: 'APPROVED'
                },
                include: {
                    Store: {
                        select: {
                            name: true
                        }
                    },
                    Category: {
                        select: {
                            name: true
                        }
                    }
                },
                take: 100 // Limit for performance
            }),
            prisma.store.findMany({
                where: {
                    verified: true
                },
                take: 50
            })
        ]);

        // ✨ FUZZY SEARCH CONFIGURATION
        const productFuseOptions = {
            keys: [
                { name: 'title', weight: 0.7 }, // Titre principal
                { name: 'description', weight: 0.2 }, // Description
                { name: 'Store.name', weight: 0.1 }, // Nom boutique
                { name: 'Category.name', weight: 0.1 }, // Catégorie
                { name: 'brand', weight: 0.1 } // Marque
            ],
            threshold: 0.4, // Plus bas = plus strict (0 = exact, 1 = match tout)
            distance: 100, // Distance de recherche
            minMatchCharLength: 2, // Minimum 2 caractères matching
            useExtendedSearch: true
        };

        const storeFuseOptions = {
            keys: [
                { name: 'name', weight: 0.8 },
                { name: 'description', weight: 0.2 }
            ],
            threshold: 0.3,
            distance: 100,
            minMatchCharLength: 2
        };

        // Initialize Fuse instances
        const productFuse = new Fuse(products, productFuseOptions);
        const storeFuse = new Fuse(stores, storeFuseOptions);

        // Perform fuzzy search
        const productResults = productFuse.search(query);
        const storeResults = storeFuse.search(query);

        // Extract items from Fuse results
        const matchedProducts = productResults.map(result => result.item);
        const matchedStores = storeResults.map(result => result.item);

        return NextResponse.json({
            products: matchedProducts,
            stores: matchedStores,
            query,
            stats: {
                productsFound: matchedProducts.length,
                storesFound: matchedStores.length
            }
        });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({
            error: 'Erreur lors de la recherche',
            products: [],
            stores: []
        }, { status: 500 });
    }
}
