import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';

/**
 * GET /api/admin/delivery-agents/[id]
 * Get delivery agent details with full stats
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Verify admin
        const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];
        if (!token) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !(payload.roles as string[])?.includes('ADMIN')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const agent = await prisma.deliveryAgent.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        roles: true,
                        createdAt: true
                    }
                },
                deliveries: {
                    include: {
                        order: {
                            select: {
                                id: true,
                                total: true,
                                shippingAddress: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!agent) {
            return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 });
        }

        // Calculate detailed stats
        const total = agent.deliveries.length;
        const delivered = agent.deliveries.filter(d => d.status === 'DELIVERED').length;
        const failed = agent.deliveries.filter(d => d.status === 'FAILED').length;
        const inProgress = agent.deliveries.filter(d =>
            ['ASSIGNED', 'ACCEPTED', 'IN_TRANSIT'].includes(d.status)
        ).length;

        const totalCOD = agent.deliveries
            .filter(d => d.status === 'DELIVERED' && d.codCollected)
            .reduce((sum, d) => sum + (d.codAmount || 0), 0);

        const pendingCOD = agent.deliveries
            .filter(d => d.status === 'DELIVERED' && !d.codCollected && d.codAmount != null && d.codAmount > 0)
            .reduce((sum, d) => sum + (d.codAmount || 0), 0);

        return NextResponse.json({
            agent: {
                id: agent.id,
                userId: agent.userId,
                name: agent.user.name,
                email: agent.user.email,
                phone: agent.user.phone,
                provider: agent.provider,
                wilayasCovered: agent.wilayasCovered,
                vehicleType: agent.vehicleType,
                licenseNumber: agent.licenseNumber,
                isActive: agent.isActive,
                isVerified: agent.isVerified,
                createdAt: agent.createdAt,
                stats: {
                    total,
                    delivered,
                    failed,
                    inProgress,
                    totalCOD,
                    pendingCOD,
                    successRate: total > 0 ? Math.round((delivered / total) * 100) : 0
                },
                deliveries: agent.deliveries
            }
        });

    } catch (error) {
        console.error('Error fetching delivery agent:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/delivery-agents/[id]
 * Update delivery agent
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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
        const { isActive, wilayasCovered, vehicleType, licenseNumber, provider } = body;

        const updateData: any = {};
        if (isActive !== undefined) updateData.isActive = isActive;
        if (wilayasCovered) updateData.wilayasCovered = wilayasCovered;
        if (vehicleType) updateData.vehicleType = vehicleType;
        if (licenseNumber) updateData.licenseNumber = licenseNumber;
        if (provider) updateData.provider = provider;

        const agent = await prisma.deliveryAgent.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            agent: {
                id: agent.id,
                name: agent.user.name,
                email: agent.user.email,
                provider: agent.provider,
                wilayasCovered: agent.wilayasCovered,
                vehicleType: agent.vehicleType,
                isActive: agent.isActive
            }
        });

    } catch (error) {
        console.error('Error updating delivery agent:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/delivery-agents/[id]
 * Deactivate delivery agent
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Verify admin
        const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];
        if (!token) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !(payload.roles as string[])?.includes('ADMIN')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        // Check for active deliveries
        const activeDeliveries = await prisma.delivery.count({
            where: {
                agentId: id,
                status: {
                    in: ['ACCEPTED', 'READY_TO_SHIP', 'PICKED_UP', 'IN_TRANSIT']
                }
            }
        });

        if (activeDeliveries > 0) {
            return NextResponse.json({
                error: `Impossible de désactiver. ${activeDeliveries} livraison(s) en cours.`
            }, { status: 400 });
        }

        // Deactivate instead of delete
        await prisma.deliveryAgent.update({
            where: { id },
            data: { isActive: false }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deactivating delivery agent:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
