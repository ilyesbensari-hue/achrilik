"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CategoryList from '@/components/CategoryList';

interface Product {
    id: string;
    title: string;
    price: number;
    images: string[];
    store: {
        name: string;
    };
}

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(query);

    useEffect(() => {
        if (query) {
            fetchProducts(query);
        } else {
            setLoading(false);
        }
    }, [query]);

    const fetchProducts = async (search: string) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/products?search=${encodeURIComponent(search)}`);
            const data = await res.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
            <div className="container mx-auto px-4 py-6">
                {/* Search Bar */}
                <div className="mb-6 space-y-4">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher un produit..."
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#006233] focus:border-transparent shadow-sm"
                            autoFocus={!query}
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-[#006233]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </form>
                </div>

                {/* Results or Categories */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#006233]"></div>
                        <p className="mt-4 text-gray-600">Recherche...</p>
                    </div>
                ) : query ? (
                    <>
                        <h1 className="text-xl font-bold text-gray-900 mb-4">
                            Résultats pour "{query}"
                        </h1>
                        {products.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600">Aucun produit trouvé</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {products.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="aspect-[4/5] relative bg-gray-100">
                                            {product.images[0] && (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                                                {product.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 mb-2">{product.store.name}</p>
                                            <p className="text-lg font-bold text-[#006233]">
                                                {product.price.toLocaleString()} DA
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-6">
                        {/* Categories List when no search query */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Explorer par Catégorie</h2>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <CategoryList variant="mobile" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#006233]"></div>
            </div>
        }>
            <SearchResults />
        </Suspense>
    );
}
