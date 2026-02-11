'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function usePWA() {
    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            logger.log('[PWA] Service Workers not supported');
            return;
        }

        // Register service worker
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                logger.log('[PWA] Service Worker registered:', registration.scope);

                // Check for updates every hour
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);

                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            logger.log('[PWA] New version available!');
                            // Show update notification to user
                            if (confirm('Une nouvelle version d\'Achrilik est disponible. Recharger maintenant?')) {
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                logger.error('[PWA] Service Worker registration failed:', error);
            });

        // Handle offline/online events
        const handleOnline = () => {
            logger.log('[PWA] Back online');
            // Optionally show toast notification
        };

        const handleOffline = () => {
            logger.log('[PWA] You are offline');
            // Optionally show toast notification
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return {
        isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    };
}
