"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    const [products, setProducts] = useState<any[]>([]);
    const [category, setCategory] = useState<any>(null);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
    const [selectedWilaya, setSelectedWilaya] = useState<string>('');
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
                setAllCategories(categoriesData);

                // Find category by slug - search recursively
                const findCategory = (cats: any[], targetSlug: string): any => {
                    for (const cat of cats) {
                        if (cat.slug === targetSlug) return cat;
                        if (cat.children && cat.children.length > 0) {
                            const found = findCategory(cat.children, targetSlug);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                const cat = findCategory(categoriesData, slug);
                setCategory(cat);

                if (cat) {
                    // Get all descendant category IDs
                    const getAllDescendantIds = (category: any): string[] => {
                        let ids = [category.id];
                        if (category.children && category.children.length > 0) {
                            category.children.forEach((child: any) => {
                                ids = ids.concat(getAllDescendantIds(child));
                            });
                        }
                        return ids;
                    };

                    const categoryIds = getAllDescendantIds(cat);
                    const allProducts = Array.isArray(productsData) ? productsData : [];
                    const filtered = allProducts.filter((p: any) =>
                        categoryIds.includes(p.CategoryId)
                    );
                    setProducts(filtered);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [slug]);

    // Get unique wilayas from products
    const availableWilayas = Array.from(new Set(products.map((p) => p.Store.city))).sort();

    // Apply filters and sorting
    const filteredProducts = products
        .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
        .filter((p) => !selectedWilaya || p.Store.city === selectedWilaya)
        .sort((a, b) => {
            if (sortBy === 'price-asc') return a.price - b.price;
            if (sortBy === 'price-desc') return b.price - a.price;
            if (sortBy === 'name') return a.title.localeCompare(b.title);
            if (sortBy === 'wilaya') return a.Store.city.localeCompare(b.Store.city);
            return 0;
        });

    // Helper to build breadcrumbs
    const getBreadcrumbs = () => {
        if (!category || allCategories.length === 0) return [];

        const path: Array<{ label: string; href?: string }> = [];

        // Find category path recursively
        const findPath = (cats: any[], targetId: string, currentPath: any[]): any[] | null => {
            for (const cat of cats) {
                const newPath = [...currentPath, cat];
                if (cat.id === targetId) return newPath;
                if (cat.children && cat.children.length > 0) {
                    const found = findPath(cat.children, targetId, newPath);
                    if (found) return found;
                }
            }
            return null;
        };

        const categoryPath = findPath(allCategories, category.id, []);
        if (categoryPath) {
            categoryPath.forEach((cat, index) => {
                path.push({
                    label: cat.name,
                    href: index < categoryPath.length - 1 ? `/categories/${cat.slug}` : undefined
                });
            });
        }

        return path;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006233]"></div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Catégorie introuvable</h1>
                <Link href="/" className="text-[#006233] hover:underline">← Retour à l'accueil</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Clean and Simple */}
            <div className="bg-white border-b border-gray-200 py-6">
                <div className="container">
                    <Breadcrumbs items={getBreadcrumbs()} />

                    <div className="mt-4">
                        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {filteredProducts.length} {filteredProducts.length > 1 ? 'produits' : 'produit'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container py-8">
                <div className={`grid gap-8 ${category.children && category.children.length > 0 ? 'lg:grid-cols-[250px_1fr]' : 'grid-cols-1'}`}>
                    {/* Sidebar - Only if subcategories exist */}
                    {category.children && category.children.length > 0 && (
                        <aside className="hidden lg:block">
                            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                                    Sous-catégories
                                </h3>
                                <nav>
                                    <ul className="space-y-1">
                                        {category.children.map((child: any) => (
                                            <li key={child.id}>
                                                <Link
                                                    href={`/categories/${child.slug}`}
                                                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#006233] rounded transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{child.name}</span>
                                                        {child._count?.Product > 0 && (
                                                            <span className="text-xs text-gray-400">
                                                                {child._count.Product}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        </aside>
                    )}

                    {/* Mobile Subcategories Dropdown */}
                    {category.children && category.children.length > 0 && (
                        <div className="lg:hidden mb-6">
                            <details className="bg-white rounded-lg border border-gray-200">
                                <summary className="px-4 py-3 cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                                    <span>Sous-catégories ({category.children.length})</span>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>
                                <nav className="px-4 pb-4 pt-2">
                                    <ul className="space-y-1">
                                        {category.children.map((child: any) => (
                                            <li key={child.id}>
                                                <Link
                                                    href={`/categories/${child.slug}`}
                                                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#006233] rounded"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{child.name}</span>
                                                        {child._count?.Product > 0 && (
                                                            <span className="text-xs text-gray-400">
                                                                {child._count.Product}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </details>
                        </div>
                    )}

                    {/* Main Content - Products */}
                    <main>
                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden fixed bottom-24 right-6 z-50 bg-[#006233] text-white w-14 h-14 rounded-xl shadow-2xl flex items-center justify-center hover:bg-[#004d28] transition-all"
                            aria-label="Filtres"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </button>

                        {/* Mobile Filter Drawer */}
                        {showMobileFilters && (
                            <>
                                <div
                                    className="fixed inset-0 bg-black/40 z-40"
                                    onClick={() => setShowMobileFilters(false)}
                                />
                                <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white z-50 shadow-2xl overflow-y-auto">
                                    <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                                        <h3 className="font-bold text-[#006233]">FILTRES</h3>
                                        <button onClick={() => setShowMobileFilters(false)} className="p-2">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="p-4 space-y-6">
                                        <div>
                                            <h4 className="font-semibold mb-3">PRIX</h4>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={priceRange[0]}
                                                    onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                                                    className="w-full px-3 py-2 border rounded"
                                                />
                                                <span>-</span>
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={priceRange[1]}
                                                    onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                                                    className="w-full px-3 py-2 border rounded"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-600 mt-2">
                                                {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} DA
                                            </p>
                                        </div>

                                        {availableWilayas.length > 1 && (
                                            <div>
                                                <h4 className="font-semibold mb-3">WILAYA</h4>
                                                <div className="space-y-2">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            checked={selectedWilaya === ''}
                                                            onChange={() => setSelectedWilaya('')}
                                                        />
                                                        <span>Toutes</span>
                                                    </label>
                                                    {availableWilayas.map((wilaya) => (
                                                        <label key={wilaya} className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                checked={selectedWilaya === wilaya}
                                                                onChange={() => setSelectedWilaya(wilaya)}
                                                            />
                                                            <span>{wilaya}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="sticky bottom-0 bg-white border-t p-4 space-y-2">
                                        <button
                                            onClick={() => {
                                                setPriceRange([0, 50000]);
                                                setSelectedWilaya('');
                                            }}
                                            className="w-full py-2 border-2 rounded font-semibold"
                                        >
                                            Effacer tout
                                        </button>
                                        <button
                                            onClick={() => setShowMobileFilters(false)}
                                            className="w-full py-2 bg-gray-900 text-white rounded font-semibold"
                                        >
                                            Voir {filteredProducts.length} produits
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Products Section */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                                <p className="text-gray-600">
                                    <span className="font-bold text-gray-900">{filteredProducts.length}</span> produits
                                </p>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#006233]"
                                >
                                    <option value="">Trier par</option>
                                    <option value="name">Nom (A-Z)</option>
                                    <option value="price-asc">Prix croissant</option>
                                    <option value="price-desc">Prix décroissant</option>
                                    <option value="wilaya">Wilaya (A-Z)</option>
                                </select>
                            </div>

                            <ProductGrid products={filteredProducts} />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
