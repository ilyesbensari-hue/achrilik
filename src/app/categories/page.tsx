'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
            <div className="container mx-auto px-4 py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006233] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des catégories...</p>
                </div>
            </div>
        );
    }

    // Group categories by parent
    const topLevelCategories = categories.filter(cat => !cat.parentId);

    const getCategoryChildren = (parentId: string) => {
        return categories.filter(cat => cat.parentId === parentId);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Explorer nos Catégories</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topLevelCategories.map(category => (
                    <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-bold text-[#006233] mb-4">{category.name}</h2>

                        <div className="space-y-3">
                            {getCategoryChildren(category.id).map(subCategory => (
                                <div key={subCategory.id}>
                                    <Link
                                        href={`/categories/${subCategory.slug}`}
                                        className="text-gray-700 font-medium hover:text-[#006233] transition-colors block"
                                    >
                                        {subCategory.name}
                                    </Link>

                                    {/* Level 3 categories */}
                                    <div className="ml-4 mt-2 space-y-1">
                                        {getCategoryChildren(subCategory.id).map(subSubCategory => (
                                            <Link
                                                key={subSubCategory.id}
                                                href={`/categories/${subSubCategory.slug}`}
                                                className="text-sm text-gray-600 hover:text-[#006233] transition-colors block"
                                            >
                                                • {subSubCategory.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
