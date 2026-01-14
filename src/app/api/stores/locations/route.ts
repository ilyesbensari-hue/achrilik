import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET() {
    try {
        const stores = await prisma.store.findMany({
            where: {
                AND: [
                    { latitude: { not: null } },
                    { longitude: { not: null } }
                ]
            },
            select: {
                id: true,
                name: true,
                city: true,
                address: true,
                latitude: true,
                longitude: true,
                clickCollect: true,
                _count: {
                    select: {
                        products: true
                    }
                }
            }
        });

        return NextResponse.json(stores);
    } catch (error) {
        console.error('Failed to fetch store locations:', error);
        return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
    }
}
