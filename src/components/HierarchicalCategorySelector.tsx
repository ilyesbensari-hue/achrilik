"use client";

import { useState, useEffect } from 'react';

interface Category {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    children?: Category[];
}

interface HierarchicalCategorySelectorProps {
    value: string;
    onChange: (categoryId: string) => void;
    categories: Category[];
}

export default function HierarchicalCategorySelector({ value, onChange, categories }: HierarchicalCategorySelectorProps) {
    const [level1, setLevel1] = useState('');
    const [level2, setLevel2] = useState('');
    const [level3, setLevel3] = useState('');

    // Build category hierarchy
    const rootCategories = categories.filter(cat => !cat.parentId);

    const getChildren = (parentId: string) => {
        return categories.filter(cat => cat.parentId === parentId);
    };

    // Find category path from ID
    const findCategoryPath = (categoryId: string): string[] => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return [];

        const path: string[] = [category.id];
        let current = category;

        while (current.parentId) {
            path.unshift(current.parentId);
            current = categories.find(c => c.id === current.parentId)!;
        }

        return path;
    };

    // Initialize from value
    useEffect(() => {
        if (value && categories.length > 0) {
            const path = findCategoryPath(value);
            if (path.length >= 1) setLevel1(path[0]);
            if (path.length >= 2) setLevel2(path[1]);
            if (path.length >= 3) setLevel3(path[2]);
        }
    }, [value, categories]);

    const handleLevel1Change = (newValue: string) => {
        setLevel1(newValue);
        setLevel2('');
        setLevel3('');

        const children = getChildren(newValue);
        if (children.length === 0) {
            // No children, this is the final category
            onChange(newValue);
        } else {
            // Has children, wait for next selection
            onChange('');
        }
    };

    const handleLevel2Change = (newValue: string) => {
        setLevel2(newValue);
        setLevel3('');

        const children = getChildren(newValue);
        if (children.length === 0) {
            // No children, this is the final category
            onChange(newValue);
        } else {
            // Has children, wait for next selection
            onChange('');
        }
    };

    const handleLevel3Change = (newValue: string) => {
        setLevel3(newValue);
        onChange(newValue);
    };

    const level2Categories = level1 ? getChildren(level1) : [];
    const level3Categories = level2 ? getChildren(level2) : [];

    return (
        <div className="space-y-3">
            {/* Level 1: Root categories */}
            <div>
                <label className="label mb-1 block text-sm font-semibold">
                    📂 Catégorie principale
                </label>
                <select
                    className="input"
                    required
                    value={level1}
                    onChange={(e) => handleLevel1Change(e.target.value)}
                >
                    <option value="">-- Sélectionnez une catégorie --</option>
                    {rootCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Level 2: First level children */}
            {level1 && level2Categories.length > 0 && (
                <div className="pl-4 border-l-2 border-green-300">
                    <label className="label mb-1 block text-sm font-semibold">
                        📁 Sous-catégorie
                    </label>
                    <select
                        className="input"
                        required
                        value={level2}
                        onChange={(e) => handleLevel2Change(e.target.value)}
                    >
                        <option value="">-- Sélectionnez une sous-catégorie --</option>
                        {level2Categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Level 3: Second level children */}
            {level2 && level3Categories.length > 0 && (
                <div className="pl-8 border-l-2 border-blue-300">
                    <label className="label mb-1 block text-sm font-semibold">
                        🏷️ Type de produit
                    </label>
                    <select
                        className="input"
                        required
                        value={level3}
                        onChange={(e) => handleLevel3Change(e.target.value)}
                    >
                        <option value="">-- Sélectionnez le type --</option>
                        {level3Categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Breadcrumb showing selection */}
            {level1 && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                    <span className="font-semibold">Sélection : </span>
                    {categories.find(c => c.id === level1)?.name}
                    {level2 && ` → ${categories.find(c => c.id === level2)?.name}`}
                    {level3 && ` → ${categories.find(c => c.id === level3)?.name}`}
                </div>
            )}
        </div>
    );
}
