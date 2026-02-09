'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, TrendingUp, Tag } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    children?: Category[];
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828]"></div>
            </div>
        );
    }

    // Sort categories in specific order: Vêtements, Maroquinerie, Accessoires, then others
    const sortedCategories = [...categories].sort((a, b) => {
        const order = ['vêtements', 'vetements', 'maroquinerie', 'accessoires'];
        const aIndex = order.findIndex(name => a.name.toLowerCase().includes(name));
        const bIndex = order.findIndex(name => b.name.toLowerCase().includes(name));

        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-6 pb-24">
                {/* Header with gradient text */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[#C62828] to-purple-600 bg-clip-text text-transparent mb-2">
                        Catégories
                    </h1>
                    <p className="text-gray-600 text-sm">Explorez notre collection par catégorie</p>
                </div>

                {/* Special Links with enhanced design */}
                <div className="space-y-3 mb-8">
                    <Link
                        href="/promos"
                        className="group flex items-center justify-between bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                <Tag className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="font-bold text-lg block">Promos</span>
                                <span className="text-xs text-white/80">Offres spéciales</span>
                            </div>
                        </div>
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        href="/best-sellers"
                        className="group flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="font-bold text-lg block">Best Sellers</span>
                                <span className="text-xs text-white/80">Les plus vendus</span>
                            </div>
                        </div>
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        href="/nouveautes"
                        className="group flex items-center justify-between bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="font-bold text-lg block">Nouveautés</span>
                                <span className="text-xs text-white/80">Dernières arrivées</span>
                            </div>
                        </div>
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Category Links organized by sections */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-[#C62828] to-purple-600 rounded-full"></div>
                        Toutes les catégories
                    </h2>

                    {sortedCategories.map((topCategory, index) => (
                        <div key={topCategory.id} className={`${index > 0 ? 'mt-8' : ''}`}>
                            {/* Top-level category title - NOW CLICKABLE with arrow */}
                            <Link
                                href={`/categories/${topCategory.slug}`}
                                className="group flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl mb-4 hover:from-rose-50 hover:to-purple-50 transition-all hover:shadow-md"
                            >
                                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide group-hover:text-[#C62828] transition-colors">
                                    {topCategory.name}
                                </h3>
                                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#C62828] group-hover:translate-x-1 transition-all" />
                            </Link>

                            {/* Subcategories */}
                            {topCategory.children && topCategory.children.length > 0 && (
                                <div className="space-y-2 ml-2">
                                    {/* Sort subcategories for Vêtements: Femme, Homme, Enfant, Bébé */}
                                    {[...topCategory.children].sort((a, b) => {
                                        if (topCategory.name.toLowerCase().includes('vêtement') || topCategory.name.toLowerCase().includes('vetement')) {
                                            const order = ['femme', 'homme', 'enfant', 'bébé', 'bebe'];
                                            const aIndex = order.findIndex(name => a.name.toLowerCase().includes(name));
                                            const bIndex = order.findIndex(name => b.name.toLowerCase().includes(name));

                                            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                                            if (aIndex !== -1) return -1;
                                            if (bIndex !== -1) return 1;
                                        }
                                        return a.name.localeCompare(b.name);
                                    }).map(subCategory => (
                                        <div key={subCategory.id}>
                                            {/* Subcategory link with enhanced styling */}
                                            <Link
                                                href={`/categories/${subCategory.slug}`}
                                                className="group flex items-center justify-between px-5 py-4 rounded-xl hover:bg-gradient-to-r hover:from-rose-50 hover:to-purple-50 transition-all border border-transparent hover:border-[#C62828]/20 hover:shadow-md"
                                            >
                                                <span className="font-semibold text-gray-800 group-hover:text-[#C62828] transition-colors">
                                                    {subCategory.name}
                                                </span>
                                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#C62828] group-hover:translate-x-1 transition-all" />
                                            </Link>

                                            {/* Sub-subcategories (if any) */}
                                            {subCategory.children && subCategory.children.length > 0 && (
                                                <div className="ml-8 mt-2 space-y-1">
                                                    {subCategory.children.map(subSubCategory => (
                                                        <Link
                                                            key={subSubCategory.id}
                                                            href={`/categories/${subSubCategory.slug}`}
                                                            className="group flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-white/60 transition-all text-sm"
                                                        >
                                                            <span className="text-gray-600 group-hover:text-[#C62828] transition-colors flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover:bg-[#C62828]"></span>
                                                                {subSubCategory.name}
                                                            </span>
                                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#C62828] group-hover:translate-x-1 transition-all" />
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
