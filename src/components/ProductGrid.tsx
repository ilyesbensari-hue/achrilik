"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SellerRating from '@/components/SellerRating';
import WishlistButton from '@/components/WishlistButton';

interface Product {
    id: string;
    title: string;
    price: number;
    discountPrice?: number | null;
    description?: string;
    images: string;
    createdAt: Date | string;
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
    const [viewMode, setViewMode] = useState<'deux' | 'trois'>('deux');

    // Load saved preference on mount
    useEffect(() => {
        const saved = localStorage.getItem('productViewMode');
        if (saved === 'deux' || saved === 'trois') {
            setViewMode(saved);
        }
    }, []);

    // Save preference when changed
    const handleViewChange = (mode: 'deux' | 'trois') => {
        setViewMode(mode);
        localStorage.setItem('productViewMode', mode);
    };

    if (products.length === 0) return null;

    // Grid classes based on view mode
    const gridClasses =
        viewMode === 'deux' ? 'grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8' :
            'grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-8';

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
                {title && (
                    <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-gray-900 tracking-tight">
                        {title}
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">{products.length}</span>
                    </h3>
                )}

                {/* View Switcher - 2 or 3 columns only */}
                <div className="flex items-center gap-0.5 border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                    {/* 2 Columns */}
                    <button
                        onClick={() => handleViewChange('deux')}
                        className={`p-2.5 transition-all ${viewMode === 'deux' ? 'bg-black text-white' : 'bg-white text-gray-400 hover:text-black hover:bg-gray-50'}`}
                        title="2 colonnes"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 5a1 1 0 011-1h5a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM13 5a1 1 0 011-1h5a1 1 0 011 1v14a1 1 0 01-1 1h-5a1 1 0 01-1-1V5z" />
                        </svg>
                    </button>

                    {/* 3 Columns */}
                    <button
                        onClick={() => handleViewChange('trois')}
                        className={`p-2.5 transition-all ${viewMode === 'trois' ? 'bg-black text-white' : 'bg-white text-gray-400 hover:text-black hover:bg-gray-50'}`}
                        title="3 colonnes"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 5a1 1 0 011-1h3a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5zM9 5a1 1 0 011-1h3a1 1 0 011 1v14a1 1 0 01-1 1h-3a1 1 0 01-1-1V5zM16 5a1 1 0 011-1h3a1 1 0 011 1v14a1 1 0 01-1 1h-3a1 1 0 01-1-1V5z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className={`grid transition-all duration-300 ease-in-out ${gridClasses}`}>
                {products.map((product) => (
                    <Link
                        href={`/products/${product.id}`}
                        key={product.id}
                        className={`product-card-zalando group`}
                    >
                        {/* Image Container */}
                        <div className={`product-image`}>
                            {product.images ? (
                                <Image
                                    src={product.images.split(',')[0]}
                                    alt={product.title}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                    <span>No Image</span>
                                </div>
                            )}

                            {/* Promo Badge */}
                            {product.discountPrice && product.discountPrice < product.price && (
                                <div className="absolute top-2 left-2 z-10">
                                    <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
                                        -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                                    </span>
                                </div>
                            )}

                            {/* NEW Badge - for products created in last 30 days */}
                            {(() => {
                                const thirtyDaysAgo = new Date();
                                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                                const productDate = new Date(product.createdAt);
                                const isNew = productDate > thirtyDaysAgo;

                                return isNew && (
                                    <div className={`absolute ${product.discountPrice && product.discountPrice < product.price ? 'top-12' : 'top-2'} left-2 z-10`}>
                                        <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-lg animate-pulse">
                                            NEW
                                        </span>
                                    </div>
                                );
                            })()}

                            {/* Wishlist Button */}
                            <div className="absolute top-2 right-2 z-10">
                                <WishlistButton productId={product.id} size="sm" />
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className={`product-info`}>
                            <span className="product-brand">{product.store.city || 'Oran'}</span>
                            <h3 className="product-title">{product.title}</h3>
                            <div className="product-price">
                                {product.discountPrice && product.discountPrice < product.price ? (
                                    <>
                                        <span className="line-through text-gray-400 text-sm mr-2">
                                            {product.price.toLocaleString()} DA
                                        </span>
                                        <span className="text-red-600 font-bold">
                                            {product.discountPrice.toLocaleString()} DA
                                        </span>
                                    </>
                                ) : (
                                    <>{product.price.toLocaleString()} DA</>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
