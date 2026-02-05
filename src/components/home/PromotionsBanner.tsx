'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Banner {
    id: string;
    title: string;
    subtitle: string | null;
    image: string;
    link: string | null;
    buttonText: string;
    isActive: boolean;
    order: number;
}

interface PromotionsBannerProps {
    featuredProducts?: Array<{
        id: string;
        image: string;
        title: string;
    }>;
}

export default function PromotionsBanner({ featuredProducts = [] }: PromotionsBannerProps) {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch banners with cache-busting to ensure deleted banners are removed
    useEffect(() => {
        const fetchBanners = () => {
            fetch(`/api/admin/banners?activeOnly=true&_t=${Date.now()}`)
                .then(res => res.json())
                .then(data => {
                    setBanners(data || []);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching banners:', error);
                    setBanners([]);
                    setIsLoading(false);
                });
        };

        // Initial fetch
        fetchBanners();

        // Refresh every 60 seconds to sync with admin changes
        const refreshInterval = setInterval(fetchBanners, 60000);

        return () => clearInterval(refreshInterval);
    }, []);

    // Determine which slides to show
    const activeBanners = banners.filter(b => b.isActive);
    const hasCustomBanners = activeBanners.length > 0;

    // If we have custom banners, use them; otherwise use default slides
    const totalSlides = hasCustomBanners ? activeBanners.length : 3;

    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-play carousel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }, 5000); // 5 seconds per slide
        return () => clearInterval(timer);
    }, [totalSlides]);

    return (
        <div className="mt-4 mb-6 relative w-full">
            <div className={`relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.08)] h-[100px] md:h-[110px] flex flex-col justify-center transition-all duration-700 ${currentSlide === 0 ? 'bg-gradient-to-br from-[#fffcfc] via-[#fff5f5] to-[#ffeef2]' : 'bg-gradient-to-r from-rose-50 to-orange-50'}`}>

                {/* Slides Container */}
                <div
                    className="transition-transform duration-500 ease-in-out flex w-full h-full overflow-hidden"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >

                    {hasCustomBanners ? (
                        // RENDER CUSTOM BANNERS FROM DATABASE
                        activeBanners.map((banner, index) => (
                            <div key={banner.id} className="w-full h-full flex-shrink-0 min-w-full relative">
                                {/* Banner Image */}
                                <div className="absolute inset-0">
                                    <Image
                                        src={banner.image}
                                        alt={banner.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 896px"
                                        priority={index === 0}
                                    />
                                </div>

                                {/* Overlay + Content */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-6 md:p-8">
                                    <div className="text-white max-w-2xl">
                                        <h2 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h2>
                                        {banner.subtitle && (
                                            <p className="text-sm md:text-lg mb-4 text-white/90">{banner.subtitle}</p>
                                        )}
                                        {banner.link && (
                                            <Link
                                                href={banner.link}
                                                className="inline-flex items-center justify-center bg-white text-[#C62828] px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-all active:scale-95"
                                            >
                                                {banner.buttonText}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        // DEFAULT HARDCODED SLIDES (Fallback when no custom banners)
                        <>
                            {/* SLIDE 0: Brand Animation (Achrilik) - PREMIUM REDESIGN */}
                            <div className="w-full h-full flex-shrink-0 flex items-center justify-center min-w-full relative overflow-hidden">

                                {/* 1. Dynamic Background Layers */}
                                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none"></div>

                                {/* 2. Animated Glow Orbs */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-rose-400/20 to-purple-400/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C62828]/5 rounded-full blur-3xl pointer-events-none" />
                                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

                                {/* 3. Content Container */}
                                <div className="relative z-10 text-center animate-fade-in flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 w-full max-w-2xl mx-auto">

                                    {/* Logo Integration - Compact Version */}
                                    <div className="mb-3 md:mb-4 transform hover:scale-105 transition-transform duration-700 ease-out">
                                        <div className="relative flex justify-center">
                                            {/* Multi-layer Glow Effect for depth */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-rose-200/40 via-white/50 to-orange-200/40 blur-3xl scale-150 animate-pulse-slow"></div>
                                            <div className="absolute inset-0 bg-white/30 blur-2xl scale-125"></div>

                                            {/* Logo Container - Compact */}
                                            <div className="relative z-10 bg-gradient-to-br from-white/75 to-white/50 rounded-xl p-2 md:p-3 shadow-xl border border-white/40">
                                                <Image
                                                    src="/logo-achrilik.png"
                                                    alt="Achrilik أشريليك"
                                                    width={200}
                                                    height={60}
                                                    priority
                                                    className="object-contain w-[160px] h-[50px] md:w-[200px] md:h-[60px]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Premium Tagline - Compact */}
                                    <div className="flex flex-col items-center gap-2 opacity-0 animate-slide-up-fade" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                                        <div className="flex items-center gap-3 w-full justify-center">
                                            <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#C62828]/40 to-transparent"></div>
                                            <div className="w-1 h-1 rounded-full bg-[#C62828]/60"></div>
                                            <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#C62828]/40 to-transparent"></div>
                                        </div>

                                        <p className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-[#8a1c1c] uppercase relative">
                                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C62828] to-[#8a1c1c]">
                                                L&apos;excellence du shopping
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* SLIDE 1: Promotions (Original Content) */}
                            <div className="w-full h-full flex-shrink-0 p-4 min-w-full pb-14">
                                <div className="flex items-center justify-between relative z-10 h-full">
                                    {/* Left Content */}
                                    <div className="flex-1 pr-4">
                                        <h2 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
                                            Promotions
                                        </h2>
                                        <div className="overflow-hidden h-8 mb-3 relative max-w-full">
                                            <div className="flex animate-marquee whitespace-nowrap py-1">
                                                <span className="text-xs font-semibold text-[#8a1c1c] mr-8 flex items-center bg-white/40 px-2 py-0.5 rounded-full border border-rose-100/50">
                                                    🔥 Livraison Gratuite à Oran !
                                                </span>
                                                <span className="text-xs font-semibold text-[#8a1c1c] mr-8 flex items-center bg-white/40 px-2 py-0.5 rounded-full border border-rose-100/50">
                                                    ⚡ Jusqu&apos;à -50% sur la Mode
                                                </span>
                                                <span className="text-xs font-semibold text-[#8a1c1c] mr-8 flex items-center bg-white/40 px-2 py-0.5 rounded-full border border-rose-100/50">
                                                    💳 Paiement à la Livraison
                                                </span>
                                                <span className="text-xs font-semibold text-[#8a1c1c] mr-8 flex items-center bg-white/40 px-2 py-0.5 rounded-full border border-rose-100/50">
                                                    🌟 Satisfait ou Remboursé
                                                </span>
                                                {/* Duplicate for seamless loop */}
                                                <span className="text-xs font-semibold text-[#8a1c1c] mr-8 flex items-center bg-white/40 px-2 py-0.5 rounded-full border border-rose-100/50">
                                                    🔥 Livraison Gratuite à Oran !
                                                </span>
                                            </div>
                                        </div>
                                        <Link
                                            href="/categories/promotions"
                                            className="inline-flex items-center justify-center bg-[#C62828] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg shadow-red-200 hover:bg-[#B71C1C] transition-all active:scale-95"
                                        >
                                            Voir l&apos;offre
                                        </Link>
                                    </div>

                                    {/* Right Images - Hidden on mobile to avoid overlap */}
                                    <div className="hidden sm:flex gap-2 items-center flex-shrink-0">
                                        {featuredProducts.slice(0, 3).map((product, idx) => (
                                            <div
                                                key={idx}
                                                className="relative w-16 h-16 bg-white rounded-xl shadow-sm p-1 border border-white"
                                            >
                                                <Image
                                                    src={product.image}
                                                    alt={product.title}
                                                    fill
                                                    className="object-contain p-1"
                                                    sizes="64px"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* SLIDE 2: New Arrivals / Discovery */}
                            <div className="w-full h-full flex-shrink-0 p-4 min-w-full pb-10">
                                <div className="flex items-center justify-between relative z-10 h-full">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                                            Nouveautés
                                        </h2>
                                        <p className="text-xs text-gray-600 mb-4 max-w-[200px]">
                                            Découvrez les dernières tendances mode de la semaine !
                                        </p>
                                        <Link
                                            href="/nouveautes"
                                            className="inline-flex items-center gap-1 text-[#C62828] text-sm font-bold hover:underline"
                                        >
                                            Explorer <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                    <div className="hidden sm:flex gap-2 items-center flex-shrink-0 opacity-80">
                                        {featuredProducts.slice(0, 2).map((product, idx) => (
                                            <div
                                                key={idx}
                                                className="relative w-14 h-14 bg-white rounded-xl shadow-sm p-1 border border-white rotate-3"
                                            >
                                                <Image
                                                    src={product.image}
                                                    alt={product.title}
                                                    fill
                                                    className="object-contain p-1"
                                                    sizes="56px"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Dots Indicators - Positioned below content */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
                    {Array.from({ length: totalSlides }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${currentSlide === idx ? 'bg-[#C62828] w-5' : 'bg-rose-200/80 w-1.5 hover:bg-rose-300'
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
