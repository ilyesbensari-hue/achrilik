import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Page introuvable | Achrilik',
    description: "La page que vous cherchez n'existe pas ou a été déplacée.",
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f9f5] to-[#e8faf2] flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                {/* Animated 404 */}
                <div className="relative mb-8">
                    <div className="text-[10rem] font-black text-[#006233]/10 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl animate-bounce">🔍</div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-[#006233]/10">
                    <div className="w-16 h-16 bg-[#006233]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-[#006233]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-3">Page introuvable</h1>
                    <p className="text-gray-500 mb-2">الصفحة غير موجودة</p>
                    <p className="text-gray-400 text-sm mb-8">
                        La page que vous cherchez n&apos;existe pas ou a été déplacée.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#006233] text-white font-bold rounded-xl hover:bg-[#004d28] transition-colors shadow-lg shadow-[#006233]/20"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Retour à l&apos;accueil
                        </Link>
                        <Link
                            href="/categories"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#006233] font-bold rounded-xl border-2 border-[#006233] hover:bg-[#f0f9f5] transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            Explorer les catégories
                        </Link>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center gap-6 text-xs text-gray-400">
                        <span>🔒 Achats sécurisés</span>
                        <span>🚚 Livraison rapide</span>
                        <span>💳 Paiement à la livraison</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
