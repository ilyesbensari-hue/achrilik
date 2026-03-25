"use client";

import { useState, useEffect } from 'react';

export default function NewsletterBanner() {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Only show if not already dismissed
        if (localStorage.getItem('newsletter_dismissed')) return;
        if (localStorage.getItem('newsletter_subscribed')) return;

        const timer = setTimeout(() => {
            setVisible(true);
        }, 12000); // Show after 12 seconds

        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        setVisible(false);
        localStorage.setItem('newsletter_dismissed', '1');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name }),
            });
            if (res.ok) {
                setSubmitted(true);
                localStorage.setItem('newsletter_subscribed', '1');
                setTimeout(() => {
                    setVisible(false);
                    setDismissed(true);
                }, 3000);
            }
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    if (!visible || dismissed) return null;

    return (
        <div
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
            style={{ animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translate(-50%, 30px); }
                    to   { opacity: 1; transform: translate(-50%, 0); }
                }
            `}</style>

            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Top gradient bar */}
                <div className="h-1 bg-gradient-to-r from-[#006233] via-[#00a550] to-[#006233]" />

                <div className="p-5">
                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                        aria-label="Fermer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {submitted ? (
                        <div className="text-center py-3">
                            <div className="text-4xl mb-2">🎉</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Bienvenue !</h3>
                            <p className="text-sm text-gray-500">Vous serez parmi les premiers informés.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-start gap-3 mb-4">
                                <span className="text-3xl">💌</span>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base leading-tight">
                                        Offres exclusives & Nouveautés
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Soyez les premiers à découvrir nos nouvelles collections.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Votre prénom"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006233]/30 focus:border-[#006233]"
                                />
                                <input
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006233]/30 focus:border-[#006233]"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-[#006233] text-white text-sm font-semibold rounded-lg hover:bg-[#004d28] transition-colors disabled:opacity-60"
                                >
                                    {loading ? 'Inscription...' : "S'inscrire gratuitement"}
                                </button>
                            </form>
                            <p className="text-[10px] text-gray-400 text-center mt-2">
                                Pas de spam. Désinscription en un clic.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
