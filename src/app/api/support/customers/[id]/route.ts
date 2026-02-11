import { NextRequest, NextResponse } from 'next/server';
import { hasRole, hasAnyRole } from "@/lib/role-helpers";
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';
import { prisma } from '@/lib/prisma';

// Get customer orders and deliveries
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.id as string }
        });

        if (!user || !hasRole(user, 'ADMIN')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { id } = await params;

        // Get customer details
        const customer = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                city: true,
                wilaya: true,
                createdAt: true,
                roles: true
            }
        });

        if (!customer) {
            return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
        }

        // Get customer orders with deliveries
        const orders = await prisma.order.findMany({
            where: { userId: id },
            include: {
                OrderItem: {
                    include: {
                        Variant: {
                            include: {
                                Product: {
                                    select: {
                                        title: true,
                                        images: true
                                    }
                                }
                            }
                        }
                    }
                },
                delivery: {
                    select: {
                        id: true,
                        status: true,
                        trackingNumber: true,
                        trackingUrl: true,
                        codAmount: true,
                        codCollected: true,
                        createdAt: true,
                        updatedAt: true,
                        agent: {
                            select: {
                                id: true,
                                user: {
                                    select: {
                                        name: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json({ customer, orders });

    } catch (error) {
        console.error('Error fetching customer orders:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
