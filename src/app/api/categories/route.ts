import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch all categories flat
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { Product: true },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        // Build Tree
        const categoryMap = new Map();
        const roots: any[] = [];

        // 1. Initialize map
        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        // 2. Link children to parents
        categories.forEach(originalCat => {
            const cat = categoryMap.get(originalCat.id);
            if (originalCat.parentId) {
                const parent = categoryMap.get(originalCat.parentId);
                if (parent) {
                    parent.children.push(cat);
                } else {
                    // Parent not found (orphan), treat as root? Or ignore?
                    // Let's treat as root to be safe
                    roots.push(cat);
                }
            } else {
                roots.push(cat);
            }
        });

        return NextResponse.json(roots);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
