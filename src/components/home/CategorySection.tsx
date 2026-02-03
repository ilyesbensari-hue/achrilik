import Image from 'next/image';
import Link from 'next/link';
import ProductCard from './ProductCard';

interface CategorySectionProps {
    category: {
        id: string;
        name: string;
        slug: string;
    };
    products: Array<{
        id: string;
        title: string;
        price: number;
        originalPrice: number | null;
        image: string;
        isNew: boolean;
        categoryName: string;
        promotionLabel: string | null;
    }>;
}

export default function CategorySection({ category, products }: CategorySectionProps) {
    if (products.length === 0) return null;

    return (
        <div className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between px-4 mb-4">
                <h3 className="font-bold text-[#212121] text-lg">{category.name}</h3>
                <Link
                    href={`/categories/${category.slug}`}
                    className="text-xs text-[#757575] font-medium hover:text-[#C62828] transition-colors"
                >
                    Voir tout →
                </Link>
            </div>

            {/* Horizontal Scroll Grid */}
            <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x snap-mandatory">
                {products.map((product) => (
                    <div key={product.id} className="flex-shrink-0 w-[160px] snap-start">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>
    );
}
