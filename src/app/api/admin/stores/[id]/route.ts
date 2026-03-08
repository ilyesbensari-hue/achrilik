import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/server-auth';

/**
 * DELETE /api/admin/stores/[id]
 * Force-deletes a store and cascades cleanup:
 * - Deletes all products belonging to the store
 * - Removes the SELLER role from the owner's roles array
 * - Resets the owner's primary role to BUYER if it was SELLER
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();

        const { id: storeId } = await params;

        // Fetch store with owner and products using correct Prisma relation names
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: {
                User: {
                    select: { id: true, email: true, role: true, roles: true }
                },
                Product: { select: { id: true } }
            }
        });

        if (!store) {
            return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });
        }

        const owner = store.User;
        const productCount = store.Product.length;

        // 1. Delete all products of this store first (avoids FK constraint)
        if (productCount > 0) {
            await prisma.product.deleteMany({ where: { storeId } });
        }

        // 2. Delete the store
        await prisma.store.delete({ where: { id: storeId } });

        // 3. Clean up the owner's SELLER role from the roles array
        const currentRoles: string[] = Array.isArray(owner.roles)
            ? (owner.roles as string[])
            : [owner.role as string];

        const newRoles = currentRoles.filter(r => r !== 'SELLER');

        // If they have no roles left, default to BUYER
        if (newRoles.length === 0) {
            newRoles.push('BUYER');
        }

        const newPrimaryRole = newRoles[0];

        await prisma.user.update({
            where: { id: owner.id },
            data: {
                role: newPrimaryRole as any,
                roles: { set: newRoles.map(r => r as any) }
            }
        });

        return NextResponse.json({
            success: true,
            message: `Boutique "${store.name}" supprimée. ${productCount} produit(s) supprimé(s). Rôle SELLER retiré de ${owner.email}.`
        });

    } catch (error: any) {
        console.error('DELETE /api/admin/stores/[id] error:', error);
        return NextResponse.json(
            { error: error?.message || 'Erreur lors de la suppression' },
            { status: 500 }
        );
    }
}
