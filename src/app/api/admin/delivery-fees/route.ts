import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-token';

// GET: Fetch all delivery fee configurations
export async function GET(request: NextRequest) {
    try {
        const fees = await prisma.deliveryFeeConfig.findMany({
            where: { isActive: true },
            orderBy: [
                { fromCity: 'asc' },
                { toWilaya: 'asc' }
            ]
        });

        return NextResponse.json(fees);
    } catch (error) {
        console.error('Failed to fetch delivery fees:', error);
        return NextResponse.json({ error: 'Failed to fetch delivery fees' }, { status: 500 });
    }
}

// POST: Create delivery fee configuration (Admin only)
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé - Admin seulement' }, { status: 403 });
        }

        const { fromCity, toWilaya, baseFee } = await request.json();

        if (!fromCity || !toWilaya || baseFee === undefined) {
            return NextResponse.json({
                error: 'Champs requis: fromCity, toWilaya, baseFee'
            }, { status: 400 });
        }

        const fee = await prisma.deliveryFeeConfig.create({
            data: {
                fromCity,
                toWilaya,
                baseFee: parseInt(baseFee),
                isActive: true
            }
        });

        return NextResponse.json(fee, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create delivery fee:', error);

        if (error.code === 'P2002') {
            return NextResponse.json({
                error: 'Cette configuration existe déjà'
            }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to create delivery fee' }, { status: 500 });
    }
}

// PUT: Update delivery fee configuration (Admin only)
export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé - Admin seulement' }, { status: 403 });
        }

        const { id, baseFee, isActive } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID requis' }, { status: 400 });
        }

        const updateData: any = {};
        if (baseFee !== undefined) updateData.baseFee = parseInt(baseFee);
        if (isActive !== undefined) updateData.isActive = isActive;

        const fee = await prisma.deliveryFeeConfig.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(fee);
    } catch (error) {
        console.error('Failed to update delivery fee:', error);
        return NextResponse.json({ error: 'Failed to update delivery fee' }, { status: 500 });
    }
}

// DELETE: Delete delivery fee configuration (Admin only)
export async function DELETE(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé - Admin seulement' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID requis' }, { status: 400 });
        }

        await prisma.deliveryFeeConfig.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Configuration supprimée' });
    } catch (error) {
        console.error('Failed to delete delivery fee:', error);
        return NextResponse.json({ error: 'Failed to delete delivery fee' }, { status: 500 });
    }
}
