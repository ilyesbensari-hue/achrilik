import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/users/[id] - Modifier un utilisateur
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { role } = body;

        // Valider le rôle
        if (role && !['BUYER', 'SELLER', 'ADMIN', 'DELIVERY_AGENT'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // IMPORTANT: Mettre à jour à la fois 'role' (legacy) ET 'roles' (array actif)
        // pour que hasRole() fonctionne correctement
        const user = await prisma.user.update({
            where: { id },
            data: {
                role,  // Legacy string field
                roles: role ? [role as any] : undefined  // Active array field
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                roles: true
            }
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

// DELETE /api/admin/users/[id] - Supprimer un utilisateur avec suppression en cascade
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Utiliser une transaction pour tout supprimer proprement
        await prisma.$transaction(async (tx) => {
            // 1. Supprimer les OrderItems des commandes de l'utilisateur
            // D'abord trouver les commandes de l'utilisateur
            const userOrders = await tx.order.findMany({
                where: { userId: id },
                select: { id: true }
            });
            const orderIds = userOrders.map(o => o.id);

            if (orderIds.length > 0) {
                await tx.orderItem.deleteMany({
                    where: { orderId: { in: orderIds } }
                });
            }

            // 2. Supprimer les Commandes
            await tx.order.deleteMany({
                where: { userId: id }
            });

            // 3. Supprimer les Reviews
            await tx.review.deleteMany({
                where: { userId: id }
            });

            // 4. Supprimer les Wishlists
            await tx.wishlist.deleteMany({
                where: { userId: id }
            });

            // 5. Supprimer les PasswordResetTokens
            await tx.passwordResetToken.deleteMany({
                where: { userId: id }
            });

            // 6. Gestion de la boutique (si vendeur)
            const userStore = await tx.store.findUnique({
                where: { ownerId: id }
            });

            if (userStore) {
                // Supprimer les produits de la boutique
                // D'abord supprimer les variants, reviews des produits, etc. si nécessaire
                // Pour simplifier ici, on suppose que le cascading côté DB ou le nettoyage basique suffit
                // Mais idéalement il faudrait tout nettoyer.
                // On va supprimer les produits liés au store
                await tx.product.deleteMany({
                    where: { storeId: userStore.id }
                });

                // Supprimer la boutique
                await tx.store.delete({
                    where: { id: userStore.id }
                });
            }

            // 7. Enfin, supprimer l'utilisateur
            await tx.user.delete({
                where: { id }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
