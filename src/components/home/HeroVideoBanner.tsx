'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { logger } from '@/lib/logger';

interface HeroBanner {
    id: string;
    title_fr: string;
    title_ar?: string;
    subtitle_fr: string;
    subtitle_ar?: string;
    cta_text_fr: string;
    cta_text_ar?: string;
    cta_link: string;
    video_url?: string;
    thumbnail_url: string;
    text_position: 'left' | 'center' | 'right';
    overlay_opacity: number;
    display_duration: number;
    priority: number;
}

export default function HeroVideoBanner() {
    const [banners, setBanners] = useState<HeroBanner[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentLang, setCurrentLang] = useState<'fr' | 'ar'>('fr');
    const [loading, setLoading] = useState(true);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    // Sync lang from Navbar (reads localStorage + listens to custom event)
    useEffect(() => {
        const stored = localStorage.getItem('achrilik_lang') as 'fr' | 'ar' | null;
        if (stored) setCurrentLang(stored);

        const handleLangChange = (e: Event) => {
            const lang = (e as CustomEvent<'fr' | 'ar'>).detail;
            setCurrentLang(lang);
        };
        window.addEventListener('achrilik_lang_change', handleLangChange);
        return () => window.removeEventListener('achrilik_lang_change', handleLangChange);
    }, []);

    // Load banners from API
    useEffect(() => {
        const fetchBanners = () => {
            // Add cache-busting timestamp to ensure deleted banners are removed
            fetch(`/api/admin/banners?activeOnly=true&_t=${Date.now()}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        // Map admin banners to HeroBanner format
                        const mappedBanners: HeroBanner[] = data.map((banner: any) => ({
                            id: banner.id,
                            title_fr: banner.title,
                            title_ar: banner.title_ar || banner.title, // Use AR field or fallback to FR
                            subtitle_fr: banner.subtitle || '',
                            subtitle_ar: banner.subtitle_ar || banner.subtitle || '',
                            cta_text_fr: banner.buttonText || "Voir l'offre",
                            cta_text_ar: banner.buttonText_ar || "شاهد العرض",
                            cta_link: banner.link || '/categories',
                            video_url: banner.videoUrl || undefined,
                            thumbnail_url: banner.image || '/achrilik-logo-final.png',
                            text_position: 'center' as const,
                            overlay_opacity: 35,
                            display_duration: 6000,
                            priority: banner.order || 1
                        }));
                        setBanners(mappedBanners);
                    } else {
                        // Fallback to default banner if no admin banners
                        const defaultBanner: HeroBanner = {
                            id: 'default-1',
                            title_fr: 'Achrilik Marketplace',
                            title_ar: 'أشريليك ماركت بليس',
                            subtitle_fr: 'Mode Algérienne, Livrée Chez Vous',
                            subtitle_ar: 'الموضة الجزائرية، يتم توصيلها إليك',
                            cta_text_fr: 'Découvrir',
                            cta_text_ar: 'اكتشف',
                            cta_link: '/categories',
                            thumbnail_url: '/achrilik-logo-final.png',
                            text_position: 'center',
                            overlay_opacity: 35,
                            display_duration: 6000,
                            priority: 1
                        };
                        setBanners([defaultBanner]);
                    }
                    setLoading(false);
                })
                .catch(error => {
                    logger.error('Error fetching banners:', error);
                    // Load default banner on error
                    const defaultBanner: HeroBanner = {
                        id: 'default-1',
                        title_fr: 'Achrilik Marketplace',
                        title_ar: 'أشريليك ماركت بليس',
                        subtitle_fr: 'Mode Algérienne, Livrée Chez Vous',
                        subtitle_ar: 'الموضة الجزائرية، يتم توصيلها إليك',
                        cta_text_fr: 'Découvrir',
                        cta_text_ar: 'اكتشف',
                        cta_link: '/categories',
                        thumbnail_url: '/achrilik-logo-final.png',
                        text_position: 'center',
                        overlay_opacity: 35,
                        display_duration: 6000,
                        priority: 1
                    };
                    setBanners([defaultBanner]);
                    setLoading(false);
                });
        };

        // Initial fetch
        fetchBanners();

        // Refresh banners every 60 seconds to sync with admin changes
        const refreshInterval = setInterval(fetchBanners, 60000);

        return () => clearInterval(refreshInterval);
    }, []);

    // Auto-advance slides
    useEffect(() => {
        if (banners.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % banners.length);
        }, banners[currentSlide]?.display_duration || 6000);

        return () => clearInterval(timer);
    }, [banners, currentSlide]);

    // Handle video playback
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (!video) return;

            if (index === currentSlide) {
                video.play().catch(err => logger.log('Autoplay blocked:', err));
            } else {
                video.pause();
            }
        });
    }, [currentSlide]);

    if (loading || banners.length === 0) {
        return (
            <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl mx-3 mt-4 animate-pulse" />
        );
    }

    const banner = banners[currentSlide];
    const title = currentLang === 'ar' && banner.title_ar ? banner.title_ar : banner.title_fr;
    const subtitle = currentLang === 'ar' && banner.subtitle_ar ? banner.subtitle_ar : banner.subtitle_fr;
    const ctaText = currentLang === 'ar' && banner.cta_text_ar ? banner.cta_text_ar : banner.cta_text_fr;

    const goToNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
    };

    const goToPrevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    };

    return (
        <section
            className="relative w-full mx-3 mt-4 mb-6 max-w-md md:max-w-7xl md:mx-auto overflow-hidden rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-black/5 h-[400px] md:h-[500px] lg:h-[600px] transform-gpu"
            dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
        >
            {/* Background Video or Image */}
            {banner.video_url ? (
                <video
                    ref={el => {
                        videoRefs.current[currentSlide] = el;
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                    poster={banner.thumbnail_url}
                    autoPlay
                    playsInline
                    muted
                    loop
                    preload="metadata"
                >
                    <source src={banner.video_url} type="video/mp4" />
                </video>
            ) : (
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${banner.thumbnail_url})` }}
                />
            )}

            {/* Overlay - Smoother gradient */}
            <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 mix-blend-multiply"
                style={{ opacity: banner.overlay_opacity ? (banner.overlay_opacity / 100) + 0.1 : 0.45 }}
            />

            {/* Content */}
            <div
                className={`
          relative z-10 h-full flex items-center px-6 md:px-12
          ${banner.text_position === 'left' ? 'justify-start text-left' : ''}
          ${banner.text_position === 'center' ? 'justify-center text-center' : ''}
          ${banner.text_position === 'right' ? 'justify-end text-right' : ''}
        `}
            >
                <div className="max-w-2xl px-2">
                    <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-fade-in-up tracking-tight leading-tight">
                        {title}
                    </h1>

                    <p className="text-white/95 text-lg md:text-xl lg:text-2xl mb-8 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] animate-fade-in-up delay-100 font-medium">
                        {subtitle}
                    </p>

                    <Link
                        href={banner.cta_link}
                        className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-50 transition-all duration-300 hover:scale-[1.03] shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_8px_40px_rgba(255,255,255,0.3)] overflow-hidden animate-fade-in-up delay-200"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {ctaText}
                            <svg
                                className={`w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5 ${currentLang === 'ar' ? 'rotate-180 group-hover:-translate-x-1.5' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>

                        {/* Shine Effect */}
                        <div
                            className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-0 pointer-events-none"
                        />
                    </Link>
                </div>
            </div>

            {/* Navigation Arrows - Desktop Only */}
            {banners.length >= 1 && (
                <>
                    <button
                        onClick={goToPrevSlide}
                        className="flex absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110 shadow-lg group"
                        aria-label="Bannière précédente"
                    >
                        <ChevronLeft className="h-6 w-6 text-white group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={goToNextSlide}
                        className="flex absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110 shadow-lg group"
                        aria-label="Bannière suivante"
                    >
                        <ChevronRight className="h-6 w-6 text-white group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                    </button>
                </>
            )}

            {/* Navigation Dots */}
            {banners.length >= 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`
                h-1.5 rounded-full transition-all duration-500 ease-out
                ${currentSlide === index
                                    ? 'bg-white w-8 shadow-[0_0_10px_rgba(255,255,255,0.7)]'
                                    : 'bg-white/40 w-2 hover:bg-white/80 hover:w-4'
                                }
              `}
                            aria-label={`Aller au slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Language toggle moved to Navbar */}

            <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
        </section>
    );
}
