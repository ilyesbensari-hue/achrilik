'use client';

import Link from 'next/link';
import { Truck, Wallet, MessageCircle } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-6 sm:py-8 md:py-10">
                {/* Main Content */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
                        Mode & Tendance Algérie 🇩🇿
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-purple-100 mb-4 max-w-2xl mx-auto">
                        Découvrez les dernières tendances avec livraison rapide
                    </p>
                    <Link
                        href="/categories"
                        className="inline-block bg-white text-purple-600 px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-sm sm:text-base hover:bg-purple-50 transition-all shadow-lg"
                    >
                        Découvrir
                    </Link>
                </div>

                {/* 3 Features - Compact */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto">
                    {/* Feature 1: Livraison */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                        <div className="flex flex-col items-center text-center">
                            <Truck className="w-5 h-5 sm:w-6 sm:h-6 mb-1.5 sm:mb-2" />
                            <h3 className="text-xs sm:text-sm md:text-base font-bold mb-1">Livraison 48h</h3>
                            <p className="text-purple-100 text-[10px] sm:text-xs hidden sm:block">
                                58 wilayas
                            </p>
                        </div>
                    </div>

                    {/* Feature 2: Paiement */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                        <div className="flex flex-col items-center text-center">
                            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 mb-1.5 sm:mb-2" />
                            <h3 className="text-xs sm:text-sm md:text-base font-bold mb-1">Paiement Cash</h3>
                            <p className="text-purple-100 text-[10px] sm:text-xs hidden sm:block">
                                À la livraison
                            </p>
                        </div>
                    </div>

                    {/* Feature 3: Service Client */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                        <div className="flex flex-col items-center text-center">
                            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mb-1.5 sm:mb-2" />
                            <h3 className="text-xs sm:text-sm md:text-base font-bold mb-1">WhatsApp</h3>
                            <p className="text-purple-100 text-[10px] sm:text-xs hidden sm:block">
                                9h-18h
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
