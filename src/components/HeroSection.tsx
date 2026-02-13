'use client';

import { Truck, Wallet } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-emerald-50">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-10 md:py-12">
                {/* Main Content */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight text-gray-900">
                        Mode & Tendance Algérie 🇩🇿
                    </h1>
                </div>

                {/* 2 Features - Simple & Clean */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-3xl mx-auto">
                    {/* Feature 1: Livraison */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-md">
                        <div className="flex flex-col items-center text-center">
                            <Truck className="w-8 h-8 sm:w-10 sm:h-10 mb-3 text-emerald-600" />
                            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-gray-900">Livraison Oran</h3>
                            <p className="text-gray-600 text-sm sm:text-base">
                                24-48h
                            </p>
                        </div>
                    </div>

                    {/* Feature 2: Paiement */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-md">
                        <div className="flex flex-col items-center text-center">
                            <Wallet className="w-8 h-8 sm:w-10 sm:h-10 mb-3 text-rose-600" />
                            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-gray-900">Paiement Cash</h3>
                            <p className="text-gray-600 text-sm sm:text-base">
                                À la livraison
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
