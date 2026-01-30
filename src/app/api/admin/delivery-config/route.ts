import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';

/**
 * GET /api/admin/delivery-config
 * Get global delivery configuration (wilaya -> agent mapping)
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

        // Get all system settings for delivery configuration
        const configs = await prisma.systemSettings.findMany({
            where: {
                key: {
                    startsWith: 'delivery_agent_'
                }
            }
        });

        // Parse configs into wilaya -> agent mapping
        const wilayaAgents: Record<string, string> = {};
        configs.forEach(config => {
            const wilaya = config.key.replace('delivery_agent_', '');
            wilayaAgents[wilaya] = config.value;
        });

        return NextResponse.json({ wilayaAgents });

    } catch (error) {
        console.error('Error fetching delivery config:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * POST /api/admin/delivery-config
 * Set default delivery agent for a wilaya
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
        const { wilaya, deliveryAgentId } = body;

        if (!wilaya) {
            return NextResponse.json({ error: 'Wilaya requise' }, { status: 400 });
        }

        // If deliveryAgentId is provided, verify it exists and is active
        if (deliveryAgentId) {
            const agent = await prisma.deliveryAgent.findUnique({
                where: { id: deliveryAgentId }
            });

            if (!agent) {
                return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 });
            }

            if (!agent.isActive) {
                return NextResponse.json({ error: 'Ce prestataire est inactif' }, { status: 400 });
            }

            // Check if agent covers this wilaya
            if (!agent.wilayasCovered.includes(wilaya)) {
                return NextResponse.json({
                    error: `Ce prestataire ne couvre pas ${wilaya}`
                }, { status: 400 });
            }
        }

        const key = `delivery_agent_${wilaya}`;

        if (deliveryAgentId) {
            // Set or update the configuration
            await prisma.systemSettings.upsert({
                where: { key },
                update: {
                    value: deliveryAgentId,
                    updatedAt: new Date()
                },
                create: {
                    id: randomBytes(12).toString('hex'),
                    key,
                    value: deliveryAgentId,
                    description: `Prestataire par défaut pour ${wilaya}`,
                    category: 'DELIVERY',
                    updatedAt: new Date()
                }
            });
        } else {
            // Remove the configuration
            await prisma.systemSettings.deleteMany({
                where: { key }
            });
        }

        return NextResponse.json({
            success: true,
            message: deliveryAgentId
                ? `Prestataire défini pour ${wilaya}`
                : `Configuration supprimée pour ${wilaya}`
        });

    } catch (error) {
        console.error('Error setting delivery config:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
