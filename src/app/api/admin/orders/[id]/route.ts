import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth-token';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify admin authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        // Check if user is admin
        const admin = await prisma.user.findUnique({
            where: { id: payload.userId as string },
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { id } = await params;

        // Get detailed order information
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        address: true,
                    }
                },
                Store: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        city: true,
                        phone: true,
                        latitude: true,
                        longitude: true,
                    }
                },
                OrderItem: {
                    include: {
                        Variant: {
                            include: {
                                Product: {
                                    select: {
                                        id: true,
                                        title: true,
                                        images: true,
                                        description: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// Update order status, notes, tracking
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify admin authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: payload.userId as string },
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, notes, trackingNumber, estimatedDelivery } = body;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
        if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: updateData,
        });

        // Log admin action
        await prisma.adminLog.create({
            data: {
                id: randomBytes(16).toString('hex'),
                adminId: admin.id,
                action: 'UPDATE_ORDER',
                targetType: 'ORDER',
                targetId: id,
                details: `Updated order ${id}: ${JSON.stringify(updateData)}`,
            },
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// DELETE - Delete an order (admin only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify admin authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: payload.userId as string },
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { id } = await params;

        // Delete order (will cascade delete order items)
        await prisma.order.delete({
            where: { id }
        });

        // Log admin action
        await prisma.adminLog.create({
            data: {
                id: randomBytes(16).toString('hex'),
                adminId: admin.id,
                action: 'DELETE_ORDER',
                targetType: 'ORDER',
                targetId: id,
                details: `Deleted order ${id}`,
            },
        });

        return NextResponse.json({ success: true, message: 'Commande supprimée' });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
