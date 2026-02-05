'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface Product {
    id: string;
    title: string;
    price: number;
    discountPrice?: number | null;
    promotionLabel?: string | null;
    image: string;
    categoryName: string;
    createdAt?: Date | string;
}

interface SubcategorySection {
    id: string;
    name: string;
    slug: string;
    products: Product[];
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

    const checkScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = 300;
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Section Header */}
            <div className="px-4 md:px-8 lg:px-12 md:max-w-7xl md:mx-auto flex items-end justify-between">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight leading-none">{section.name}</h2>
                <Link
                    href={`/categories/${section.slug}`}
                    className="group flex items-center text-[13px] md:text-sm font-semibold text-[#D32F2F] hover:text-[#B71C1C] transition-colors pb-1"
                >
                    Voir tout <ChevronRight className="h-4 w-4 ml-0.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
                </Link>
            </div>

            {/* Products Carousel - Horizontal on ALL screens */}
            <div className="relative">
                {/* Left Arrow (Desktop Only) */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-700" strokeWidth={2.5} />
                    </button>
                )}

                {/* Right Arrow (Desktop Only) */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-700" strokeWidth={2.5} />
                    </button>
                )}

                <div
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    className="overflow-x-auto pb-8 -mb-4 px-4 md:px-8 lg:px-12 scrollbar-hide"
                >
                    <div className="flex gap-4 md:gap-5 lg:gap-6 min-w-max">
                        {section.products.length > 0 ? (
                            section.products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.id}`}
                                    className="w-[155px] md:w-[200px] lg:w-[220px] flex flex-col gap-3 group flex-shrink-0"
                                >
                                    <div className="relative aspect-[3/4] bg-gray-50 rounded-[18px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition-all duration-300 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] group-hover:-translate-y-1">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        {product.promotionLabel && (
                                            <div className="absolute top-2 left-2 bg-gradient-to-br from-rose-500 to-rose-600 text-white text-[10px] md:text-xs font-bold px-2 md:px-2.5 py-0.5 md:py-1 rounded-full shadow-lg flex items-center gap-1">
                                                <span className="animate-pulse">🔥</span>
                                                <span>{product.promotionLabel}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5 px-0.5">
                                        <h3 className="text-[13px] md:text-sm font-medium text-gray-900 line-clamp-2 leading-tight group-hover:text-[#D32F2F] transition-colors">
                                            {product.title}
                                        </h3>
                                        <p className="text-[11px] md:text-xs text-gray-500">{product.categoryName}</p>
                                        <div className="flex items-baseline gap-1.5">
                                            {product.discountPrice ? (
                                                <>
                                                    <span className="text-base md:text-lg font-bold text-[#D32F2F]">
                                                        {product.discountPrice.toLocaleString('fr-DZ')} DA
                                                    </span>
                                                    <span className="text-xs text-gray-400 line-through">
                                                        {product.price.toLocaleString('fr-DZ')} DA
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-base md:text-lg font-bold text-gray-900">
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
                                    <p className="text-sm font-medium">Aucun produit disponible</p>
                                    <p className="text-xs mt-1">Bientôt en stock</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
