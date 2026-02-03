'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroSliderProps {
    featuredProduct?: {
        id: string;
        title: string;
        price: number;
        image: string;
    } | null;
}

export default function HeroSlider({ featuredProduct }: HeroSliderProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        // Slide 1: Featured Product (if available)
        ...(featuredProduct ? [{
            id: 0,
            bg: 'bg-gradient-to-br from-purple-600 to-pink-600',
            title: 'Top Nouveauté',
            subtitle: featuredProduct.title,
            buttonText: 'Découvrir',
            buttonColor: 'bg-white text-purple-600',
            image: featuredProduct.image,
            link: `/products/${featuredProduct.id}`,
            type: 'product' as const
        }] : []),

        // Slide 2: Mode
        {
            id: 1,
            bg: 'bg-gray-100',
            title: 'Mode & Tendance',
            subtitle: 'Découvrez nos collections',
            buttonText: 'Voir',
            buttonColor: 'bg-[#C62828] text-white',
            image: '',
            link: '/categories/femme',
            type: 'category' as const
        },

        // Slide 3: Promo
        {
            id: 2,
            bg: 'bg-[#C62828]',
            title: 'PROMO HBAL !',
            subtitle: 'Jusqu\'à -50%',
            buttonText: "J'en profite",
            buttonColor: 'bg-white text-[#C62828]',
            image: '',
            link: '/categories/promotions',
            type: 'promo' as const
        },

        // Slide 4: Livraison
        {
            id: 3,
            bg: 'bg-[#2E7D32]',
            title: 'Tewsal 7ta Lbab Dar',
            subtitle: 'Livraison 58 Wilayas',
            buttonText: 'Commander',
            buttonColor: 'bg-white text-[#2E7D32]',
            image: '',
            link: '/products',
            type: 'reassurance' as const
        }
    ];

    // Auto-scroll
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className="relative w-full overflow-hidden rounded-xl mt-3 mx-auto max-w-[95%]">
            {/* Container aspect ratio - RÉDUIT (3:1 au lieu de 2:1) */}
            <div className="relative aspect-[3/1] md:aspect-[4/1] bg-gray-50 rounded-xl overflow-hidden shadow-sm">

                {slides.map((slide, index) => (
                    <Link
                        href={slide.link || '#'}
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-500 ease-in-out flex items-center px-4 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            } ${slide.bg}`}
                    >
                        {/* Content - Left Side */}
                        <div className="w-2/3 pr-2">
                            <h2 className={`text-lg font-bold mb-0.5 leading-tight ${slide.type === 'category' ? 'text-[#212121]' : 'text-white'
                                }`}>
                                {slide.title}
                            </h2>
                            <p className={`text-xs mb-2 ${slide.type === 'category' ? 'text-[#757575]' : 'text-white/90'
                                }`}>
                                {slide.subtitle}
                            </p>
                            <button className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm active:scale-95 transition-transform ${slide.buttonColor}`}>
                                {slide.buttonText}
                            </button>
                        </div>

                        {/* Image - Right Side */}
                        <div className="w-1/3 flex justify-center items-center h-full relative">
                            {slide.type === 'product' && slide.image ? (
                                <div className="relative w-full h-full">
                                    <Image
                                        src={slide.image}
                                        alt={slide.subtitle}
                                        fill
                                        className="object-contain"
                                        sizes="33vw"
                                    />
                                </div>
                            ) : slide.type === 'category' ? (
                                <div className="text-3xl text-gray-300 rotate-12 font-black">👗</div>
                            ) : slide.type === 'promo' ? (
                                <div className="text-3xl text-white/30 rotate-12 font-black">%</div>
                            ) : (
                                <div className="text-3xl text-white/30 rotate-12 font-black">🇩🇿</div>
                            )}
                        </div>
                    </Link>
                ))}

                {/* Dots Indicators */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex gap-1">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-3' : 'bg-white/50'
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}
