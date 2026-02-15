import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/server-auth';
import { revalidatePath } from 'next/cache';

// PATCH /api/admin/categories/reorder - Update multiple categories order
export async function PATCH(request: NextRequest) {
    try {
        await requireAdminApi();
        const { updates } = await request.json();

        // updates: [{ id: string, order: number }]
        if (!Array.isArray(updates)) {
            return NextResponse.json(
                { error: 'Invalid updates format' },
                { status: 400 }
            );
        }

        // Update all categories in a transaction
        await prisma.$transaction(
            updates.map((update: { id: string; order: number }) =>
                prisma.category.update({
                    where: { id: update.id },
                    data: { order: update.order }
                })
            )
        );

        // Revalidate caches
        revalidatePath('/');
        revalidatePath('/api/categories');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering categories:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la réorganisation' },
            { status: 500 }
        );
    }
}
