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
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>('categories');
    const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
    const [filtersInitialized, setFiltersInitialized] = useState(false);

    // Helper: Detect if this is a shoe category
    const isShoeCategory = () => {
        if (!category) return false;
        const slug = category.slug?.toLowerCase() || '';
        const name = category.name?.toLowerCase() || '';
        return slug.includes('chaussure') ||
            slug.includes('basket') ||
            slug.includes('soulier') ||
            name.includes('chaussure') ||
            name.includes('basket');
    };

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
                        const sizesParam = searchParams.get('sizes');

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
                        if (sizesParam) {
                            setSelectedSizes(sizesParam.split(','));
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
        if (selectedSizes.length > 0) {
            params.set('sizes', selectedSizes.join(','));
        }

        const queryString = params.toString();
        const newUrl = queryString ? `?${queryString}` : window.location.pathname;
        router.replace(newUrl, { scroll: false });
    }, [selectedSubcategories, priceRange, selectedWilaya, selectedSizes, filtersInitialized, router]);

    // Get unique wilayas from products
    const availableWilayas = Array.from(new Set(products.map((p) => p.store?.city).filter(Boolean))).sort();

    // Get unique sizes from product variants
    const availableSizes = Array.from(
        new Set(
            products.flatMap(p =>
                p.Variant?.map((v: any) => v.size).filter(Boolean) || []
            )
        )
    ).sort((a, b) => {
        // Numeric sort for shoe sizes (36, 37, 38...)
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        // Alphabetic sort for clothing sizes (S, M, L...)
        return a.localeCompare(b);
    });

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

            // Size filter
            if (selectedSizes.length > 0) {
                const productSizes = p.Variant?.map((v: any) => v.size) || [];
                const hasSelectedSize = selectedSizes.some(size => productSizes.includes(size));
                if (!hasSelectedSize) return false;
            }

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
            {/* Header with Filter Button */}
            <div className="bg-white border-b border-gray-200 py-6">
                <div className="container">
                    <Breadcrumbs items={getBreadcrumbs()} />

                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {filteredProducts.length} {filteredProducts.length > 1 ? 'produits' : 'produit'}
                            </p>
                        </div>

                        {/* Filter Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterPanel(!showFilterPanel)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#006233] text-white rounded-lg hover:bg-[#004d28] transition-all shadow-md hover:shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                                <span className="font-semibold">Filtrer</span>
                                {(selectedSubcategories.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 50000 || selectedWilaya || selectedSizes.length > 0) && (
                                    <span className="ml-1 px-2 py-0.5 bg-white text-[#006233] rounded-full text-xs font-bold">
                                        {selectedSubcategories.length + (priceRange[0] !== 0 || priceRange[1] !== 50000 ? 1 : 0) + (selectedWilaya ? 1 : 0) + selectedSizes.length}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Filter Panel */}
                            {showFilterPanel && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowFilterPanel(false)}
                                    />

                                    {/* Panel */}
                                    <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-y-auto">
                                        {/* Header */}
                                        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-xl">
                                            <h3 className="font-bold text-gray-900">Filtres</h3>
                                            <button
                                                onClick={() => setShowFilterPanel(false)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="p-5 space-y-4">
                                            {/* Categories Accordion */}
                                            {category.children && category.children.length > 0 && (
                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => setExpandedSection(expandedSection === 'categories' ? null : 'categories')}
                                                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <span className="font-semibold text-gray-900">Catégories</span>
                                                        <svg
                                                            className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === 'categories' ? 'rotate-180' : ''}`}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    {expandedSection === 'categories' && (
                                                        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                                                            {category.children.map((child: any) => {
                                                                const isSelected = selectedSubcategories.includes(child.id);
                                                                return (
                                                                    <div key={child.id}>
                                                                        <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isSelected}
                                                                                onChange={() => {
                                                                                    if (isSelected) {
                                                                                        setSelectedSubcategories(selectedSubcategories.filter(id => id !== child.id));
                                                                                    } else {
                                                                                        setSelectedSubcategories([...selectedSubcategories, child.id]);
                                                                                    }
                                                                                }}
                                                                                className="w-4 h-4 text-[#006233] border-gray-300 rounded focus:ring-[#006233]"
                                                                            />
                                                                            <span className={`flex-1 text-sm ${isSelected ? 'font-medium text-[#006233]' : 'text-gray-700'}`}>
                                                                                {child.name}
                                                                            </span>
                                                                        </label>

                                                                        {/* Sub-children */}
                                                                        {child.children && child.children.length > 0 && (
                                                                            <div className="ml-7 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                                                                                {child.children.map((subChild: any) => {
                                                                                    const isSubSelected = selectedSubcategories.includes(subChild.id);
                                                                                    return (
                                                                                        <label key={subChild.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={isSubSelected}
                                                                                                onChange={() => {
                                                                                                    if (isSubSelected) {
                                                                                                        setSelectedSubcategories(selectedSubcategories.filter(id => id !== subChild.id));
                                                                                                    } else {
                                                                                                        setSelectedSubcategories([...selectedSubcategories, subChild.id]);
                                                                                                    }
                                                                                                }}
                                                                                                className="w-3.5 h-3.5 text-[#006233] border-gray-300 rounded focus:ring-[#006233]"
                                                                                            />
                                                                                            <span className={`text-xs ${isSubSelected ? 'font-medium text-[#006233]' : 'text-gray-600'}`}>
                                                                                                {subChild.name}
                                                                                            </span>
                                                                                        </label>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Price Accordion */}
                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedSection(expandedSection === 'price' ? null : 'price')}
                                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                                >
                                                    <span className="font-semibold text-gray-900">Prix</span>
                                                    <svg
                                                        className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === 'price' ? 'rotate-180' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>

                                                {expandedSection === 'price' && (
                                                    <div className="p-4 space-y-4">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                placeholder="Min"
                                                                value={priceRange[0] === 0 ? '' : priceRange[0]}
                                                                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006233] focus:border-[#006233]"
                                                            />
                                                            <span className="text-gray-400">-</span>
                                                            <input
                                                                type="number"
                                                                placeholder="Max"
                                                                value={priceRange[1] === 50000 ? '' : priceRange[1]}
                                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006233] focus:border-[#006233]"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            {[
                                                                { label: '< 2000 DA', range: [0, 2000] },
                                                                { label: '2k - 5k DA', range: [2000, 5000] },
                                                                { label: '5k - 10k DA', range: [5000, 10000] },
                                                                { label: '> 10k DA', range: [10000, 50000] },
                                                            ].map((option, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => setPriceRange(option.range as [number, number])}
                                                                    className={`px-3 py-2 text-xs rounded-lg border transition-all ${priceRange[0] === option.range[0] && priceRange[1] === option.range[1]
                                                                        ? 'bg-[#006233] text-white border-[#006233]'
                                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#006233]'
                                                                        }`}
                                                                >
                                                                    {option.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Wilaya Accordion */}
                                            {availableWilayas.length > 0 && (
                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => setExpandedSection(expandedSection === 'wilaya' ? null : 'wilaya')}
                                                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <span className="font-semibold text-gray-900">Wilaya</span>
                                                        <svg
                                                            className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === 'wilaya' ? 'rotate-180' : ''}`}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    {expandedSection === 'wilaya' && (
                                                        <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                                                            <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name="wilaya"
                                                                    checked={selectedWilaya === ''}
                                                                    onChange={() => setSelectedWilaya('')}
                                                                    className="w-4 h-4 text-[#006233] focus:ring-[#006233]"
                                                                />
                                                                <span className={`text-sm ${selectedWilaya === '' ? 'font-medium' : 'text-gray-700'}`}>
                                                                    Toutes
                                                                </span>
                                                            </label>
                                                            {availableWilayas.map((wilaya) => (
                                                                <label key={wilaya as string} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="wilaya"
                                                                        checked={selectedWilaya === wilaya}
                                                                        onChange={() => setSelectedWilaya(wilaya as string)}
                                                                        className="w-4 h-4 text-[#006233] focus:ring-[#006233]"
                                                                    />
                                                                    <span className={`text-sm ${selectedWilaya === wilaya ? 'font-medium' : 'text-gray-700'}`}>
                                                                        {wilaya as string}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Size Filter Accordion */}
                                        {availableSizes.length > 0 && (
                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedSection(expandedSection === 'size' ? null : 'size')}
                                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                                >
                                                    <span className="font-semibold text-gray-900">
                                                        {isShoeCategory() ? 'Pointure' : 'Taille'}
                                                    </span>
                                                    <svg
                                                        className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === 'size' ? 'rotate-180' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>

                                                {expandedSection === 'size' && (
                                                    <div className="p-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {availableSizes.map((size) => (
                                                                <button
                                                                    key={size}
                                                                    onClick={() => {
                                                                        if (selectedSizes.includes(size)) {
                                                                            setSelectedSizes(selectedSizes.filter(s => s !== size));
                                                                        } else {
                                                                            setSelectedSizes([...selectedSizes, size]);
                                                                        }
                                                                    }}
                                                                    className={`px-3 py-2 rounded-lg border-2 font-semibold transition-all text-sm ${selectedSizes.includes(size)
                                                                        ? 'bg-[#006233] text-white border-[#006233]'
                                                                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#006233]'
                                                                        }`}
                                                                >
                                                                    {size}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {/* Footer Actions */}
                                        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3 rounded-b-xl">
                                            <button
                                                onClick={() => {
                                                    setSelectedSubcategories([]);
                                                    setPriceRange([0, 50000]);
                                                    setSelectedWilaya('');
                                                    setSelectedSizes([]);
                                                }}
                                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Réinitialiser
                                            </button>
                                            <button
                                                onClick={() => setShowFilterPanel(false)}
                                                className="flex-1 px-4 py-2.5 bg-[#006233] text-white rounded-lg font-medium hover:bg-[#004d28] transition-colors"
                                            >
                                                Appliquer
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-8">
                {/* Products Grid Section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[400px]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Produits</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                <span className="font-semibold text-gray-900">{filteredProducts.length}</span> résultats trouvés
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-[200px]">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full appearance-none px-4 py-2.5 pr-8 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006233]/20 focus:border-[#006233] cursor-pointer"
                                >
                                    <option value="">Trier par pertinence</option>
                                    <option value="name">Nom (A-Z)</option>
                                    <option value="price-asc">Prix croissant</option>
                                    <option value="price-desc">Prix décroissant</option>
                                    <option value="wilaya">Wilaya (A-Z)</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ProductGrid products={filteredProducts} />
                </div>
            </div>
        </div >
    );
}
