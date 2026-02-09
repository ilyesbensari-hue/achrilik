import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

// Matrice des transitions autorisées
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['PAYMENT_PENDING', 'CONFIRMED', 'CANCELLED'],
    PAYMENT_PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['AT_MERCHANT', 'CANCELLED'],
    AT_MERCHANT: ['READY_FOR_PICKUP', 'CANCELLED'],
    READY_FOR_PICKUP: ['WITH_DELIVERY_AGENT', 'CANCELLED'],
    WITH_DELIVERY_AGENT: ['OUT_FOR_DELIVERY', 'RETURNED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
    DELIVERED: [], // État final
    RETURNED: [], // État final
    CANCELLED: [], // État final
};

// Permissions par rôle pour chaque transition
const ROLE_PERMISSIONS: Record<string, OrderStatus[]> = {
    // Client peut confirmer ou annuler
    customer: ['CONFIRMED', 'CANCELLED'],
    // Vendeur peut gérer jusqu'au pickup
    seller: ['CONFIRMED', 'AT_MERCHANT', 'READY_FOR_PICKUP', 'CANCELLED'],
    // Livreur gère la livraison
    delivery: ['WITH_DELIVERY_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED'],
    // Admin peut tout faire
    admin: Object.values(OrderStatus).filter(s => s !== 'PENDING' && s !== 'PAYMENT_PENDING'),
};

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const { newStatus, notes } = await req.json();
        const orderId = params.id;

        // Récupérer la commande
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                Store: true,
                User: true,
            },
        });

        if (!order) {
            return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
        }

        // Vérifier permissions
        const userRole = session.user.role?.toLowerCase() || 'customer';
        const isOwner = order.userId === session.user.id;
        const isStoreOwner = order.Store?.ownerId === session.user.id;

        // Déterminer le rôle effectif
        let effectiveRole = userRole;
        if (isStoreOwner) effectiveRole = 'seller';
        if (userRole === 'delivery_agent') effectiveRole = 'delivery';

        const allowedStatuses = ROLE_PERMISSIONS[effectiveRole] || [];

        if (!allowedStatuses.includes(newStatus)) {
            return NextResponse.json(
                { error: `Vous n'avez pas la permission de définir le statut ${newStatus}` },
                { status: 403 }
            );
        }

        // Vérifier si la transition est autorisée
        const currentStatus = order.status;
        const allowedTransitions = ALLOWED_TRANSITIONS[currentStatus] || [];

        if (!allowedTransitions.includes(newStatus)) {
            return NextResponse.json(
                {
                    error: `Transition invalide: impossible de passer de ${currentStatus} à ${newStatus}`,
                    allowedTransitions,
                },
                { status: 400 }
            );
        }

        // Récupérer l'historique existant
        const existingHistory = (order.statusHistory as any[]) || [];

        // Ajouter la nouvelle transition à l'historique
        const newHistoryEntry = {
            from: currentStatus,
            to: newStatus,
            at: new Date().toISOString(),
            by: session.user.id,
            byRole: effectiveRole,
            note: notes || null,
        };

        // Mettre à jour la commande
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: newStatus,
                statusHistory: [...existingHistory, newHistoryEntry],
                lastUpdatedAt: new Date(),
                lastUpdatedBy: session.user.id,
                // Ajouter notes selon le rôle
                ...(effectiveRole === 'seller' && notes ? { merchantNotes: notes } : {}),
                ...(effectiveRole === 'delivery' && notes ? { deliveryNotes: notes } : {}),
            },
            include: {
                Store: true,
                User: true,
                OrderItem: {
                    include: {
                        Variant: {
                            include: {
                                Product: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            order: updatedOrder,
            transition: newHistoryEntry,
        });
    } catch (error) {
        console.error('Erreur transition statut:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la transition du statut' },
            { status: 500 }
        );
    }
}
