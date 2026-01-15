"use client";

import { useState, useEffect } from 'react';
import ProductGrid from '@/components/ProductGrid';

interface HomeProductsClientProps {
    products: any[];
}

export default function HomeProductsClient({ products }: HomeProductsClientProps) {
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
    const [selectedWilaya, setSelectedWilaya] = useState<string>('');

    // Prevent body scroll when mobile filters are open
    useEffect(() => {
        if (showMobileFilters) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showMobileFilters]);

    // Get unique wilayas from products
    const availableWilayas = Array.from(new Set(products.map((p) => p.store.city))).sort();

    // Apply filters
    const filteredProducts = products
        .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
        .filter((p) => !selectedWilaya || p.store.city === selectedWilaya);

    return (
        <>
            {/* Mobile Filter Button (Fixed at bottom right) - Minimalist */}
            <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden fixed bottom-6 right-6 z-50 bg-white text-black w-14 h-14 rounded-md shadow-lg border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-95"
                aria-label="Filtres"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            </button>

            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
                <>
                    {/* Backdrop */}
                    <div
                        className="lg:hidden fixed inset-0 bg-black/40 z-[60] animate-fade-in"
                        onClick={() => setShowMobileFilters(false)}
                    />

                    {/* Drawer */}
                    <div className="lg:hidden fixed inset-y-0 left-0 w-full max-w-sm bg-white z-[70] shadow-2xl overflow-y-auto animate-slide-in-left">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
                            <h3 className="text-base font-bold text-[#006233] uppercase tracking-wide">Filtres</h3>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="p-2 text-gray-500 hover:text-[#006233] hover:bg-green-50 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 space-y-1">
                            {/* Price Range */}
                            <div className="filter-section open">
                                <div className="filter-section-header">
                                    <h4 className="filter-section-title">PRIX</h4>
                                </div>
                                <div className="filter-section-content">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={priceRange[0]}
                                                onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#006233] transition-colors"
                                            />
                                            <span className="text-gray-500">-</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#006233] transition-colors"
                                            />
                                        </div>
                                        <div className="text-xs text-gray-600 bg-gray-50 rounded px-3 py-2">
                                            {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} DA
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Wilaya Filter */}
                            <div className="filter-section open">
                                <div className="filter-section-header">
                                    <h4 className="filter-section-title">WILAYA</h4>
                                </div>
                                <div className="filter-section-content">
                                    <div className="space-y-1 max-h-48 overflow-y-auto">
                                        <label className="checkbox-filter">
                                            <input
                                                type="radio"
                                                name="wilaya-mobile"
                                                checked={selectedWilaya === ''}
                                                onChange={() => setSelectedWilaya('')}
                                            />
                                            <span className="checkbox-filter-label">Toutes</span>
                                        </label>
                                        {availableWilayas.map((wilaya) => (
                                            <label key={wilaya} className="checkbox-filter">
                                                <input
                                                    type="radio"
                                                    name="wilaya-mobile"
                                                    checked={selectedWilaya === wilaya}
                                                    onChange={() => setSelectedWilaya(wilaya)}
                                                />
                                                <span className="checkbox-filter-label">{wilaya}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer - Sticky Bottom */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-2">
                            <button
                                onClick={() => {
                                    setPriceRange([0, 50000]);
                                    setSelectedWilaya('');
                                }}
                                className="w-full py-2.5 text-sm font-semibold text-gray-700 border-2 border-gray-300 rounded hover:border-gray-900 hover:bg-gray-50 transition-all uppercase tracking-wide"
                            >
                                Effacer tout
                            </button>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="w-full py-2.5 text-sm font-semibold text-white bg-gray-900 rounded hover:bg-gray-800 transition-all uppercase tracking-wide"
                            >
                                Voir {filteredProducts.length} produits
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Product Sections */}
            <section className="pb-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-black mb-2">🔥 Nouveautés</h2>
                    <p className="text-gray-600">Les derniers articles ajoutés</p>
                </div>
                <ProductGrid products={filteredProducts.slice(0, 12)} />
            </section>

            {/* Femmes */}
            <section className="pb-16 border-t border-gray-100 pt-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">👗 Mode Femme</h2>
                    </div>
                    <a href="/categories/femmes" className="text-[#006233] font-semibold hover:underline">
                        Voir tout →
                    </a>
                </div>
                <ProductGrid
                    products={filteredProducts.filter(p => p.category?.slug.includes('femmes') || p.category?.parent?.slug.includes('femmes')).slice(0, 4)}
                />
            </section>

            {/* Hommes */}
            <section className="pb-16 border-t border-gray-100 pt-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">👔 Mode Homme</h2>
                    </div>
                    <a href="/categories/hommes" className="text-[#006233] font-semibold hover:underline">
                        Voir tout →
                    </a>
                </div>
                <ProductGrid
                    products={filteredProducts.filter(p => p.category?.slug.includes('hommes') || p.category?.slug.includes('homme') || p.category?.parent?.slug.includes('hommes') || p.category?.parent?.slug.includes('homme')).slice(0, 4)}
                />
            </section>

            {/* Enfants */}
            <section className="pb-16 border-t border-gray-100 pt-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">👶 Mode Enfant</h2>
                    </div>
                    <a href="/categories/enfants" className="text-[#006233] font-semibold hover:underline">
                        Voir tout →
                    </a>
                </div>
                <ProductGrid
                    products={filteredProducts.filter(p => p.category?.slug === 'enfants' || p.category?.parent?.slug === 'enfants').slice(0, 4)}
                />
            </section>

            {/* Accessoires */}
            <section className="pb-16 border-t border-gray-100 pt-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">👜 Accessoires</h2>
                    </div>
                    <a href="/categories/accessoires" className="text-[#006233] font-semibold hover:underline">
                        Voir tout →
                    </a>
                </div>
                <ProductGrid
                    products={filteredProducts.filter(p => p.category?.slug === 'accessoires' || p.category?.parent?.slug === 'accessoires').slice(0, 4)}
                />
            </section>
        </>
    );
}
