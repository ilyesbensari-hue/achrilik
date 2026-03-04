'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import WishlistButton from '@/components/WishlistButton';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/lib/translations';

// Map section IDs/slugs to translation keys
const SECTION_TRANSLATION_MAP: Record<string, TranslationKey> = {
    'promotions': 'home_promo',
    'nouveautes': 'home_new',
    'femme': 'home_women',
    'femmes': 'home_women',
    'hommes': 'home_men',
    'enfants': 'home_kids',
    'maroquinerie': 'cat_maroquinerie',
    'accessoires': 'cat_accessories',
    'electronique': 'cat_electronique',
    'Femme': 'home_women',
    'Homme': 'home_men',
    'Enfant': 'home_kids',
};

interface Product {
    id: string;
    title: string;
    price: number;
    discountPrice?: number | null;
    promotionLabel?: string | null;
    image: string;
    categoryName: string;
    createdAt?: Date | string;
    Store?: {
        name: string;
        city: string | null;
        offersFreeDelivery: boolean;
        freeDeliveryThreshold: number | null;
    };
}

interface SubcategorySection {
    id: string;
    name: string;
    slug: string;
    products: Product[];
    customHref?: string; // Optional: override auto-generated /categories/{slug} URL
}

interface ClothingProductSectionsProps {
    sections: SubcategorySection[];
}

export default function ClothingProductSections({ sections }: ClothingProductSectionsProps) {
    if (sections.length === 0) return null;

    return (
        <div className="flex flex-col gap-10 mb-12">
            {sections.map((section) => (
                <ProductSection key={section.id} section={section} />
            ))}
        </div>
    );
}

function ProductSection({ section }: { section: SubcategorySection }) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const { tr, lang } = useTranslation();

    // Resolve translated section name
    const translationKey = SECTION_TRANSLATION_MAP[section.slug] || SECTION_TRANSLATION_MAP[section.name];
    // In Arabic, use translated name; otherwise keep original database name
    const displayName = lang === 'ar' && translationKey ? tr(translationKey).replace(/[👗👔👶💍🔥🆕]/g, '').trim() : section.name;

    const checkScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    };

    // Check scroll on mount and when products load
    useEffect(() => {
        // Delay to ensure DOM is fully rendered
        const timer = setTimeout(() => {
            checkScroll();
        }, 100);
        return () => clearTimeout(timer);
    }, [section.products]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = 300;
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
        // Check scroll state after animation completes
        setTimeout(checkScroll, 350);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Section Header */}
            <div className="px-4 md:px-8 lg:px-12 md:max-w-7xl md:mx-auto flex items-end justify-between">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-none drop-shadow-sm">{displayName}</h2>
                <Link
                    href={section.customHref || `/categories/${section.slug}`}
                    className="group flex items-center text-[13px] md:text-sm font-bold text-[#D32F2F] hover:text-[#B71C1C] transition-colors pb-1"
                >
                    {tr('home_see_all')} <ChevronRight className="h-4 w-4 ml-0.5 transition-transform duration-300 group-hover:translate-x-1.5" strokeWidth={2.5} />
                </Link>
            </div>

            {/* Products Carousel - Horizontal on ALL screens */}
            <div className="relative">
                {/* Left Arrow (Desktop Only) */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="flex absolute left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-700" strokeWidth={2.5} />
                    </button>
                )}

                {/* Right Arrow (Desktop Only) */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="flex absolute right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-10 md:h-10 items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-700" strokeWidth={2.5} />
                    </button>
                )}

                {/* Gradient scroll indicators - Mobile only */}
                {section.products.length > 2 && (
                    <>
                        <div className="md:hidden absolute left-0 top-0 bottom-8 w-6 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-[5]" />
                        <div className="md:hidden absolute right-0 top-0 bottom-8 w-6 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-[5]" />
                    </>
                )}

                <div
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    className="overflow-x-auto pb-8 -mb-4 px-4 md:px-8 lg:px-12 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent md:scrollbar-hide"
                >
                    <div className="flex gap-4 md:gap-5 lg:gap-6 min-w-max">
                        {section.products.length > 0 ? (
                            section.products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.id}`}
                                    className="w-[155px] md:w-[200px] lg:w-[220px] flex flex-col gap-3 group flex-shrink-0"
                                >
                                    <div className="relative aspect-[3/4] bg-gray-50 rounded-[18px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] transition-all duration-300 group-hover:shadow-[0_20px_40px_-8px_rgba(0,0,0,0.15)] group-hover:-translate-y-1.5 group-hover:ring-black/10">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-[1.08] ease-out will-change-transform"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-multiply" />
                                        {/* Badges container */}
                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            {product.promotionLabel && (
                                                <div className="bg-gradient-to-br from-rose-500/95 to-rose-600/95 backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-2 md:px-2.5 py-1 rounded-full shadow-[0_4px_10px_rgba(225,29,72,0.3)] flex items-center gap-1 border border-white/20 relative overflow-hidden">
                                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                                    <span className="animate-pulse">🔥</span>
                                                    <span className="relative z-10">{product.promotionLabel}</span>
                                                </div>
                                            )}
                                            {/* Free Delivery Badge */}
                                            {product.Store?.offersFreeDelivery && (
                                                <div className="bg-gradient-to-r from-emerald-500/95 to-teal-600/95 backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-2 md:px-2.5 py-1 rounded shadow-[0_4px_10px_rgba(16,185,129,0.3)] flex items-center gap-1 border border-white/20">
                                                    🚚 <span className="drop-shadow-sm">{tr('cart_free')} ✓</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Wishlist Button */}
                                        <div className="absolute top-2 right-2 z-20">
                                            <WishlistButton productId={product.id} size="sm" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5 px-0.5 mt-1">
                                        <h3 className="text-[13px] md:text-sm font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-[#D32F2F] transition-colors">
                                            {product.title}
                                        </h3>
                                        <p className="text-[11px] md:text-xs text-gray-400 font-medium">{product.categoryName}</p>
                                        <div className="flex items-baseline gap-2 mt-0.5">
                                            {product.discountPrice ? (
                                                <>
                                                    <span className="text-base md:text-lg font-extrabold text-[#D32F2F] tracking-tight">
                                                        {product.discountPrice.toLocaleString('fr-DZ')} DA
                                                    </span>
                                                    <span className="text-[11px] md:text-[13px] text-gray-400 line-through font-medium opacity-80 decoration-gray-300">
                                                        {product.price.toLocaleString('fr-DZ')} DA
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-base md:text-lg font-extrabold text-gray-900 tracking-tight">
                                                    {product.price.toLocaleString('fr-DZ')} DA
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="w-full flex items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <div className="text-center">
                                    <p className="text-sm font-medium">{tr('home_no_products')}</p>
                                    <p className="text-xs mt-1">{tr('loading')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
