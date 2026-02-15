'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface QuickViewModalProps {
    productId: string;
    isOpen: boolean;
    onClose: () => void;
}

interface ProductDetails {
    id: string;
    title: string;
    slug: string;
    price: number;
    description: string;
    image: string; // Comma-separated images
    category: { name: string } | null;
    Store: {
        name: string;
        city: string | null;
    } | null;
    variants: Array<{
        size: string | null;
        color: string | null;
        stock: number;
    }>;
}

export default function QuickViewModal({ productId, isOpen, onClose }: QuickViewModalProps) {
    const [product, setProduct] = useState<ProductDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    // Fetch product details when modal opens
    useEffect(() => {
        if (isOpen && productId) {
            setIsLoading(true);
            fetch(`/api/products/${productId}`)
                .then(res => res.json())
                .then(data => {
                    setProduct(data);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching product:', error);
                    setIsLoading(false);
                });
        }
    }, [isOpen, productId]);

    // Handle Esc key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleAddToCart = () => {
        if (!product) return;

        const cartItem = {
            productId: product.id,
            title: product.title,
            price: product.price,
            image: product.image.split(',')[0],
            quantity,
            size: selectedSize,
            color: selectedColor,
            storeId: product.Store?.name || 'Unknown',
        };

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingIndex = cart.findIndex(
            (item: any) =>
                item.productId === productId &&
                item.size === selectedSize &&
                item.color === selectedColor
        );

        if (existingIndex >= 0) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`✅ ${product.title} ajouté au panier!`);
        onClose();
    };

    if (!isOpen) return null;

    const images = product?.image.split(',') || [];
    const availableSizes = [...new Set(product?.variants.map(v => v.size).filter(Boolean))] as string[];
    const availableColors = [...new Set(product?.variants.map(v => v.color).filter(Boolean))] as string[];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {isLoading && (
                    <div className="flex items-center justify-center p-24">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#006233]" />
                    </div>
                )}

                {!isLoading && product && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                        {/* Left: Images */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                                <Image
                                    src={images[selectedImage] || images[0]}
                                    alt={product.title}
                                    width={600}
                                    height={600}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>

                            {/* Thumbnail Gallery */}
                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${selectedImage === idx
                                                ? 'border-[#006233] ring-2 ring-green-200'
                                                : 'border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            <Image
                                                src={img}
                                                alt={`${product.title} ${idx + 1}`}
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Product Details */}
                        <div className="space-y-6">
                            {/* Category */}
                            {product.category && (
                                <p className="text-sm text-gray-500 uppercase tracking-wide">
                                    {product.category.name}
                                </p>
                            )}

                            {/* Title */}
                            <h2 className="text-3xl font-black text-gray-900">
                                {product.title}
                            </h2>

                            {/* Price */}
                            <p className="text-4xl font-bold text-[#006233]">
                                {product.price.toLocaleString()} DA
                            </p>

                            {/* Store */}
                            {product.Store && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="font-semibold">{product.Store.name}</span>
                                    {product.Store.city && <span className="text-sm">• {product.Store.city}</span>}
                                </div>
                            )}

                            {/* Description */}
                            <p className="text-gray-600 leading-relaxed line-clamp-4">
                                {product.description}
                            </p>

                            {/* Size Selection */}
                            {availableSizes.length > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Taille
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {availableSizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-4 py-2 rounded-lg font-semibold transition ${selectedSize === size
                                                    ? 'bg-[#006233] text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Color Selection */}
                            {availableColors.length > 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Couleur
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {availableColors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`px-4 py-2 rounded-lg font-semibold transition capitalize ${selectedColor === color
                                                    ? 'bg-[#006233] text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Quantité
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold transition"
                                    >
                                        −
                                    </button>
                                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-[#006233] text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-[#00753D] transition shadow-lg hover:shadow-xl"
                                >
                                    🛒 Ajouter au panier
                                </button>
                                <Link
                                    href={`/products/${product.slug}`}
                                    className="px-6 py-4 rounded-xl font-bold text-lg border-2 border-[#006233] text-[#006233] hover:bg-green-50 transition text-center"
                                >
                                    Voir détails
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
