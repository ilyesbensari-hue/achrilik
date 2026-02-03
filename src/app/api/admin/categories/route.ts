import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/server-auth';

// GET /api/admin/categories
export async function GET(request: NextRequest) {
    try {
        await requireAdminApi();
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                },
                children: true // Subcategories
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

// POST /api/admin/categories
export async function POST(request: NextRequest) {
    try {
        await requireAdminApi();
        const body = await request.json();
        const { name, slug, parentId } = body;

        if (!name || !slug) {
            return NextResponse.json(
                { error: 'Name and slug are required' },
                { status: 400 }
            );
        }

        const category = await prisma.category.create({
            data: {
                id: crypto.randomUUID(), // Ensure ID is generated
                name,
                slug,
                parentId: parentId || null
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}
