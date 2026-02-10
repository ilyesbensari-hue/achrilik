'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: string;
    title: string;
    price: number;
    image: string;
    images: string;
    discountPrice?: number;
    promotionLabel?: string;
    slug: string;
    Category?: {
        name: string;
    };
}

export default function PromotionsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                // Use optimized promotions API instead of fetching all products
                const res = await fetch('/api/products/promotions');

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const promos = await res.json();

                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Promotions] Found ${promos.length} products in promotion`);
                }

                setProducts(promos);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('[Promotions] Error fetching:', error);
                }
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, []);


    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-700">Chargement des promotions...</p>
                    <p className="text-sm text-gray-500 mt-2">Recherche des meilleures offres 🎁</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-2">🎉 Promotions</h1>
                    <p className="text-pink-100">Profitez de nos meilleures offres !</p>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {products.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🏷️</div>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                            Aucune promotion disponible
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Revenez bientôt pour découvrir nos offres spéciales !
                        </p>
                        <Link
                            href="/"
                            className="inline-block bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <p className="text-gray-600">
                                {products.length} produit{products.length > 1 ? 's' : ''} en promotion
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map(product => {
                                const imageUrl = product.images.split(',')[0];
                                const discountPercent = product.discountPrice
                                    ? Math.round((1 - product.discountPrice / product.price) * 100)
                                    : 0;

                                return (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                                            <Image
                                                src={imageUrl}
                                                alt={product.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {/* Promotion Badge */}
                                            {product.promotionLabel && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                                    {product.promotionLabel}
                                                </div>
                                            )}
                                            {discountPercent > 0 && !product.promotionLabel && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                                    -{discountPercent}%
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-pink-600 transition">
                                                {product.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-3">
                                                {product.Category?.name || 'Produit'}
                                            </p>

                                            {/* Price */}
                                            <div className="flex items-baseline gap-2">
                                                {product.discountPrice ? (
                                                    <>
                                                        <span className="text-xl font-bold text-pink-600">
                                                            {product.discountPrice.toLocaleString()} DA
                                                        </span>
                                                        <span className="text-sm text-gray-400 line-through">
                                                            {product.price.toLocaleString()} DA
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-xl font-bold text-gray-800">
                                                        {product.price.toLocaleString()} DA
                                                    </span>
                                                )}
                                            </div>

                                            {/* Savings */}
                                            {product.discountPrice && (
                                                <p className="text-xs text-green-600 font-medium mt-1">
                                                    Économisez {(product.price - product.discountPrice).toLocaleString()} DA
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
