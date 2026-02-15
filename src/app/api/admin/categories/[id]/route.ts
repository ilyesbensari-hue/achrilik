import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';

// Helper to check circular hierarchy
async function checkCircularHierarchy(categoryId: string, newParentId: string): Promise<boolean> {
    let currentId: string | null = newParentId;

    while (currentId) {
        if (currentId === categoryId) return true;

        const parent: { parentId: string | null } | null = await prisma.category.findUnique({
            where: { id: currentId },
            select: { parentId: true }
        });

        currentId = parent?.parentId || null;
    }

    return false;
}

// PUT /api/admin/categories/[id] - Update category
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdminApi();
        const { id } = await params;
        const body = await request.json();

        const {
            name,
            slug,
            description,
            parentId,
            image,
            icon,
            order,
            isActive,
            isFeatured,
            metaTitle,
            metaDescription,
            keywords
        } = body;

        // Check slug uniqueness (exclude current category)
        if (slug) {
            const existing = await prisma.category.findFirst({
                where: {
                    slug,
                    NOT: { id }
                }
            });

            if (existing) {
                return NextResponse.json(
                    { error: 'Ce slug existe déjà' },
                    { status: 400 }
                );
            }
        }

        // Prevent circular hierarchy
        if (parentId) {
            const isCircular = await checkCircularHierarchy(id, parentId);
            if (isCircular) {
                return NextResponse.json(
                    { error: 'Hiérarchie circulaire détectée - une catégorie ne peut pas être parent d\'elle-même' },
                    { status: 400 }
                );
            }
        }

        const updated = await prisma.category.update({
            where: { id },
            data: {
                name,
                slug,
                description,
                parentId: parentId || null,
                image,
                icon,
                order: order ?? 0,
                isActive: isActive ?? true,
                isFeatured: isFeatured ?? false,
                metaTitle,
                metaDescription,
                keywords: keywords || [],
            },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        // Revalidate caches
        revalidatePath('/');
        revalidatePath('/categories/[slug]', 'page');
        revalidatePath('/api/categories');

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/categories/[id] - Enhanced with options
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdminApi();
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action'); // 'move' | 'uncategorize' | 'cascade'
        const targetCategoryId = searchParams.get('targetCategoryId');

        // Check if category has products
        const productCount = await prisma.product.count({
            where: { categoryId: id }
        });

        // Check if category has subcategories
        const subCount = await prisma.category.count({
            where: { parentId: id }
        });

        // Handle products
        if (productCount > 0) {
            if (action === 'move' && targetCategoryId) {
                // Move products to target category
                await prisma.product.updateMany({
                    where: { categoryId: id },
                    data: { categoryId: targetCategoryId }
                });
            } else if (action === 'uncategorize') {
                // Remove category from products
                await prisma.product.updateMany({
                    where: { categoryId: id },
                    data: { categoryId: null }
                });
            } else {
                // Return info for user decision
                return NextResponse.json({
                    needsAction: true,
                    productCount,
                    subCount,
                    message: `Cette catégorie contient ${productCount} produit(s) et ${subCount} sous-catégorie(s)`
                }, { status: 409 });
            }
        }

        // Handle subcategories
        if (subCount > 0) {
            if (action === 'cascade') {
                // Delete subcategories recursively
                await prisma.category.deleteMany({
                    where: { parentId: id }
                });
            } else if (!action && productCount === 0) {
                // Only block if no action specified
                return NextResponse.json({
                    needsAction: true,
                    productCount,
                    subCount,
                    message: `Cette catégorie contient ${subCount} sous-catégorie(s)`
                }, { status: 409 });
            }
        }

        // Delete the category
        await prisma.category.delete({
            where: { id }
        });

        // Revalidate caches
        revalidatePath('/');
        revalidatePath('/categories/[slug]', 'page');
        revalidatePath('/api/categories');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la suppression' },
            { status: 500 }
        );
    }
}
