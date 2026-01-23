"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import WishlistButton from '@/components/WishlistButton';

export default function WishlistPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // Get user from localStorage
        const userSession = localStorage.getItem('user');
        if (userSession) {
            try {
                const user = JSON.parse(userSession);
                setUserId(user.id);
                fetchWishlist(user.id);
            } catch (e) {
                console.error('Error parsing user session:', e);
                setIsLoading(false);
            }
        } else {
            // Redirect to login if not authenticated
            window.location.href = '/login';
        }

        // Listen for wishlist updates
        const handleWishlistUpdate = () => {
            if (userId) {
                fetchWishlist(userId);
            }
        };
        window.addEventListener('wishlistUpdate', handleWishlistUpdate);
        return () => window.removeEventListener('wishlistUpdate', handleWishlistUpdate);
    }, [userId]);

    const fetchWishlist = async (uid: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/wishlist?userId=${uid}`);
            const data = await response.json();
            if (data.success) {
                setProducts(data.Products);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = (product: any) => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');

        // Find first available variant
        const variant = product.Variant?.[0];
        if (!variant) {
            alert('Ce produit n\'a pas de variante disponible');
            return;
        }

        const existingItem = cart.find((item: any) => item.VariantId === variant.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                variantId: variant.id,
                productId: product.id,
                title: product.title,
                price: product.price,
                image: product.images.split(',')[0],
                size: variant.size,
                color: variant.color,
                quantity: 1,
                storeId: product.StoreId,
                storeName: product.Store.name,
                clickCollect: product.Store.clickCollect
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('storage'));

        // Show toast notification
        alert('Produit ajouté au panier !');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006233]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">❤️ Mes Favoris</h1>
                    <p className="text-gray-600">
                        {products.length > 0
                            ? `${products.length} produit${products.length > 1 ? 's' : ''} dans votre liste de favoris`
                            : 'Votre liste de favoris est vide'
                        }
                    </p>
                </div>

                {/* Empty State */}
                {products.length === 0 ? (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Aucun favori pour le moment</h2>
                            <p className="text-gray-600 mb-6">
                                Commencez à ajouter des produits à vos favoris en cliquant sur le cœur ❤️
                            </p>
                            <Link
                                href="/"
                                className="inline-block px-8 py-3 bg-[#006233] text-white font-semibold rounded-lg hover:bg-[#004d28] transition-colors"
                            >
                                Découvrir les produits
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Products Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                            {products.map((product) => {
                                const images = product.images.split(',');
                                const avgRating = product.Review?.length > 0
                                    ? product.Review.reduce((acc: number, r: any) => acc + r.rating, 0) / product.Review.length
                                    : 0;

                                return (
                                    <div key={product.id} className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
                                        <Link href={`/products/${product.id}`} className="block">
                                            {/* Image */}
                                            <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                                                <img
                                                    src={images[0]}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />

                                                {/* Wishlist Button */}
                                                <div className="absolute top-2 right-2 z-10">
                                                    <WishlistButton productId={product.id} size="md" />
                                                </div>

                                                {/* Quick Add to Cart */}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        addToCart(product);
                                                    }}
                                                    className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm text-[#006233] font-semibold py-2 px-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#006233] hover:text-white"
                                                >
                                                    Ajouter au panier
                                                </button>
                                            </div>

                                            {/* Info */}
                                            <div className="p-3">
                                                <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-[#006233] transition-colors">
                                                    {product.title}
                                                </h3>

                                                <div className="flex items-center gap-1 mb-2">
                                                    {avgRating > 0 && (
                                                        <>
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
                                                            <span className="text-xs text-gray-500">({product.Review.length})</span>
                                                        </>
                                                    )}
                                                </div>

                                                <p className="text-lg font-bold text-[#006233]">
                                                    {product.price.toLocaleString()} DA
                                                </p>

                                                <p className="text-xs text-gray-500 mt-1">
                                                    {product.Store.name} • {product.Store.city}
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Recommendations Section - Placeholder for now */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                            <h2 className="text-2xl font-bold mb-3">🎯 Recommandations basées sur vos favoris</h2>
                            <p className="text-gray-600 mb-4">
                                Bientôt disponible : des suggestions personnalisées basées sur vos goûts !
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
