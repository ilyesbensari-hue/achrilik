import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';

/**
 * PATCH /api/admin/stores/[id]/default-agent
 * Assign default delivery agent to a store
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: storeId } = await params;
        // Verify admin
        const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];
        if (!token) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !(payload.roles as string[])?.includes('ADMIN')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const body = await request.json();
        const { defaultDeliveryAgentId } = body;

        // Verify store exists
        const store = await prisma.store.findUnique({
            where: { id: storeId }
        });

        if (!store) {
            return NextResponse.json({ error: 'Magasin introuvable' }, { status: 404 });
        }

        // If deliveryAgentId is provided, verify it exists and is active
        if (defaultDeliveryAgentId) {
            const agent = await prisma.deliveryAgent.findUnique({
                where: { id: defaultDeliveryAgentId }
            });

            if (!agent) {
                return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 });
            }

            if (!agent.isActive) {
                return NextResponse.json({ error: 'Ce prestataire est inactif' }, { status: 400 });
            }
        }

        // Update store with default delivery agent
        const updatedStore = await prisma.store.update({
            where: { id: storeId },
            data: {
                defaultDeliveryAgentId: defaultDeliveryAgentId || null
            },
            include: {
                defaultDeliveryAgent: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            store: {
                id: updatedStore.id,
                name: updatedStore.name,
                defaultDeliveryAgent: updatedStore.defaultDeliveryAgent ? {
                    id: updatedStore.defaultDeliveryAgent.id,
                    name: updatedStore.defaultDeliveryAgent.user.name,
                    provider: updatedStore.defaultDeliveryAgent.provider,
                    wilayasCovered: updatedStore.defaultDeliveryAgent.wilayasCovered
                } : null
            }
        });

    } catch (error) {
        console.error('Error assigning default delivery agent:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
