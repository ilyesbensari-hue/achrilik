import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withCache } from '@/lib/cache';

export async function GET() {
    try {
        // Cache the category tree for 5 minutes (300s)
        // Categories don't change frequently, so longer cache is acceptable
        const tree = await withCache(
            'categories:tree',
            async () => {
                // Fetch all categories flat
                const categories = await prisma.category.findMany({
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        parentId: true,
                        order: true,
                    },
                    where: {
                        isActive: true, // Only show active categories
                    },
                    orderBy: {
                        order: 'asc', // Sort by order field
                    },
                });

                // Build hierarchical structure
                const buildTree = (parentId: string | null = null): any[] => {
                    return categories
                        .filter(cat => cat.parentId === parentId)
                        .map(cat => ({
                            ...cat,
                            children: buildTree(cat.id)
                        }));
                };

                return buildTree(null);
            },
            300 // 5 minutes cache
        );

        return NextResponse.json(tree);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

