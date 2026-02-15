"use client";

import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { PostHogProvider } from 'posthog-js/react';
import posthog from 'posthog-js';

// Init PostHog...
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') posthog.debug();
        },
    });
}

function PHProvider({ children }: { children: React.ReactNode }) {
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PHProvider>
            <AuthProvider>
                <WishlistProvider>
                    {children}
                </WishlistProvider>
            </AuthProvider>
        </PHProvider>
    );
}
