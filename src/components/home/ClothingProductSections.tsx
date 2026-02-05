'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

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
                <div key={section.id} className="flex flex-col gap-6">
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

                    {/* Products Carousel on Mobile, Grid on Desktop */}
                    <div className="overflow-x-auto md:overflow-visible pb-8 -mb-4 px-4 md:px-8 lg:px-12 scrollbar-hide snap-x snap-mandatory">
                        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8 min-w-max md:min-w-0 md:max-w-7xl md:mx-auto">
                            {section.products.length > 0 ? (
                                section.products.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        className="w-[155px] md:w-auto flex flex-col gap-3 group snap-start"
                                    >
                                        <div className="relative aspect-[3/4] bg-gray-50 rounded-[18px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition-all duration-300 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] group-hover:-translate-y-1">
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                loading="lazy"
                                            />

                                            {/* Promo Badge - Modern Pill Shape */}
                                            {product.promotionLabel ? (
                                                <div className="absolute top-2.5 left-2.5 z-10">
                                                    <div className="bg-[#D32F2F] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-0.5 tracking-wide">
                                                        <span>{product.promotionLabel}</span>
                                                    </div>
                                                </div>
                                            ) : product.discountPrice && product.discountPrice < product.price && (
                                                <div className="absolute top-2.5 left-2.5 z-10">
                                                    <div className="bg-white/95 backdrop-blur-sm text-[#D32F2F] px-2 py-1 rounded-full text-[10px] font-bold shadow-sm ring-1 ring-[#D32F2F]/10 flex items-center gap-0.5">
                                                        <span>-{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* NEW Badge - Modern Gradient */}
                                            {(() => {
                                                if (!product.createdAt) return null;
                                                const thirtyDaysAgo = new Date();
                                                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                                                const productDate = new Date(product.createdAt);
                                                const isNew = productDate > thirtyDaysAgo;

                                                return isNew && (
                                                    <div className={`absolute ${product.promotionLabel || (product.discountPrice && product.discountPrice < product.price) ? 'top-[38px]' : 'top-2.5'} left-2.5 z-10`}>
                                                        <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-[9px] font-bold shadow-sm flex items-center gap-1 opacity-95">
                                                            NEW
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div className="flex flex-col px-0.5 gap-1">
                                            <h3 className="text-[13px] font-medium text-gray-800 line-clamp-2 min-h-[2.5em] leading-[1.35] group-hover:text-black transition-colors">
                                                {product.title}
                                            </h3>
                                            <div className="flex items-baseline gap-2">
                                                {product.discountPrice && product.discountPrice < product.price ? (
                                                    <>
                                                        <p className="text-[15px] font-bold text-[#D32F2F] tracking-tight">
                                                            {product.discountPrice.toLocaleString()} DA
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 line-through decoration-gray-300 pt-0.5">
                                                            {product.price.toLocaleString()}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-[15px] font-bold text-gray-900 tracking-tight">
                                                        {product.price.toLocaleString()} DA
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                // Placeholder/Empty state if no products found
                                <div className="w-full flex col-span-full items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <span className="text-sm font-medium">Aucun produit disponible pour le moment</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
