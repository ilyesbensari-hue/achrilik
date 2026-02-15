import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Auth check
        const headersList = headers();
        const cookie = headersList.get('cookie') || '';

        if (!cookie.includes('session')) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Fetch all deliveries with agent info
        const deliveries = await prisma.delivery.findMany({
            where: {
                agentId: { not: null }
            },
            include: {
                agent: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                order: {
                    select: {
                        total: true
                    }
                }
            }
        });

        // Global stats
        const globalStats = {
            totalCODCollected: 0,
            totalCODTransferred: 0,
            totalAgentFeesDue: 0,
            totalAgentFeesPaid: 0,
            deliveryCount: deliveries.length
        };

        // Group by agent
        const agentMap = new Map();

        deliveries.forEach(delivery => {
            const codAmount = delivery.codAmount || 0;
            const deliveryFee = delivery.deliveryFee || 0;

            // Update global stats
            if (delivery.codCollected) {
                globalStats.totalCODCollected += codAmount;
            }
            if (delivery.codTransferred) {
                globalStats.totalCODTransferred += codAmount;
            }
            if (deliveryFee > 0) {
                globalStats.totalAgentFeesDue += deliveryFee;
            }
            if (delivery.agentPaid) {
                globalStats.totalAgentFeesPaid += deliveryFee;
            }

            // Update agent stats
            if (!delivery.agentId) return;

            if (!agentMap.has(delivery.agentId)) {
                agentMap.set(delivery.agentId, {
                    agentId: delivery.agentId,
                    agentName: delivery.agent?.user?.name || 'Non défini',
                    deliveryCount: 0,
                    codCollected: 0,
                    codTransferred: 0,
                    deliveryFeesDue: 0,
                    deliveryFeesPaid: 0,
                    pendingCOD: 0,
                    pendingFees: 0
                });
            }

            const agentData = agentMap.get(delivery.agentId);
            agentData.deliveryCount++;

            if (delivery.codCollected) {
                agentData.codCollected += codAmount;
                if (!delivery.codTransferred) {
                    agentData.pendingCOD += codAmount;
                }
            }
            if (delivery.codTransferred) {
                agentData.codTransferred += codAmount;
            }
            if (deliveryFee > 0) {
                agentData.deliveryFeesDue += deliveryFee;
                if (!delivery.agentPaid) {
                    agentData.pendingFees += deliveryFee;
                }
            }
            if (delivery.agentPaid) {
                agentData.deliveryFeesPaid += deliveryFee;
            }
        });

        const byAgent = Array.from(agentMap.values());

        return NextResponse.json({
            success: true,
            globalStats,
            byAgent
        });

    } catch (error) {
        console.error('Error fetching delivery payments summary:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
