import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city');
        const clickCollect = searchParams.get('clickCollect');
        const search = searchParams.get('search');

        const whereClause: any = {};
        if (city) whereClause.city = city;
        if (clickCollect === 'true') whereClause.clickCollect = true;

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const stores = await prisma.store.findMany({
            where: whereClause,
            include: {
                Product: true,
            },
        });
        return NextResponse.json(stores);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, ownerId, latitude, longitude, address, city, clickCollect } = body;

        const store = await prisma.$transaction(async (tx) => {
            const newStore = await tx.store.create({
                data: {
                    id: randomBytes(16).toString('hex'),
                    name,
                    description,
                    ownerId,
                    latitude: latitude ? parseFloat(latitude) : null,
                    longitude: longitude ? parseFloat(longitude) : null,
                    address,
                    city,
                    clickCollect: clickCollect !== undefined ? clickCollect : true,
                },
            });

            await tx.user.update({
                where: { id: ownerId },
                data: { role: 'SELLER' },
            });

            return newStore;
        });

        return NextResponse.json(store);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create store', details: error }, { status: 500 });
    }
}
