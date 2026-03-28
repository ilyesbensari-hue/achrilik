'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import ProductGrid from '@/components/ProductGrid';

export default function NouveautesPage() {
    const { tr, lang } = useTranslation();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products?sort=recent', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                // Sort by createdAt descending & take 40 newest
                const sorted = Array.isArray(data)
                    ? [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 40)
                    : [];
                setProducts(sorted);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#006233] to-[#004d28] text-white py-12">
                <div className="container">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-white/70 mb-6 flex-wrap">
                        <Link href="/" className="hover:text-white transition-colors">
                            {lang === 'ar' ? 'الرئيسية' : 'Accueil'}
                        </Link>
                        <span>/</span>
                        <span className="text-white font-medium">
                            {lang === 'ar' ? 'وصل حديثاً' : 'Nouveautés'}
                        </span>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                            🆕
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black">
                                {lang === 'ar' ? tr('new_arrivals_title') : tr('new_arrivals_title')}
                            </h1>
                            <p className="text-white/80 mt-1">
                                {lang === 'ar' ? tr('new_arrivals_sub') : tr('new_arrivals_sub')}
                            </p>
                        </div>
                    </div>

                    {!loading && (
                        <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            {products.length} {lang === 'ar' ? 'منتج متاح' : 'produits disponibles'}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="container py-8">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl aspect-[3/4] animate-pulse" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-gray-500 text-lg">
                            {lang === 'ar' ? 'لا توجد منتجات متاحة حالياً' : 'Aucun produit disponible pour le moment'}
                        </p>
                        <Link href="/categories" className="mt-4 inline-block text-[#006233] hover:underline font-medium">
                            {lang === 'ar' ? 'تصفح الفئات' : 'Explorer les catégories'}
                        </Link>
                    </div>
                ) : (
                    <ProductGrid products={products} />
                )}
            </div>
        </div>
    );
}
