import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, storeName, storeDescription, city, phone, address, postalCode, latitude, longitude, hasPhysicalStore } = body;

        // Validate required fields
        if (!userId || !storeName || !storeDescription || !city || !phone || !address) {
            return NextResponse.json(
                { error: 'Tous les champs obligatoires doivent être remplis' },
                { status: 400 }
            );
        }

        // Verify user exists and is a BUYER
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur introuvable' },
                { status: 404 }
            );
        }

        if (user.role !== 'BUYER') {
            return NextResponse.json(
                { error: 'Seuls les clients peuvent devenir vendeurs' },
                { status: 400 }
            );
        }

        // Check if store name already exists
        const existingStore = await prisma.store.findFirst({
            where: { name: storeName }
        });

        if (existingStore) {
            return NextResponse.json(
                { error: 'Ce nom de boutique est déjà utilisé' },
                { status: 400 }
            );
        }

        // Update user role to SELLER and create Store
        const [updatedUser, newStore] = await Promise.all([
            prisma.user.update({
                where: { id: userId },
                data: { role: 'SELLER' }
            }),
            prisma.store.create({
                data: {
                    name: storeName,
                    description: storeDescription,
                    city,
                    phone,
                    address,
                    latitude: latitude ? parseFloat(latitude) : null,
                    longitude: longitude ? parseFloat(longitude) : null,
                    clickCollect: hasPhysicalStore !== false, // Default true if physical store
                    ownerId: userId
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role
            },
            store: {
                id: newStore.id,
                name: newStore.name,
                city: newStore.city
            }
        });

    } catch (error) {
        console.error('Seller upgrade error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création de la boutique' },
            { status: 500 }
        );
    }
}
