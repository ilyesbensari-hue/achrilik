import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(request: Request) {
    try {
        const { email, password, userType, isRegister } = await request.json();

        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (isRegister) {
            // Registration mode
            if (user) {
                return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
            }

            user = await prisma.user.create({
                data: {
                    email,
                    password, // In production, hash this password!
                    name: email.split('@')[0],
                    role: userType || 'BUYER'
                },
            });
        } else {
            // Login mode
            if (!user) {
                return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
            }

            // In production, verify password hash here
            if (user.password !== password) {
                return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
            }
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
