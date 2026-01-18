'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
    id: string;
    name: string;
    slug: string;
    children: Category[];
    _count: {
        products: number;
    };
}

const CATEGORY_ICONS: Record<string, string> = {
    'Femmes': '👗',
    'Hommes': '👔',
    'Enfants': '👶',
    'Accessoires': '👜',
    'High-Tech': '📱',
};

interface CategoryListProps {
    variant?: 'sidebar' | 'mobile';
    onNavigate?: () => void;
}

export default function CategoryList({ variant = 'mobile', onNavigate }: CategoryListProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                const rootCategories = data.filter((c: any) => !c.parentId);
                setCategories(rootCategories);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const toggleCategory = (categoryId: string) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    const isSidebar = variant === 'sidebar';
    const textColor = isSidebar ? 'text-white' : 'text-gray-900';
    const subTextColor = isSidebar ? 'text-white/80' : 'text-gray-600';
    const borderColor = isSidebar ? 'border-white/20' : 'border-gray-200';
    const hoverBg = isSidebar ? 'hover:bg-white/20' : 'hover:bg-gray-50';
    const activeBg = isSidebar ? 'bg-white/20' : 'bg-gray-50';
    const activeBorder = isSidebar ? 'border-white/40' : 'border-[#006233]';

    if (loading) {
        return (
            <div className="space-y-4 p-4">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {!loading && categories.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                    Aucune catégorie disponible
                </div>
            )}

            {categories.map((category) => (
                <div key={category.id} className="relative group border-b border-gray-100 last:border-none">
                    {/* Main Category Button */}
                    <div
                        onClick={() => toggleCategory(category.id)}
                        className={`w-full flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-gray-50`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{CATEGORY_ICONS[category.name] || '✨'}</span>
                            <span className={`font-semibold text-lg ${textColor}`}>
                                {category.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Count badge removed */}

                            {/* Chevron */}
                            {category.children && category.children.length > 0 && (
                                <svg
                                    className={`w-5 h-5 transition-transform text-gray-400 ${expandedCategory === category.id ? 'rotate-180 text-[#006233]' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Subcategories Dropdown */}
                    {expandedCategory === category.id && category.children && category.children.length > 0 && (
                        <div className="bg-gray-50/50 pb-2">
                            <Link
                                href={`/categories/${category.slug}`}
                                onClick={onNavigate}
                                className="block px-4 py-3 pl-14 text-sm font-semibold text-[#006233] hover:bg-gray-100 transition-colors"
                            >
                                Tout voir dans {category.name}
                            </Link>
                            {category.children.map((child) => (
                                <Link
                                    key={child.id}
                                    href={`/categories/${child.slug}`}
                                    onClick={onNavigate}
                                    className="block px-4 py-3 pl-14 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex justify-between group-sub"
                                >
                                    <span>{child.name}</span>
                                    {child._count?.products > 0 && (
                                        <span className="text-xs text-gray-400">({child._count.products})</span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
