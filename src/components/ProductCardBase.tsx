import Image from 'next/image';
import Link from 'next/link';
import WishlistButton from '@/components/WishlistButton';
import FreeDeliveryBadge from '@/components/FreeDeliveryBadge';

interface Product {
    id: string;
    title: string;
    price: number;
    images: string;
    promotion?: string | null;
    createdAt?: Date | string;
    Review?: any[];
    Store?: {
        name: string;
        city?: string;
        offersFreeDelivery?: boolean;
        freeDeliveryThreshold?: number | null;
    };
}

interface ProductCardBaseProps {
    product: Product;
    layout?: 'compact' | 'standard' | 'grid';
    showQuickAdd?: boolean;
    badgePosition?: 'top-left' | 'top-right';
    imageAspectRatio?: 'square' | 'portrait' | 'landscape';
    wishlistButtonSize?: 'sm' | 'md' | 'lg';
}

export default function ProductCardBase({
    product,
    layout = 'standard',
    showQuickAdd = false,
    badgePosition = 'top-left',
    imageAspectRatio = 'portrait',
    wishlistButtonSize = 'sm'
}: ProductCardBaseProps) {
    const images = product.images.split(',');
    const avgRating = product.Review?.length
        ? product.Review.reduce((acc: number, r: any) => acc + r.rating, 0) / product.Review.length
        : 0;

    // Check if product is new (created within last 7 days)
    const isNew = product.createdAt
        ? (new Date().getTime() - new Date(product.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
        : false;

    // Determine aspect ratio class
    const aspectRatioClass = {
        square: 'aspect-square',
        portrait: 'aspect-[4/5]',
        landscape: 'aspect-[16/9]'
    }[imageAspectRatio];

    // Determine layout-specific classes
    const containerClass = layout === 'compact'
        ? 'bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow'
        : 'bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300';

    return (
        <div className={`group ${containerClass}`}>
            <Link href={`/products/${product.id}`} className="block">
                {/* Image Container */}
                <div className={`relative ${aspectRatioClass} bg-gray-50 p-2 overflow-hidden`}>
                    {/* Badges - Position based on prop */}
                    {badgePosition === 'top-left' && (
                        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                            {product.promotion && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    {product.promotion}
                                </span>
                            )}
                            {isNew && !product.promotion && (
                                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    NOUVEAU
                                </span>
                            )}
                            {/* Free Delivery Badge Tag */}
                            {product.Store?.offersFreeDelivery && (
                                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md flex items-center gap-1">
                                    🚚 Livraison Gratuite
                                </span>
                            )}
                        </div>
                    )}

                    {/* Wishlist Button - Always visible, top-right with high z-index */}
                    <div className="absolute top-2 right-2 z-20">
                        <WishlistButton productId={product.id} size={wishlistButtonSize} />
                    </div>

                    {/* Product Image */}
                    <Image
                        src={images[0]}
                        alt={product.title}
                        width={400}
                        height={500}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Quick View Button - Desktop hover, Mobile always visible */}
                    {showQuickAdd && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 md:bg-black/20 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // Trigger quick view (parent should handle state)
                                    const event = new CustomEvent('openQuickView', { detail: { productId: product.id } });
                                    window.dispatchEvent(event);
                                }}
                                className="bg-white text-gray-900 px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-gray-100 transition transform hover:scale-105 pointer-events-auto"
                            >
                                👁️ Aperçu rapide
                            </button>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-[#006233] transition-colors">
                        {product.title}
                    </h3>

                    {/* Rating */}
                    {avgRating > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-3 h-3 ${i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-xs text-gray-500">({product.Review?.length || 0})</span>
                        </div>
                    )}

                    {/* Price */}
                    <p className="text-lg font-bold text-[#006233]">
                        {product.price.toLocaleString()} DA
                    </p>

                    {/* Store Info */}
                    {product.Store && (
                        <>
                            <p className="text-xs text-gray-500 mt-1">
                                {product.Store.name}
                                {product.Store.city && ` • ${product.Store.city}`}
                            </p>
                            {/* Free Delivery Badge */}
                            {product.Store.offersFreeDelivery && (
                                <div className="mt-2">
                                    <FreeDeliveryBadge
                                        threshold={product.Store.freeDeliveryThreshold}
                                        size="sm"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Link>
        </div>
    );
}
