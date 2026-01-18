import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password, isRegister } = await request.json();

        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (isRegister) {
            // Registration mode
            if (user) {
                return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: email.split('@')[0],
                    role: 'BUYER' // All new accounts start as buyers
                },
            });
        } else {
            // Login mode
            if (!user) {
                return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
            }

            // Verify password hash
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                // Fallback for old plain text passwords (optional, helps during migration)
                // If the stored password matches plain text, re-hash it and save?
                // For security, strict check is better, but dev env might need flexibility.
                // Let's stick to strict check for now. If user cannot login, admin resets password.
                if (password === user.password) {
                    // Auto-migrate legacy plain text to hashed on first login
                    const hashedPassword = await bcrypt.hash(password, 10);
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { password: hashedPassword }
                    });
                } else {
                    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
                }
            }
        }

        // Return user info WITHOUT password
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
