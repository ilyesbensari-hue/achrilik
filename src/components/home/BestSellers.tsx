'use client';

import Image from 'next/image';
import Link from 'next/link';

interface BestSellersProps {
    products: Array<{
        id: string;
        title: string;
        price: number;
        image: string;
        categoryName?: string;
    }>;
}

export default function BestSellers({ products }: BestSellersProps) {
    if (products.length === 0) return null;

    return (
        <div className="px-4 mb-8">
            <h2 className="text-xl font-bold text-[#212121] mb-4">Best Sellers</h2>

            <div className="grid grid-cols-2 gap-4">
                {products.slice(0, 4).map((product) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                    >
                        {/* Image */}
                        <div className="relative aspect-square bg-gray-50">
                            <Image
                                src={product.image}
                                alt={product.title}
                                fill
                                className="object-contain p-2"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />
                        </div>

                        {/* Info */}
                        <div className="p-3 flex flex-col gap-2">
                            <h3 className="text-sm text-[#212121] font-medium line-clamp-2 min-h-[40px]">
                                {product.title}
                            </h3>
                            <p className="text-base font-bold text-[#C62828]">
                                {product.price} DA
                            </p>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    // Add to cart logic here
                                }}
                                className="w-full bg-[#C62828] text-white text-sm font-bold py-2 rounded-md hover:bg-[#B71C1C] transition-colors active:scale-95"
                            >
                                Ajouter
                            </button>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
