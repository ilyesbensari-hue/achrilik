'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function HeroBanner() {
    const messages = [
        "🚀 Commandez maintenant, payez à la livraison !",
        "✨ Découvrez les meilleures boutiques d'Oran",
        "🎁 Nouveaux produits ajoutés chaque jour",
        "🏪 Soutenez les commerçants locaux",
        "📦 Livraison rapide dans toute l'Algérie"
    ];

    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    // Auto-cycle messages with fade effect
    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false); // Start fade out
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % messages.length);
                setFade(true); // Fade in new message
            }, 300); // Half of transition duration
        }, 4000); // Change every 4 seconds
        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className="w-full bg-[#006233] border-b-4 border-yellow-500/50 text-white overflow-hidden shadow-lg relative rounded-none md:rounded-b-3xl">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                </svg>
            </div>

            <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 min-h-[90px]">

                {/* Left: Brand - Logo + Arabic */}
                <div className="flex-shrink-0 text-center md:text-left flex flex-col justify-center w-full md:w-auto items-center md:items-start relative z-20">
                    <div className="mb-3 flex justify-center md:justify-start transform md:-ml-2">
                        {/* Premium Medallion Container */}
                        <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] border-2 border-[#D4AF37] relative group overflow-hidden">
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ transform: 'skewX(-20deg) translateX(-150%)', animation: 'shine 3s infinite' }} />

                            <Image
                                src="/achrilik-logo-final.png"
                                alt="Achrilik Oran"
                                width={220}
                                height={90}
                                className="h-16 md:h-20 w-auto object-contain drop-shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:items-start items-center">
                        <p className="text-[#FFD700] font-serif italic text-lg md:text-xl tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                            Le Chic à l'Oranaise
                        </p>
                        <p className="text-white font-bold text-lg md:text-xl font-arabic tracking-wider drop-shadow-md" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
                            الأناقة و التسوق في وهران
                        </p>
                    </div>
                </div>

                {/* Right: Single Message - Compact */}
                <div className="flex-1 flex justify-center md:justify-end md:pr-8">
                    <div className="w-auto overflow-hidden border-l-4 border-yellow-400/50 pl-4 py-2 relative">
                        <div className="flex items-center justify-start">
                            <p className={`text-lg md:text-2xl font-medium text-white font-serif leading-relaxed whitespace-nowrap transition-opacity duration-500 drop-shadow-md ${fade ? 'opacity-100' : 'opacity-0'}`}>
                                {messages[index]}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
