"use client";

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<any[]>([]);
    const [category, setCategory] = useState<any>(null);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
    const [selectedWilaya, setSelectedWilaya] = useState<string>('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [filtersInitialized, setFiltersInitialized] = useState(false);

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
            fetch('/api/products', { cache: 'no-store' }).then(res => res.json()),
            fetch('/api/categories', { cache: 'no-store' }).then(res => res.json()),
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
                        categoryIds.includes(p.categoryId || p.Category?.id)
                    );
                    setProducts(filtered);

                    // Initialize filters from URL after data is loaded
                    if (!filtersInitialized) {
                        const subcatsParam = searchParams.get('subcats');
                        const minPriceParam = searchParams.get('minPrice');
                        const maxPriceParam = searchParams.get('maxPrice');
                        const wilayaParam = searchParams.get('wilaya');

                        if (subcatsParam) {
                            setSelectedSubcategories(subcatsParam.split(','));
                        }
                        if (minPriceParam || maxPriceParam) {
                            setPriceRange([
                                minPriceParam ? parseInt(minPriceParam) : 0,
                                maxPriceParam ? parseInt(maxPriceParam) : 50000
                            ]);
                        }
                        if (wilayaParam) {
                            setSelectedWilaya(wilayaParam);
                        }

                        setFiltersInitialized(true);
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [slug, searchParams, filtersInitialized]);

    // Helper function to get all descendant IDs recursively
    const getAllDescendantIds = (cat: any): string[] => {
        let ids = [cat.id];
        if (cat.children && cat.children.length > 0) {
            cat.children.forEach((c: any) => {
                ids = ids.concat(getAllDescendantIds(c));
            });
        }
        return ids;
    };

    // Update URL when filters change
    useEffect(() => {
        if (!filtersInitialized) return; // Don't update URL during initialization

        const params = new URLSearchParams();

        if (selectedSubcategories.length > 0) {
            params.set('subcats', selectedSubcategories.join(','));
        }
        if (priceRange[0] !== 0) {
            params.set('minPrice', priceRange[0].toString());
        }
        if (priceRange[1] !== 50000) {
            params.set('maxPrice', priceRange[1].toString());
        }
        if (selectedWilaya) {
            params.set('wilaya', selectedWilaya);
        }

        const queryString = params.toString();
        const newUrl = queryString ? `?${queryString}` : window.location.pathname;
        router.replace(newUrl, { scroll: false });
    }, [selectedSubcategories, priceRange, selectedWilaya, filtersInitialized, router]);

    // Get unique wilayas from products
    const availableWilayas = Array.from(new Set(products.map((p) => p.store?.city).filter(Boolean))).sort();

    // Apply filters and sorting
    const filteredProducts = products
        .filter((p) => {
            // Subcategory filter - if any subcategories are selected, only show products from those (including descendants)
            if (selectedSubcategories.length > 0 && category.children) {
                const productCategoryId = p.categoryId || p.Category?.id;

                // Recursively find a category by ID in the tree
                const findCategoryById = (cats: any[], id: string): any => {
                    for (const cat of cats) {
                        if (cat.id === id) return cat;
                        if (cat.children) {
                            const found = findCategoryById(cat.children, id);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                // Get all descendant IDs for selected subcategories
                const selectedDescendantIds: string[] = [];
                selectedSubcategories.forEach(selectedId => {
                    const selectedCat = findCategoryById(category.children, selectedId);
                    if (selectedCat) {
                        selectedDescendantIds.push(...getAllDescendantIds(selectedCat));
                    }
                });

                if (!selectedDescendantIds.includes(productCategoryId)) {
                    return false;
                }
            }

            // Price filter
            const price = p.discountPrice || p.price;
            if (price < priceRange[0] || price > priceRange[1]) return false;

            // Wilaya filter
            if (selectedWilaya && p.store?.city !== selectedWilaya) return false;

            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.title.localeCompare(b.title);
            if (sortBy === 'price-asc') return (a.discountPrice || a.price) - (b.discountPrice || b.price);
            if (sortBy === 'price-desc') return (b.discountPrice || b.price) - (a.discountPrice || a.price);
            if (sortBy === 'wilaya') return (a.store?.city || '').localeCompare(b.store?.city || '');
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
                {/* If category has children, show tab filter system */}
                {category.children && category.children.length > 0 ? (
                    <div className="space-y-6">
                        {/* Subcategory Tabs Filter */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Filtrer par sous-catégorie</h2>
                                {selectedSubcategories.length > 0 && (
                                    <button
                                        onClick={() => setSelectedSubcategories([])}
                                        className="text-sm text-gray-600 hover:text-[#006233] underline"
                                    >
                                        Tout afficher
                                    </button>
                                )}
                            </div>

                            {/* Grid layout for subcategories - visible all at once */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {category.children.map((child: any) => {
                                    // Get all descendant IDs for this subcategory (recursive)
                                    const getAllDescendantIds = (cat: any): string[] => {
                                        let ids = [cat.id];
                                        if (cat.children && cat.children.length > 0) {
                                            cat.children.forEach((c: any) => {
                                                ids = ids.concat(getAllDescendantIds(c));
                                            });
                                        }
                                        return ids;
                                    };

                                    const childDescendantIds = getAllDescendantIds(child);
                                    const childProducts = products.filter((p: any) => {
                                        const productCategoryId = p.categoryId || p.Category?.id;
                                        return childDescendantIds.includes(productCategoryId);
                                    });

                                    const isSelected = selectedSubcategories.includes(child.id);
                                    const hasChildren = child.children && child.children.length > 0;
                                    const isExpanded = expandedCategory === child.id;

                                    return (
                                        <div key={child.id} className="flex flex-col">
                                            <button
                                                onClick={() => {
                                                    // If has children, toggle expansion
                                                    if (hasChildren) {
                                                        setExpandedCategory(isExpanded ? null : child.id);
                                                    }
                                                    // Also toggle selection
                                                    if (isSelected) {
                                                        setSelectedSubcategories(selectedSubcategories.filter(id => id !== child.id));
                                                    } else {
                                                        setSelectedSubcategories([...selectedSubcategories, child.id]);
                                                    }
                                                }}
                                                className={`
                                                    flex flex-col items-center justify-center gap-1 p-4 rounded-xl border-2 font-medium text-sm transition-all min-h-[100px]
                                                    ${isSelected
                                                        ? 'bg-[#006233] border-[#006233] text-white shadow-lg'
                                                        : 'bg-white border-gray-300 text-gray-700 hover:border-[#006233] hover:shadow-md'
                                                    }
                                                `}
                                            >
                                                <span className="text-center font-semibold">{child.name}</span>
                                                <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                                    {childProducts.length} produit{childProducts.length > 1 ? 's' : ''}
                                                </span>
                                                {hasChildren && (
                                                    <svg
                                                        className={`w-4 h-4 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                )}
                                            </button>

                                            {/* Expanded child subcategories */}
                                            {hasChildren && isExpanded && child.children && (
                                                <div className="mt-2 ml-2 pl-3 border-l-2 border-[#006233] space-y-2 animate-fade-in">
                                                    {child.children.map((grandchild: any) => {
                                                        // Use recursive function for grandchildren too
                                                        const getAllDescendantIds = (cat: any): string[] => {
                                                            let ids = [cat.id];
                                                            if (cat.children && cat.children.length > 0) {
                                                                cat.children.forEach((c: any) => {
                                                                    ids = ids.concat(getAllDescendantIds(c));
                                                                });
                                                            }
                                                            return ids;
                                                        };

                                                        const grandchildDescendantIds = getAllDescendantIds(grandchild);
                                                        const grandchildProducts = products.filter((p: any) => {
                                                            const productCategoryId = p.categoryId || p.Category?.id;
                                                            return grandchildDescendantIds.includes(productCategoryId);
                                                        });
                                                        const isGrandchildSelected = selectedSubcategories.includes(grandchild.id);

                                                        return (
                                                            <button
                                                                key={grandchild.id}
                                                                onClick={() => {
                                                                    if (isGrandchildSelected) {
                                                                        setSelectedSubcategories(selectedSubcategories.filter(id => id !== grandchild.id));
                                                                    } else {
                                                                        setSelectedSubcategories([...selectedSubcategories, grandchild.id]);
                                                                    }
                                                                }}
                                                                className={`
                                                                    w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all
                                                                    ${isGrandchildSelected
                                                                        ? 'bg-[#006233] text-white'
                                                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                                    }
                                                                `}
                                                            >
                                                                {grandchild.name} ({grandchildProducts.length})
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Filtrer par prix</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={priceRange[0]}
                                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                        className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#006233]"
                                        placeholder="Min"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        type="number"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                                        className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#006233]"
                                        placeholder="Max"
                                    />
                                    <span className="text-sm text-gray-600">DA</span>
                                </div>

                                {/* Quick price filters */}
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => setPriceRange([0, 2000])}
                                        className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:border-[#006233] hover:text-[#006233] transition-colors"
                                    >
                                        &lt; 2000 DA
                                    </button>
                                    <button
                                        onClick={() => setPriceRange([2000, 5000])}
                                        className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:border-[#006233] hover:text-[#006233] transition-colors"
                                    >
                                        2000 - 5000 DA
                                    </button>
                                    <button
                                        onClick={() => setPriceRange([5000, 10000])}
                                        className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:border-[#006233] hover:text-[#006233] transition-colors"
                                    >
                                        5000 - 10000 DA
                                    </button>
                                    <button
                                        onClick={() => setPriceRange([10000, 50000])}
                                        className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:border-[#006233] hover:text-[#006233] transition-colors"
                                    >
                                        &gt; 10000 DA
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                                <p className="text-gray-600">
                                    <span className="font-bold text-gray-900">{filteredProducts.length}</span> produits
                                    {selectedSubcategories.length > 0 && (
                                        <span className="text-sm ml-2">
                                            dans {selectedSubcategories.length} {selectedSubcategories.length > 1 ? 'catégories' : 'catégorie'}
                                        </span>
                                    )}
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

                            {/* Active Filters Tags */}
                            {(selectedSubcategories.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 50000 || selectedWilaya) && (
                                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                            </svg>
                                            Filtres actifs ({
                                                selectedSubcategories.length +
                                                (priceRange[0] !== 0 || priceRange[1] !== 50000 ? 1 : 0) +
                                                (selectedWilaya ? 1 : 0)
                                            })
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setSelectedSubcategories([]);
                                                setPriceRange([0, 50000]);
                                                setSelectedWilaya('');
                                            }}
                                            className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Effacer tout
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {/* Subcategory tags */}
                                        {selectedSubcategories.map(subcatId => {
                                            const findCategoryById = (cats: any[], id: string): any => {
                                                for (const cat of cats) {
                                                    if (cat.id === id) return cat;
                                                    if (cat.children) {
                                                        const found = findCategoryById(cat.children, id);
                                                        if (found) return found;
                                                    }
                                                }
                                                return null;
                                            };
                                            const subcat = findCategoryById(allCategories, subcatId);
                                            return subcat ? (
                                                <span
                                                    key={subcatId}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006233] text-white rounded-full text-xs font-medium"
                                                >
                                                    {subcat.name}
                                                    <button
                                                        onClick={() => setSelectedSubcategories(selectedSubcategories.filter(id => id !== subcatId))}
                                                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            ) : null;
                                        })}

                                        {/* Price range tag */}
                                        {(priceRange[0] !== 0 || priceRange[1] !== 50000) && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-medium">
                                                {priceRange[0]} - {priceRange[1]} DA
                                                <button
                                                    onClick={() => setPriceRange([0, 50000])}
                                                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </span>
                                        )}

                                        {/* Wilaya tag */}
                                        {selectedWilaya && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-full text-xs font-medium">
                                                📍 {selectedWilaya}
                                                <button
                                                    onClick={() => setSelectedWilaya('')}
                                                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <ProductGrid products={filteredProducts} />
                        </div>
                    </div>
                ) : (
                    /* Regular category view with sidebar and filters */
                    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
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
                        <main>
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
                )}
            </div>
        </div>
    );
}
