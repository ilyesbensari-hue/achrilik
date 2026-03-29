'use client';

import { useEffect, useState } from 'react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/formatPrice';

export default function RecentlyViewed() {
    const { ids } = useRecentlyViewed();
    const { lang } = useTranslation();
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        if (ids.length === 0) return;
        // Fetch products for the recent IDs
        Promise.all(
            ids.slice(0, 6).map(id =>
                fetch(`/api/products/${id}`).then(r => r.ok ? r.json() : null).catch(() => null)
            )
        ).then(results => setProducts(results.filter(Boolean)));
    }, [ids]);

    if (products.length === 0) return null;

    return (
        <section className="py-8 px-4 md:px-0">
            <div className="container">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        {/* ✅ PROB-03 FIX: Emoji moved outside heading text for clean crawling */}
                        <span aria-hidden="true">🕐</span>
                        {lang === 'ar' ? 'شاهدته مؤخراً' : 'Récemment consultés'}
                    </h2>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {products.map(product => {
                        const imgSrc = product.images
                            ? (Array.isArray(product.images) ? product.images[0] : product.images.split(',')[0])
                            : null;
                        const price = product.discountPrice || product.price;

                        return (
                            <Link
                                key={product.id}
                                href={`/products/${product.id}`}
                                className="flex-shrink-0 w-32 group"
                            >
                                <div className="relative w-32 h-40 rounded-xl overflow-hidden bg-gray-100 mb-2">
                                    {imgSrc ? (
                                        <Image
                                            src={imgSrc}
                                            alt={product.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300 text-3xl">📦</div>
                                    )}
                                </div>
                                <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight mb-1">
                                    {product.title}
                                </p>
                                <p className="text-xs font-bold text-[#006233]">
                                    {formatPrice(price)}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
