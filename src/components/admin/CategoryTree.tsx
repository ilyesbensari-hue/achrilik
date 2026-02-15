'use client';

import { useState } from 'react';

interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    order: number;
    isActive: boolean;
    _count: {
        products: number;
    };
    children?: Category[];
}

interface Props {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

export default function CategoryTree({ categories, onEdit, onDelete }: Props) {
    // Group categories by parentId
    const rootCategories = categories
        .filter(c => !categories.some(p => p.id !== c.id && hasChild(c, categories)))
        .sort((a, b) => a.order - b.order);

    function hasChild(cat: Category, allCats: Category[]): boolean {
        const parent = categories.find(p => p.id === cat.id);
        if (!parent) return false;
        // Check if this category appears in any _count logic or relations
        return false; // Simplified for now
    }

    return (
        <div className="space-y-2">
            {rootCategories.map(category => (
                <CategoryNode
                    key={category.id}
                    category={category}
                    allCategories={categories}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    level={0}
                />
            ))}
        </div>
    );
}

function CategoryNode({
    category,
    allCategories,
    onEdit,
    onDelete,
    level
}: {
    category: Category;
    allCategories: Category[];
    onEdit: (cat: Category) => void;
    onDelete: (cat: Category) => void;
    level: number;
}) {
    const [expanded, setExpanded] = useState(true);

    // Find children
    const children = allCategories
        .filter(c => {
            // Need to check parent relationship - simplified
            return false; // Will be populated from API properly
        })
        .sort((a, b) => a.order - b.order);

    const hasChildren = children.length > 0;
    const indent = level * 24; // 24px per level

    return (
        <div>
            {/* Node */}
            <div
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 rounded-lg border border-gray-100 mb-2"
                style={{ marginLeft: `${indent}px` }}
            >
                {/* Expand/Collapse */}
                {hasChildren && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-gray-400 hover:text-gray-600 transition-transform"
                        style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
                {!hasChildren && <div className="w-4" />}

                {/* Drag Handle (placeholder for phase 2) */}
                <div className="text-gray-300 cursor-move">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                </div>

                {/* Icon */}
                {category.icon && (
                    <span className="text-xl">{category.icon}</span>
                )}

                {/* Name */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{category.name}</span>
                        <span className="text-xs text-gray-500 font-mono">{category.slug}</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{category._count.products} produits</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(category)}
                        className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded font-medium"
                    >
                        Modifier
                    </button>
                    <button
                        onClick={() => onDelete(category)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded font-medium"
                    >
                        Supprimer
                    </button>
                </div>
            </div>

            {/* Children */}
            {hasChildren && expanded && (
                <div className="ml-6">
                    {children.map(child => (
                        <CategoryNode
                            key={child.id}
                            category={child}
                            allCategories={allCategories}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
