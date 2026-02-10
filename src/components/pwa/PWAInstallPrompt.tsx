'use client';

import { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('[PWA] App is already installed');
            return;
        }

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Show prompt after 30 seconds (or based on user engagement)
            setTimeout(() => {
                setShowPrompt(true);
            }, 30000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        console.log(`[PWA] User response: ${outcome}`);
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Don't show again for 7 days
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    };

    // Don't show if dismissed recently
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - dismissedTime < sevenDays) {
                setShowPrompt(false);
            }
        }
    }, []);

    if (!showPrompt || !deferredPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#006233] p-6">
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Icon */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#006233] to-[#00753D] rounded-2xl flex items-center justify-center text-3xl">
                        📱
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-gray-900">
                            Installer Achrilik
                        </h3>
                        <p className="text-sm text-gray-600">
                            Accès rapide depuis votre écran d'accueil
                        </p>
                    </div>
                </div>

                {/* Benefits */}
                <ul className="space-y-2 mb-4 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Lancement instantané
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Fonctionne hors ligne
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Notifications des promos
                    </li>
                </ul>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleInstallClick}
                        className="flex-1 bg-[#006233] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#00753D] transition shadow-lg"
                    >
                        Installer maintenant
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-4 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition"
                    >
                        Plus tard
                    </button>
                </div>
            </div>
        </div>
    );
}
