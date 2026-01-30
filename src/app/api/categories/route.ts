import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch all categories flat
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                parentId: true,
            },
            orderBy: {
                name: 'asc',
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

        const tree = buildTree(null);

        return NextResponse.json(tree);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

