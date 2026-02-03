'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

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

    // Load banners from API
    useEffect(() => {
        fetch('/api/admin/banners?activeOnly=true')
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    // Map admin banners to HeroBanner format
                    const mappedBanners: HeroBanner[] = data.map((banner: any) => ({
                        id: banner.id,
                        title_fr: banner.title,
                        title_ar: banner.title, // Fallback to FR if no AR
                        subtitle_fr: banner.subtitle || '',
                        subtitle_ar: banner.subtitle || '',
                        cta_text_fr: banner.buttonText || "Voir l'offre",
                        cta_text_ar: banner.buttonText || "عرض",
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
                console.error('Error fetching banners:', error);
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
                video.play().catch(err => console.log('Autoplay blocked:', err));
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

    return (
        <section
            className="relative w-full mx-3 mt-4 mb-6 max-w-md md:max-w-7xl md:mx-auto overflow-hidden rounded-2xl shadow-xl h-[400px] md:h-[500px] lg:h-[600px]"
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

            {/* Overlay */}
            <div
                className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50"
                style={{ opacity: banner.overlay_opacity / 100 }}
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
                <div className="max-w-2xl">
                    <h1 className="text-white text-4xl md:text-5xl font-bold mb-4 drop-shadow-2xl animate-fade-in-up">
                        {title}
                    </h1>

                    <p className="text-white/95 text-lg md:text-xl mb-6 drop-shadow-lg animate-fade-in-up delay-100">
                        {subtitle}
                    </p>

                    <Link
                        href={banner.cta_link}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all hover:scale-105 shadow-lg animate-fade-in-up delay-200"
                    >
                        {ctaText}
                        <svg
                            className={`w-5 h-5 ${currentLang === 'ar' ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Navigation Dots */}
            {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`
                h-2 rounded-full transition-all duration-300
                ${currentSlide === index
                                    ? 'bg-white w-8'
                                    : 'bg-white/50 w-2 hover:bg-white/75'
                                }
              `}
                            aria-label={`Aller au slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Language Toggle */}
            <button
                onClick={() => setCurrentLang(prev => prev === 'fr' ? 'ar' : 'fr')}
                className="absolute top-4 right-4 z-20 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-sm font-medium hover:bg-white/30 transition-all"
                aria-label="Changer de langue"
            >
                {currentLang === 'fr' ? 'العربية' : 'FR'}
            </button>

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
      `}</style>
        </section>
    );
}
