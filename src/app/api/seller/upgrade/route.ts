import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { signToken, verifyToken } from '@/lib/auth-token';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const sessionToken = request.cookies.get('auth_token')?.value;
        const user = sessionToken ? await verifyToken(sessionToken) : null;

        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await request.json();
        const { storeName, storeDescription, city, phone, address, postalCode, latitude, longitude, hasPhysicalStore } = body;
        const userId = user.id as string; // Use ID from token, not body

        // ... validation logic omitted ...

        // Prepare new roles
        const currentRoles = (user.roles as Role[]) || [user.role as Role];
        const newRoles = Array.from(new Set([...currentRoles, Role.SELLER]));

        // Update user role to SELLER (primary) and roles array, and create Store
        const [updatedUser, newStore] = await Promise.all([
            prisma.user.update({
                where: { id: userId },
                data: {
                    role: Role.SELLER,
                    roles: newRoles
                }
            }),
            prisma.store.create({
                data: {
                    id: randomBytes(16).toString('hex'),
                    name: storeName,
                    description: storeDescription,
                    city,
                    phone,
                    address,
                    latitude: latitude ? parseFloat(latitude) : null,
                    longitude: longitude ? parseFloat(longitude) : null,
                    clickCollect: hasPhysicalStore !== false, // Default true if physical store
                    ownerId: userId,
                    verified: false // Explicitly set verified to false initially
                }
            })
        ]);

        // Generate NEW token with SELLER role
        // IMPORTANT: Must include activeRole and roles to match login logic
        const token = await signToken({
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
            roles: newRoles,
            activeRole: 'SELLER' // Explicitly set active role to SELLER
        });

        // Update cookie to reflect new role
        const isProduction = process.env.NODE_ENV === 'production';
        const domain = isProduction && !process.env.NEXT_PUBLIC_URL?.includes('localhost') ? '.achrilik.com' : undefined;

        const cookieHeader = [
            `auth_token=${token}`,
            'HttpOnly',
            isProduction ? 'Secure' : '',
            'SameSite=Lax',
            'Path=/',
            domain ? `Domain=${domain}` : '',
            `Max-Age=${60 * 60 * 24 * 7}` // 7 days
        ].filter(Boolean).join('; ');

        const response = NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                roles: newRoles,
                activeRole: 'SELLER'
            },
            store: {
                id: newStore.id,
                name: newStore.name,
                city: newStore.city
            }
        });

        // Set the updated cookie
        response.headers.set('Set-Cookie', cookieHeader);

        return response;

    } catch (error) {
        console.error('Seller upgrade error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création de la boutique' },
            { status: 500 }
        );
    }
}
