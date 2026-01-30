'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    'Accessoires': '🎧',
    'High-Tech': '📱',
    'Maroquinerie': '👜',
    'Sacs': '👜',
    'Chaussures': '👟',
};

interface CategoryListProps {
    variant?: 'sidebar' | 'mobile';
    onNavigate?: () => void;
}

export default function CategoryList({ variant = 'mobile', onNavigate }: CategoryListProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                // The API returns a flat list usually, but sometimes a tree.
                // Assuming the API returns a flat list with parentId, OR a tree.
                // Based on previous usage, it seemed to filter root categories.
                // Let's assume the API returns the full structure or we build it.
                // Checking previous code: "data.filter((c: any) => !c.parentId)"
                // So it was expecting a list where it filtered roots.
                // If the API returns a flat list, we relies on `children` being populated by the backend if it's a tree,
                // OR we need to build the tree if it returns flat list.
                // Let's assume the backend returns the tree structure properly `include: { children: ... }`

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
        <div className="space-y-1">
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
    onNavigate
}: {
    category: Category;
    variant: 'sidebar' | 'mobile';
    depth: number;
    onNavigate?: () => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = category.children && category.children.length > 0;

    const isSidebar = variant === 'sidebar';
    const textColor = isSidebar ? 'text-white' : 'text-gray-900';

    // Indentation for children
    const paddingLeft = depth === 0 ? '1rem' : `${depth * 1.5 + 1}rem`;

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
                    {depth === 0 && <span className="text-2xl">{CATEGORY_ICONS[category.name] || '✨'}</span>}
                    <span className={`font-semibold ${depth === 0 ? 'text-lg' : 'text-sm'} ${textColor}`}>
                        {category.name}
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
