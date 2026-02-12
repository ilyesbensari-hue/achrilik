import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';
import bcrypt from 'bcryptjs';
import { generateSecurePassword } from '@/lib/delivery-helpers';
import crypto from 'crypto';

/**
 * GET /api/admin/delivery-agents
 * List all delivery agents with stats
 */
export async function GET(request: Request) {
    try {
        // Verify admin
        const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];
        if (!token) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || !(payload.roles as string[])?.includes('ADMIN')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        // Get query params
        const { searchParams } = new URL(request.url);
        const wilaya = searchParams.get('wilaya');
        const isActive = searchParams.get('isActive');

        // Build where clause
        const where: any = {};
        if (wilaya) where.wilayasCovered = { has: wilaya };
        if (isActive !== null) where.isActive = isActive === 'true';

        // Fetch agents with stats
        const agents = await prisma.deliveryAgent.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        roles: true
                    }
                },
                deliveries: {
                    select: {
                        id: true,
                        status: true,
                        codAmount: true,
                        codCollected: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate stats for each agent
        const agentsWithStats = agents.map(agent => {
            const total = agent.deliveries.length;
            const delivered = agent.deliveries.filter(d => d.status === 'DELIVERED').length;
            const inProgress = agent.deliveries.filter(d =>
                ['ASSIGNED', 'ACCEPTED', 'IN_TRANSIT'].includes(d.status)
            ).length;
            const totalCOD = agent.deliveries
                .filter(d => d.status === 'DELIVERED' && d.codCollected)
                .reduce((sum, d) => sum + (d.codAmount || 0), 0);

            return {
                id: agent.id,
                userId: agent.userId,
                name: agent.user.name,
                email: agent.user.email,
                phone: agent.user.phone,
                provider: agent.provider,
                wilaya: agent.wilayasCovered[0] || 'N/A', // First wilaya for display
                wilayasCovered: agent.wilayasCovered,
                vehicleType: agent.vehicleType,
                licenseNumber: agent.licenseNumber,
                isActive: agent.isActive,
                isAvailable: agent.isActive, // Alias for frontend compatibility
                isVerified: agent.isVerified,
                createdAt: agent.createdAt,
                stats: {
                    total,
                    delivered,
                    inProgress,
                    totalCOD,
                    successRate: total > 0 ? Math.round((delivered / total) * 100) : 0
                }
            };
        });

        return NextResponse.json({ agents: agentsWithStats });

    } catch (error) {
        console.error('Error fetching delivery agents:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * POST /api/admin/delivery-agents
 * Create a new delivery agent
 */
export async function POST(request: Request) {
    try {
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
        const { name, email, phone, wilayasCovered, vehicleType, licenseNumber, provider = 'INDEPENDENT' } = body;

        // Validate required fields
        if (!name || !email || !phone || !wilayasCovered || !Array.isArray(wilayasCovered) || wilayasCovered.length === 0) {
            return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Cet email existe déjà' }, { status: 400 });
        }

        // Generate secure password
        const password = generateSecurePassword(12);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and delivery agent
        const user = await prisma.user.create({
            data: {
                id: crypto.randomBytes(12).toString('hex'),
                email,
                name,
                phone,
                password: hashedPassword,
                role: 'BUYER', // Backward compatibility
                roles: ['DELIVERY_AGENT', 'BUYER'],
                DeliveryAgent: {
                    create: {
                        id: crypto.randomBytes(12).toString('hex'),
                        provider,
                        vehicleType,
                        licenseNumber: licenseNumber || `DZ-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
                        wilayasCovered,
                        isActive: true,
                        isVerified: false
                    }
                }
            },
            include: {
                DeliveryAgent: true
            }
        });

        return NextResponse.json({
            success: true,
            agent: {
                id: user.DeliveryAgent!.id,
                userId: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                provider: user.DeliveryAgent!.provider,
                wilayasCovered: user.DeliveryAgent!.wilayasCovered,
                vehicleType: user.DeliveryAgent!.vehicleType,
                isActive: user.DeliveryAgent!.isActive
            },
            credentials: {
                email: user.email,
                password // Return password only once
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating delivery agent:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
