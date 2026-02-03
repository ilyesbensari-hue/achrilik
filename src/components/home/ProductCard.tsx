'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
    product: {
        id: string;
        title: string;
        price: number;
        originalPrice: number | null;
        image: string;
        isNew: boolean;
        categoryName: string;
        promotionLabel: string | null;
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsAdding(true);

        // Add to cart logic here
        // For now, just a placeholder
        setTimeout(() => {
            setIsAdding(false);
        }, 500);
    };

    return (
        <Link
            href={`/products/${product.id}`}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
        >
            {/* Image Area */}
            <div className="relative aspect-square bg-gray-50 p-2">
                {product.isNew && (
                    <span className="absolute top-2 left-2 bg-[#2E7D32] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm z-10">
                        NOUVEAU
                    </span>
                )}
                {product.promotionLabel && (
                    <span className="absolute top-2 right-2 bg-[#C62828] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm z-10">
                        {product.promotionLabel}
                    </span>
                )}
                <div className="relative w-full h-full">
                    <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                </div>
            </div>

            {/* Info Area */}
            <div className="p-3 flex flex-col flex-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                    {product.categoryName}
                </p>
                <h4 className="text-sm text-[#212121] font-medium line-clamp-2 mb-2 flex-1">
                    {product.title}
                </h4>

                <div className="flex items-baseline gap-2 mb-3">
                    <p className="text-[#C62828] font-bold text-base">
                        {product.price} DA
                    </p>
                    {product.originalPrice && (
                        <p className="text-gray-400 text-xs line-through">
                            {product.originalPrice} DA
                        </p>
                    )}
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="w-full bg-[#C62828] text-white text-xs font-bold py-2 rounded-md hover:bg-[#B71C1C] transition-colors flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
                >
                    <Plus className="h-3 w-3" strokeWidth={3} />
                    {isAdding ? 'AJOUT...' : 'AJOUTER'}
                </button>
            </div>
        </Link>
    );
}
