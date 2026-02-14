import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// GET: Récupérer taux commission actuel
export async function GET(request: NextRequest) {
    try {
        // Vérifier si user est admin (à implémenter selon votre auth)
        // const session = await getServerSession();
        // if (session?.user?.role !== 'ADMIN') {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        // }

        // Récupérer ou créer settings si n'existe pas
        let settings = await prisma.platformSettings.findFirst({
            orderBy: { updatedAt: 'desc' }
        });

        if (!settings) {
            // Créer entry initiale avec 0%
            settings = await prisma.platformSettings.create({
                data: {
                    commissionRate: 0,
                    previousRate: null
                }
            });
        }

        return NextResponse.json({
            success: true,
            settings: {
                id: settings.id,
                commissionRate: settings.commissionRate,
                updatedAt: settings.updatedAt,
                updatedBy: settings.updatedBy,
                previousRate: settings.previousRate
            }
        });
    } catch (error) {
        console.error('Error fetching commission settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch commission settings' },
            { status: 500 }
        );
    }
}

// POST: Mettre à jour taux commission
export async function POST(request: NextRequest) {
    try {
        // Vérifier si user est admin
        // const session = await getServerSession();
        // if (session?.user?.role !== 'ADMIN') {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        // }

        const body = await request.json();
        const { commissionRate, userId } = body;

        // Validation
        if (typeof commissionRate !== 'number' || commissionRate < 0 || commissionRate > 100) {
            return NextResponse.json(
                { error: 'Commission rate must be between 0 and 100' },
                { status: 400 }
            );
        }

        // Récupérer settings actuels
        const currentSettings = await prisma.platformSettings.findFirst({
            orderBy: { updatedAt: 'desc' }
        });

        // Créer nouveau record avec ancien taux sauvegardé
        const updatedSettings = await prisma.platformSettings.create({
            data: {
                commissionRate,
                previousRate: currentSettings?.commissionRate || null,
                updatedBy: userId || null
            }
        });

        return NextResponse.json({
            success: true,
            message: `Commission rate updated from ${currentSettings?.commissionRate || 0}% to ${commissionRate}%`,
            settings: updatedSettings
        });
    } catch (error) {
        console.error('Error updating commission settings:', error);
        return NextResponse.json(
            { error: 'Failed to update commission settings' },
            { status: 500 }
        );
    }
}
