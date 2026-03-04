'use client';

import { Truck, Wallet } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function HeroSection() {
    const { tr } = useTranslation();

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-rose-50/70 via-white to-emerald-50/60 backdrop-blur-[2px] border-b border-gray-100/50">
            {/* Background Pattern - softer */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-10 md:py-12">
                {/* Main Content */}
                <div className="text-center mb-8 relative z-10">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 leading-tight tracking-tight text-gray-900 drop-shadow-sm">
                        {tr('home_hero_title')}
                    </h2>
                </div>

                {/* 2 Features - Simple & Clean */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-3xl mx-auto relative z-10">
                    {/* Feature 1: Livraison */}
                    <div className="group bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Truck className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-[15px] sm:text-lg md:text-xl font-bold mb-1.5 text-gray-900 tracking-tight">{tr('home_delivery_title')}</h3>
                            <p className="text-gray-500 font-medium text-xs sm:text-sm">
                                {tr('home_delivery_sub')}
                            </p>
                        </div>
                    </div>

                    {/* Feature 2: Paiement */}
                    <div className="group bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Wallet className="w-7 h-7 sm:w-8 sm:h-8 text-rose-600" />
                            </div>
                            <h3 className="text-[15px] sm:text-lg md:text-xl font-bold mb-1.5 text-gray-900 tracking-tight">{tr('home_payment_title')}</h3>
                            <p className="text-gray-500 font-medium text-xs sm:text-sm">
                                {tr('home_payment_sub')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
