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
                    <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-gray-900 tracking-tight">
                        {title}
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">{products.length}</span>
                    </h3>
                )}

                {/* Mobile View Switcher - Minimalist */}
                <div className="flex items-center gap-0.5 border border-gray-200 rounded-md overflow-hidden">
                    <button
                        onClick={() => setViewMode('unique')}
                        className={`p-2 transition-all ${viewMode === 'unique' ? 'bg-black text-white' : 'bg-white text-gray-400 hover:text-black'}`}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="0" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('deux')}
                        className={`p-2 transition-all ${viewMode === 'deux' ? 'bg-black text-white' : 'bg-white text-gray-400 hover:text-black'}`}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 5a1 1 0 011-1h6a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM12 5a1 1 0 011-1h6a1 1 0 011 1v14a1 1 0 01-1 1h-6a1 1 0 01-1-1V5z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className={`grid gap-x-4 gap-y-8 transition-all duration-300 ease-in-out ${viewMode === 'unique' ? 'grid-cols-1' :
                viewMode === 'deux' ? 'grid-cols-2 lg:grid-cols-4' :
                    'grid-cols-3 lg:grid-cols-5'
                }`}>
                {products.map((product) => (
                    <Link
                        href={`/products/${product.id}`}
                        key={product.id}
                        className={`product-card-zalando group ${viewMode === 'unique' ? 'flex flex-row gap-4 !aspect-auto' : ''}`}
                    >
                        {/* Image Container */}
                        <div className={`product-image ${viewMode === 'unique' ? '!w-1/3 !aspect-[4/5] rounded-md overflow-hidden' : ''}`}>
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
                        </div>

                        {/* Product Info */}
                        <div className={`product-info ${viewMode === 'unique' ? '!p-0 flex flex-col justify-center' : ''}`}>
                            <span className="product-brand">{product.store.city || 'Oran'}</span>
                            <h3 className="product-title">{product.title}</h3>
                            <div className="product-price">
                                {product.price.toLocaleString()} DA
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
