'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasAccepted = localStorage.getItem('achrilik_cookies_accepted');
        if (!hasAccepted) {
            // Show banner after 1 second delay
            setTimeout(() => setIsVisible(true), 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('achrilik_cookies_accepted', 'true');
        setIsVisible(false);
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
            <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-pink-900 text-white shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex-1 flex items-start gap-3">
                            <span className="text-2xl">🍪</span>
                            <div>
                                <p className="text-sm sm:text-base font-medium">
                                    Nous utilisons des cookies pour mémoriser votre panier d'achat
                                </p>
                                <p className="text-xs sm:text-sm text-purple-200 mt-1">
                                    En continuant, vous acceptez notre utilisation des cookies.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/politique-confidentialite"
                                className="text-xs sm:text-sm text-purple-200 hover:text-white underline whitespace-nowrap"
                            >
                                En savoir plus
                            </Link>

                            <button
                                onClick={handleAccept}
                                className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors whitespace-nowrap text-sm sm:text-base"
                            >
                                Accepter
                            </button>

                            <button
                                onClick={handleClose}
                                className="text-white hover:text-purple-200 transition-colors p-1"
                                aria-label="Fermer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
