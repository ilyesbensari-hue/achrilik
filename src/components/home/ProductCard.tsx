'use client';

import ProductCardBase from '@/components/ProductCardBase';

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
    // Transform data to match ProductCardBase interface
    const transformedProduct = {
        id: product.id,
        title: product.title,
        price: product.price,
        images: product.image, // ProductCardBase expects comma-separated string
        promotion: product.promotionLabel,
        createdAt: product.isNew ? new Date() : undefined, // Simulate new product
        Review: [], // No reviews on homepage cards for now
        Store: undefined // Store info not available on homepage
    };

    return (
        <ProductCardBase
            product={transformedProduct}
            layout="compact"
            imageAspectRatio="square"
            badgePosition="top-left"
            wishlistButtonSize="sm"
        />
    );
}
