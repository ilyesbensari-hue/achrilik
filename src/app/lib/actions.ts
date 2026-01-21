'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendWelcomeEmail } from '@/lib/mail';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function register(prevState: string | undefined, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const parsed = z.object({
        email: z.string().email(),
        password: z.string().min(6),
    }).safeParse({ email, password });

    if (!parsed.success) {
        return 'Email invalide ou mot de passe trop court (min 6 caractères).';
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return 'Cet email est déjà utilisé.';
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const name = email.split('@')[0];

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name,
                role: 'BUYER',
            }
        });

        // Send Welcome Email (Fire and forget)
        // We use setImmediate or just don't await if we want speed, but Vercel might kill it.
        // Better to await it or use Inngest/Background jobs in real production.
        // For now, await it to ensure it sends.
        await sendWelcomeEmail(email, name);

    } catch (error) {
        console.error('Registration error:', error);
        return 'Erreur lors de l\'inscription.';
    }

    // Attempt Login after registration
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Inscription réussie, mais échec de la connexion automatique.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}
