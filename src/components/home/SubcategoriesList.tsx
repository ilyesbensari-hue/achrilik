'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SubcategoriesListProps {
    subcategories: Array<{
        id: string;
        name: string;
        slug: string;
        productCount?: number;
    }>;
}

export default function SubcategoriesList({ subcategories }: SubcategoriesListProps) {
    if (subcategories.length === 0) return null;

    return (
        <div className="px-4 mb-8">
            <h2 className="text-xl font-bold text-[#212121] mb-4">Catégories Vêtements</h2>

            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                {subcategories.map((subcat) => (
                    <Link
                        key={subcat.id}
                        href={`/categories/${subcat.slug}`}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors active:bg-gray-100"
                    >
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#212121]">
                                {subcat.name}
                            </span>
                            {subcat.productCount !== undefined && subcat.productCount > 0 && (
                                <span className="text-xs text-[#757575] mt-0.5">
                                    {subcat.productCount} produit{subcat.productCount > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
