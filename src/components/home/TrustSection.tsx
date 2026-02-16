'use client';

import Link from 'next/link';
import { Shield, FileText, Lock, HelpCircle } from 'lucide-react';

export default function TrustSection() {
    return (
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Achats en Toute Confiance
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Votre sécurité et votre satisfaction sont nos priorités
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* About */}
                <Link
                    href="/about"
                    className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-purple-200"
                >
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Shield className="w-7 h-7 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        À Propos
                    </h3>
                    <p className="text-sm text-gray-600">
                        Découvrez notre mission et nos valeurs
                    </p>
                </Link>

                {/* CGV */}
                <Link
                    href="/cgv"
                    className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-purple-200"
                >
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        CGV
                    </h3>
                    <p className="text-sm text-gray-600">
                        Nos conditions générales de vente
                    </p>
                </Link>

                {/* Privacy */}
                <Link
                    href="/politique-confidentialite"
                    className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-purple-200"
                >
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Lock className="w-7 h-7 text-pink-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        Confidentialité
                    </h3>
                    <p className="text-sm text-gray-600">
                        Protection de vos données
                    </p>
                </Link>

                {/* FAQ */}
                <Link
                    href="/faq"
                    className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-purple-200"
                >
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <HelpCircle className="w-7 h-7 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        FAQ
                    </h3>
                    <p className="text-sm text-gray-600">
                        Questions fréquentes
                    </p>
                </Link>
            </div>

            {/* Small legal disclaimer */}
            <div className="mt-10 text-center">
                <p className="text-xs text-gray-500">
                    🇩🇿 Conforme à la loi algérienne 18-07 sur la protection des données personnelles
                </p>
            </div>
        </section>
    );
}
