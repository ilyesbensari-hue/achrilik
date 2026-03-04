'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

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
    'femmes': '👗',
    'hommes': '👔',
    'enfants': '👶',
    'accessoires': '🎧',
    'chaussures': '👟',
    'maroquinerie': '👜',
    'electronique': '📱',
};

// Map DB slug → translation key
const SLUG_TO_KEY: Record<string, string> = {
    'femmes': 'cat_women',
    'hommes': 'cat_men',
    'enfants': 'cat_kids',
    'accessoires': 'cat_accessories',
    'chaussures': 'cat_shoes',
    'maroquinerie': 'cat_maroquinerie',
    'electronique': 'cat_electronique',
};

interface CategoryListProps {
    variant?: 'sidebar' | 'mobile' | 'desktop';
    onNavigate?: () => void;
}

export default function CategoryList({ variant = 'mobile', onNavigate }: CategoryListProps) {
    const isDesktopDropdown = variant === 'desktop';
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { tr } = useTranslation();

    // Helper: get translated name for a category slug
    const getCategoryName = (cat: { name: string; slug: string }) => {
        const key = SLUG_TO_KEY[cat.slug];
        return key ? tr(key as any) : cat.name;
    };

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
        <div className={isDesktopDropdown ? "py-2" : "space-y-1"}>
            {!loading && categories.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                    Aucune catégorie disponible
                </div>
            )}

            {categories.map((category) => (
                <CategoryItem
                    key={category.id}
                    category={category}
                    variant={variant}
                    depth={0}
                    onNavigate={onNavigate}
                    getCategoryName={getCategoryName}
                />
            ))}
        </div>
    );
}

// Recursive Component
function CategoryItem({
    category,
    variant,
    depth,
    onNavigate,
    getCategoryName
}: {
    category: Category;
    variant: 'sidebar' | 'mobile' | 'desktop';
    depth: number;
    onNavigate?: () => void;
    getCategoryName: (cat: { name: string; slug: string }) => string;
}) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = category.children && category.children.length > 0;
    const isDesktopDropdown = variant === 'desktop';

    const isSidebar = variant === 'sidebar';
    const textColor = isSidebar ? 'text-white' : 'text-gray-900';

    // Indentation for children
    const paddingLeft = depth === 0 ? '1rem' : `${depth * 1.5 + 1}rem`;

    // Desktop dropdown styling
    if (isDesktopDropdown && depth === 0) {
        return (
            <Link
                href={`/categories/${category.slug}`}
                onClick={onNavigate}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
                <span className="text-2xl">{CATEGORY_ICONS[category.slug] || '✨'}</span>
                <span className="text-sm font-medium text-gray-900">
                    {getCategoryName(category)}
                </span>
                {category._count?.products > 0 && (
                    <span className="ml-auto text-xs text-gray-400">({category._count.products})</span>
                )}
            </Link>
        );
    }

    return (
        <div className={`border-b border-gray-100 last:border-none ${depth > 0 ? 'bg-gray-50/50' : ''}`}>
            <div
                className={`w-full flex items-center justify-between hover:bg-black/5 transition-all`}
                style={{ paddingLeft, paddingRight: '1rem', paddingTop: '1rem', paddingBottom: '1rem' }}
            >
                {/* Link to Category Page */}
                <Link
                    href={`/categories/${category.slug}`}
                    onClick={onNavigate}
                    className="flex items-center gap-3 flex-1"
                >
                    {depth === 0 && <span className="text-2xl">{CATEGORY_ICONS[category.slug] || '✨'}</span>}
                    <span className={`font-semibold ${depth === 0 ? 'text-lg' : 'text-sm'} ${textColor}`}>
                        {getCategoryName(category)}
                    </span>
                    {category._count?.products > 0 && (
                        <span className="text-xs text-gray-400">({category._count.products})</span>
                    )}
                </Link>

                {/* Toggle Button (Chevron) */}
                {hasChildren && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                        className={`p-2 -mr-2 text-gray-400 hover:text-[#006233] transition-colors`}
                    >
                        <svg
                            className={`w-5 h-5 transition-transform duration-200 ${expanded ? 'rotate-180 text-[#006233]' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Recursion for Children */}
            {hasChildren && expanded && (
                <div className="border-l-2 border-gray-100 ml-4">
                    {category.children.map((child) => (
                        <CategoryItem
                            key={child.id}
                            category={child}
                            variant={variant}
                            depth={depth + 1}
                            onNavigate={onNavigate}
                            getCategoryName={getCategoryName}
                        />
                    ))}
                    {/* Explicit "View all" link for the parent category inserted as a child entry for clarity?
                        Actually, the parent click handles it. But user asked for "un truc deroulant quand on clique... et je deroule si je veux encore plus".
                        The current implementation allows:
                        - Click Name -> Go to page
                        - Click Arrow -> Expand
                        This satisfies the requirement.
                    */}
                </div>
            )}
        </div>
    );
}
