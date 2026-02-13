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

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                {/* Main Content */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                        Mode & Tendance Algérie 🇩🇿
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
                        Découvrez les dernières tendances de mode féminine et masculine avec livraison rapide dans toute l'Algérie
                    </p>
                    <Link
                        href="/categories"
                        className="inline-block bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-purple-50 transition-all transform hover:scale-105 shadow-2xl"
                    >
                        Découvrir la Collection
                    </Link>
                </div>

                {/* 3 Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {/* Feature 1: Livraison */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-white/20 p-4 rounded-full mb-4">
                                <Truck className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Livraison Rapide</h3>
                            <p className="text-purple-100 text-sm">
                                Livraison express 48h-72h dans toute l'Algérie (58 wilayas)
                            </p>
                        </div>
                    </div>

                    {/* Feature 2: Paiement */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-white/20 p-4 rounded-full mb-4">
                                <Wallet className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Paiement à la Livraison</h3>
                            <p className="text-purple-100 text-sm">
                                Payez en espèces à la réception de votre commande
                            </p>
                        </div>
                    </div>

                    {/* Feature 3: Service Client */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-white/20 p-4 rounded-full mb-4">
                                <MessageCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Service Client WhatsApp</h3>
                            <p className="text-purple-100 text-sm">
                                Support réactif sur WhatsApp de 9h à 18h
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
