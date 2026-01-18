import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API pour promouvoir un utilisateur en ADMIN
// À utiliser UNE SEULE FOIS pour créer le premier admin
export async function POST(request: Request) {
    try {
        const { email, secret } = await request.json();

        // Secret de sécurité (à changer en production)
        const ADMIN_SECRET = process.env.ADMIN_SECRET || 'achrilik-admin-2024';

        if (secret !== ADMIN_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });

        return NextResponse.json({
            success: true,
            message: `User ${email} is now an ADMIN`,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('Error promoting user to admin:', error);
        return NextResponse.json({ error: 'Failed to promote user' }, { status: 500 });
    }
}
