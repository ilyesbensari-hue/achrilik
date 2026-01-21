import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { User } from '@/lib/definitions'; // You might need to define this or use Prisma types

async function getUser(email: string): Promise<any | undefined> {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);

                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    // Handle temporary legacy passwords (plain text fallback if hash fails?)
                    if (!passwordsMatch) {
                        // Optional: Plain text check for legacy users (Migration logic)
                        if (user.password === password) {
                            // If it matches plain text, we accept it. 
                            return user;
                        }
                        return null;
                    }

                    return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
