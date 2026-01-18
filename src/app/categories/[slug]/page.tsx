"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    const [products, setProducts] = useState<any[]>([]);
    const [category, setCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
    const [selectedWilaya, setSelectedWilaya] = useState<string>('');
    const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

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

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(res => res.json()),
            fetch('/api/categories').then(res => res.json()),
        ])
            .then(([productsData, categoriesData]) => {
                // Find category by slug
                const cat = categoriesData.find((c: any) => c.slug === slug);
                setCategory(cat);

                if (cat) {
                    // Filter products by category or subcategories
                    const categoryIds = [cat.id, ...cat.children.map((c: any) => c.id)];
                    const allProducts = Array.isArray(productsData) ? productsData : [];
                    const filtered = allProducts.filter((p: any) =>
                        categoryIds.includes(p.categoryId)
                    );
                    setProducts(filtered);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [slug]);

    // Get unique wilayas from products
    const availableWilayas = Array.from(new Set(products.map((p) => p.store.city))).sort();

    // Apply filters and sorting
    const filteredProducts = products
        .filter((p) => {
            // Filter by subcategories if any selected
            if (selectedSubcategories.length > 0) {
                return selectedSubcategories.includes(p.categoryId);
            }
            return true;
        })
        .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
        .filter((p) => !selectedWilaya || p.store.city === selectedWilaya)
        .sort((a, b) => {
            if (sortBy === 'price-asc') return a.price - b.price;
            if (sortBy === 'price-desc') return b.price - a.price;
            if (sortBy === 'name') return a.title.localeCompare(b.title);
            if (sortBy === 'wilaya') return a.store.city.localeCompare(b.store.city);
            return 0;
        });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading w-64 h-8 rounded"></div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Catégorie introuvable</h1>
                <Link href="/" className="text-indigo-600 hover:underline">← Retour à l'accueil</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header - Zalando Style (Minimalist) */}
            <div className="bg-gray-50 border-b border-gray-200 py-8">
                <div className="container">
                    <nav className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-gray-900 transition-colors">Accueil</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{category.name}</span>
                    </nav>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
                    <p className="text-sm text-gray-600">{products.length} {products.length > 1 ? 'produits' : 'produit'}</p>

                    {/* Subcategory Pills */}
                    {category.children && category.children.length > 0 && (
                        <div className="mt-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                            <div className="flex gap-2 min-w-max md:flex-wrap md:min-w-0">
                                <button
                                    onClick={() => setSelectedSubcategories([])}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedSubcategories.length === 0
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-900'
                                        }`}
                                >
                                    Tous
                                </button>
                                {category.children.map((sub: any) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => {
                                            if (selectedSubcategories.includes(sub.id)) {
                                                setSelectedSubcategories(selectedSubcategories.filter(id => id !== sub.id));
                                            } else {
                                                setSelectedSubcategories([...selectedSubcategories, sub.id]);
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedSubcategories.includes(sub.id)
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-900'
                                            }`}
                                    >
                                        {sub.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="container py-12">
                {/* Mobile Filter Button (Fixed at bottom) */}
                {/* Mobile Filter Button (Fixed Square at bottom right) */}
                <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden fixed bottom-24 right-6 z-[100] bg-[#006233] text-white w-14 h-14 rounded-xl shadow-2xl flex items-center justify-center hover:bg-[#004d28] transition-all active:scale-95 border-2 border-white"
                    aria-label="Filtres"
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                </button>

                {/* Mobile Filter Drawer - Zalando Style */}
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
                                {/* Subcategories */}
                                {category.children && category.children.length > 0 && (
                                    <div className="filter-section open">
                                        <div className="filter-section-header">
                                            <h4 className="filter-section-title">CATÉGORIES</h4>
                                        </div>
                                        <div className="filter-section-content">
                                            <div className="space-y-1">
                                                {category.children.map((sub: any) => (
                                                    <label key={sub.id} className="checkbox-filter">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSubcategories.includes(sub.id)}
                                                            onChange={() => {
                                                                if (selectedSubcategories.includes(sub.id)) {
                                                                    setSelectedSubcategories(selectedSubcategories.filter(id => id !== sub.id));
                                                                } else {
                                                                    setSelectedSubcategories([...selectedSubcategories, sub.id]);
                                                                }
                                                            }}
                                                        />
                                                        <span className="checkbox-filter-label">{sub.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

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
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-primary-blue transition-colors"
                                                />
                                                <span className="text-gray-500">-</span>
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={priceRange[1]}
                                                    onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-primary-blue transition-colors"
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

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Desktop Filters Sidebar - Zalando Style */}
                    <div className="hidden lg:block lg:col-span-1 space-y-1">
                        <div className="bg-white sticky top-24">
                            {/* Title */}
                            <div className="pb-4 mb-4 border-b border-gray-200">
                                <h3 className="text-base font-bold text-gray-900 uppercase letter-spacing-wide">Filtres</h3>
                            </div>

                            {/* Subcategories */}
                            {category.children && category.children.length > 0 && (
                                <div className="filter-section open">
                                    <div className="filter-section-header">
                                        <h4 className="filter-section-title">CATÉGORIES</h4>
                                    </div>
                                    <div className="filter-section-content">
                                        <div className="space-y-1">
                                            {category.children.map((sub: any) => (
                                                <label key={sub.id} className="checkbox-filter">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSubcategories.includes(sub.id)}
                                                        onChange={() => {
                                                            if (selectedSubcategories.includes(sub.id)) {
                                                                setSelectedSubcategories(selectedSubcategories.filter(id => id !== sub.id));
                                                            } else {
                                                                setSelectedSubcategories([...selectedSubcategories, sub.id]);
                                                            }
                                                        }}
                                                    />
                                                    <span className="checkbox-filter-label">{sub.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-primary-blue transition-colors"
                                            />
                                            <span className="text-gray-500">-</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-primary-blue transition-colors"
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
                                    <div className="space-y-1">
                                        <label className="checkbox-filter">
                                            <input
                                                type="radio"
                                                name="wilaya"
                                                checked={selectedWilaya === ''}
                                                onChange={() => setSelectedWilaya('')}
                                            />
                                            <span className="checkbox-filter-label">Toutes</span>
                                        </label>
                                        {availableWilayas.map((wilaya) => (
                                            <label key={wilaya} className="checkbox-filter">
                                                <input
                                                    type="radio"
                                                    name="wilaya"
                                                    checked={selectedWilaya === wilaya}
                                                    onChange={() => setSelectedWilaya(wilaya)}
                                                />
                                                <span className="checkbox-filter-label">{wilaya}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Reset Button - Sticky at bottom */}
                            <div className="pt-4 mt-4 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setPriceRange([0, 50000]);
                                        setSelectedWilaya('');
                                        setSelectedSubcategories([]);
                                    }}
                                    className="w-full py-2.5 text-sm font-semibold text-gray-700 border-2 border-gray-300 rounded hover:border-gray-900 hover:bg-gray-50 transition-all uppercase tracking-wide"
                                >
                                    Effacer tout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
                            <p className="text-gray-600">
                                <span className="font-bold text-gray-900">{filteredProducts.length}</span> produits
                            </p>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="input text-sm w-full sm:w-auto border-2 border-blue-600"
                            >
                                <option value="">Trier par</option>
                                <option value="name">Nom (A-Z)</option>
                                <option value="price-asc">Prix croissant</option>
                                <option value="price-desc">Prix décroissant</option>
                                <option value="wilaya">Wilaya (A-Z)</option>
                            </select>
                        </div>

                        {/* Grid - Replaced with reusable ProductGrid component */}
                        <ProductGrid products={filteredProducts} />

                    </div>
                </div>
            </div>
        </div>
    );
}
