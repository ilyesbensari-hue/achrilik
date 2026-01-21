import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
        newUser: '/register',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnSell = nextUrl.pathname.startsWith('/sell');
            const isOnCheckout = nextUrl.pathname.startsWith('/checkout');

            // Admin protection
            if (isOnAdmin) {
                if (isLoggedIn && (auth?.user as any).role === 'ADMIN') return true;
                return false; // Redirect unauthenticated or non-admin users to login
            }

            // Seller protection
            if (isOnSell) {
                if (isLoggedIn && (auth?.user as any).role === 'SELLER') return true;
                // Note: Maybe redirect to "Become a seller" if logged in but not seller?
                // For now, simple block/redirect to login is safer.
                return false;
            }

            // Checkout protection
            if (isOnCheckout) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login
            }

            return true;
        },
        // Add role to session
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                (session.user as any).role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                (token as any).role = (user as any).role;
            }
            return token;
        }
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
