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
        <div className="flex flex-col gap-8 mb-8">
            {sections.map((section) => (
                <div key={section.id} className="flex flex-col gap-4">
                    {/* Section Header */}
                    <div className="px-4 md:px-8 lg:px-12 md:max-w-7xl md:mx-auto flex items-center justify-between">
                        <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#212121]">{section.name}</h2>
                        <Link
                            href={`/categories/${section.slug}`}
                            className="flex items-center text-xs md:text-sm font-semibold text-[#C62828] hover:underline"
                        >
                            Voir tout <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Products Carousel on Mobile, Grid on Desktop */}
                    <div className="overflow-x-auto md:overflow-visible pb-4 px-4 md:px-8 lg:px-12 scrollbar-hide">
                        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 lg:gap-8 min-w-max md:min-w-0 md:max-w-7xl md:mx-auto">
                            {section.products.length > 0 ? (
                                section.products.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        className="w-[145px] md:w-auto flex flex-col gap-3 group"
                                    >
                                        <div className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] transition-all duration-300 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] group-hover:-translate-y-1">
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                            />

                                            {/* Promo Badge - Modern Pill Shape */}
                                            {product.promotionLabel ? (
                                                <div className="absolute top-2 left-2 z-10">
                                                    <div className="bg-[#C62828] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-0.5">
                                                        <span>{product.promotionLabel}</span>
                                                    </div>
                                                </div>
                                            ) : product.discountPrice && product.discountPrice < product.price && (
                                                <div className="absolute top-2 left-2 z-10">
                                                    <div className="bg-white/95 backdrop-blur-sm text-[#C62828] px-2 py-1 rounded-full text-[10px] font-bold shadow-sm border border-[#C62828]/10 flex items-center gap-0.5">
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
                                                    <div className={`absolute ${product.promotionLabel || (product.discountPrice && product.discountPrice < product.price) ? 'top-9' : 'top-2'} left-2 z-10`}>
                                                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 mt-0.5">
                                                            <span className="relative flex h-1.5 w-1.5">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                                            </span>
                                                            NEW
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div className="flex flex-col px-1">
                                            <h3 className="text-[13px] font-medium text-gray-800 line-clamp-2 min-h-[2.5em] leading-[1.3]">
                                                {product.title}
                                            </h3>
                                            <div className="flex items-baseline gap-2 mt-1.5">
                                                {product.discountPrice && product.discountPrice < product.price ? (
                                                    <>
                                                        <p className="text-[15px] font-bold text-[#C62828]">
                                                            {product.discountPrice.toLocaleString()} DA
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 line-through decoration-gray-300">
                                                            {product.price.toLocaleString()} DA
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-[15px] font-bold text-gray-900">
                                                        {product.price.toLocaleString()} DA
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                // Placeholder/Empty state if no products found
                                <div className="w-full flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200 mx-4">
                                    <span className="text-xs">Aucun produit disponible</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
