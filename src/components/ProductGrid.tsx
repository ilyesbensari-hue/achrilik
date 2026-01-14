"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SellerRating from '@/components/SellerRating';

interface Product {
    id: string;
    title: string;
    price: number;
    images: string;
    store: {
        name: string;
        city: string | null;
        averageRating?: number;
        reviewCount?: number;
    };
    category?: {
        name: string;
        slug: string;
        parentId?: string | null;
        parent?: {
            slug: string;
        } | null;
    } | null;
}

interface ProductGridProps {
    products: Product[];
    title?: string;
}

export default function ProductGrid({ products, title }: ProductGridProps) {
    const [viewMode, setViewMode] = useState<'unique' | 'deux' | 'grille'>('deux');

    if (products.length === 0) return null;

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
                {title && (
                    <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        {title} ({products.length})
                    </h3>
                )}

                {/* Mobile View Switcher */}
                <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
                    <button
                        onClick={() => setViewMode('unique')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'unique' ? 'bg-white shadow-sm text-[#006233]' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Vue détaillée (1 colonne)"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="0" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('deux')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'deux' ? 'bg-white shadow-sm text-[#006233]' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Vue standard (2 colonnes)"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 5a2 2 0 012-2h6a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                            <path d="M15 5a2 2 0 012-2h4a2 2 0 012 2v14a2 2 0 01-2 2h-4a2 2 0 01-2-2V5z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('grille')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grille' ? 'bg-white shadow-sm text-[#006233]' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Vue grille (3 colonnes)"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                            <path d="M3 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4z" />
                            <path d="M3 16a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4z" />
                            <path d="M10 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z" />
                            <path d="M10 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            <path d="M10 16a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            <path d="M17 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z" />
                            <path d="M17 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            <path d="M17 16a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className={`grid gap-3 transition-all duration-300 ease-in-out ${viewMode === 'unique' ? 'grid-cols-1' :
                viewMode === 'deux' ? 'grid-cols-2 lg:grid-cols-4' :
                    'grid-cols-3 lg:grid-cols-5'
                }`}>
                {products.map((product) => (
                    <Link
                        href={`/products/${product.id}`}
                        key={product.id}
                        className={`product-card-zalando group bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-all
                            ${viewMode === 'unique' ? 'flex flex-row gap-4 p-3' : 'flex flex-col'}
                        `}
                    >
                        {/* Image Container */}
                        <div className={`relative bg-gray-100 overflow-hidden ${viewMode === 'unique' ? 'w-1/3 aspect-[4/5] rounded-md flex-shrink-0' :
                            viewMode === 'grille' ? 'aspect-[3/4]' :
                                'aspect-[4/5]'
                            }`}>
                            {product.images ? (
                                <Image
                                    src={product.images.split(',')[0]}
                                    alt={product.title}
                                    fill
                                    sizes={viewMode === 'unique' ? "33vw" : viewMode === 'grille' ? "33vw" : "50vw"}
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Photo</div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className={`flex flex-col justify-center ${viewMode === 'unique' ? 'flex-1 py-1' :
                            viewMode === 'grille' ? 'p-1.5' :
                                'p-2'
                            }`}>
                            {/* Brand / Store (Hidden in compact grid mode on mobile to save space) */}
                            {viewMode !== 'grille' && (
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-500 truncate">{product.store.name}</span>
                                    {viewMode === 'unique' && (
                                        <div className="hidden sm:block">
                                            <SellerRating rating={product.store.averageRating || 0} count={product.store.reviewCount || 0} size="sm" showCount={false} />
                                        </div>
                                    )}
                                </div>
                            )}

                            <h3 className={`font-medium text-gray-900 leading-tight mb-1 truncate ${viewMode === 'unique' ? 'text-lg whitespace-normal line-clamp-2' :
                                viewMode === 'grille' ? 'text-[10px] md:text-xs' :
                                    'text-sm'
                                }`}>
                                {product.title}
                            </h3>

                            {/* Price */}
                            <div className={`mt-auto font-black text-[#1a1a1a] ${viewMode === 'unique' ? 'text-xl text-[#006233]' :
                                viewMode === 'grille' ? 'text-xs' :
                                    'text-sm'
                                }`}>
                                {product.price.toLocaleString()} DA
                            </div>

                            {/* Extra details for Unique View */}
                            {viewMode === 'unique' && (
                                <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                                    <span>📍 {product.store.city || 'Oran'}</span>
                                    {product.category && <span className="px-2 py-0.5 bg-gray-100 rounded-full">{product.category.name}</span>}
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
