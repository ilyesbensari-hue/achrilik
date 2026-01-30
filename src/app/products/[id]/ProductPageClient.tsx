"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import Image from 'next/image';

interface ProductPageClientProps {
    product: any;
    sizes: string[];
    colors: string[];
    images: string[];
}

export default function ProductPageClient({ product, sizes, colors, images }: ProductPageClientProps) {
    const router = useRouter();
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Auto-select when there's only one option
    useEffect(() => {
        if (sizes.length === 1 && !selectedSize) {
            setSelectedSize(sizes[0]);
        }
    }, [sizes, selectedSize]);

    useEffect(() => {
        if (colors.length === 1 && !selectedColor) {
            setSelectedColor(colors[0]);
        }
    }, [colors, selectedColor]);

    const handleAddToCart = () => {
        // Check role
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role === 'SELLER') {
                    showToast("Les vendeurs ne peuvent pas acheter. Veuillez créer un compte client.", 'error');
                    return;
                }
            } catch (e) {
                console.error(e);
            }
        }

        // Validate selection
        if (sizes.length > 1 && !selectedSize) {
            showToast('Veuillez sélectionner une taille', 'error');
            return;
        }
        if (colors.length > 1 && !selectedColor) {
            showToast('Veuillez sélectionner une couleur', 'error');
            return;
        }
        if (!selectedSize || !selectedColor) {
            showToast('Erreur: Aucune variante disponible', 'error');
            return;
        }

        const variant = product.Variant.find((v: any) => v.size === selectedSize && v.color === selectedColor);
        if (!variant) {
            showToast('Combinaison indisponible', 'error');
            return;
        }
        if (variant.stock < quantity) {
            showToast(`Stock insuffisant (${variant.stock} disponibles)`, 'error');
            return;
        }

        const cartItem = {
            productId: product.id,
            title: product.title,
            price: product.price,
            variantId: variant.id,
            size: selectedSize,
            color: selectedColor,
            image: images[0],
            storeId: product.storeId,
            stock: variant.stock,
            quantity
        };

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('storage'));

        showToast('Produit ajouté au panier', 'success', {
            label: 'Voir le panier',
            onClick: () => router.push('/cart')
        });
    };

    return (
        <>
            {/* Images Gallery */}
            <div className="p-8">
                <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4 relative group shadow-inner">
                    {images.length > 0 ? (
                        <img
                            src={images[selectedImageIndex]}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Aucune image
                        </div>
                    )}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`w-3 h-3 rounded-full transition-all shadow-sm border ${selectedImageIndex === index
                                        ? 'bg-white scale-125 border-gray-400'
                                        : 'bg-white/50 hover:bg-white/75 border-transparent'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Thumbnail List (Scrollable) */}
                {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
                        {images.map((img: string, index: number) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`relative min-w-[80px] w-20 h-20 rounded-lg overflow-hidden border-2 transition-all snap-start ${selectedImageIndex === index
                                    ? 'border-indigo-600 shadow-md ring-2 ring-indigo-200'
                                    : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                                    }`}
                            >
                                <Image src={img} alt="" width={600} height={600} className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Selection Area - moved from server component */}
                <div className="bg-gray-50 dark:bg-white p-6 rounded-2xl space-y-6 mt-6">
                    {/* Size Selection */}
                    {sizes.length > 1 && (
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-bold text-gray-900 dark:text-gray-900">Taille</label>
                                {selectedSize && <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Sélectionné: {selectedSize}</span>}
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                {sizes.map((size) => {
                                    // Check if this size is available with selected color
                                    const isAvailable = !selectedColor || product.Variant.some((v: any) => v.size === size && v.color === selectedColor && v.stock > 0);

                                    return (
                                        <button
                                            key={size}
                                            onClick={() => isAvailable && setSelectedSize(size)}
                                            disabled={!isAvailable}
                                            className={`min-w-[3.5rem] h-14 px-4 rounded-xl font-bold transition-all border-2 
                                                ${selectedSize === size
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105'
                                                    : isAvailable
                                                        ? 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                                                        : 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed opacity-60 decoration-slice line-through'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Color Selection */}
                    {colors.length > 1 && (
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-bold text-gray-900 dark:text-gray-900">Couleur</label>
                                {selectedColor && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: selectedColor }}></div>
                                        <span className="text-xs font-semibold text-gray-500">Sélectionné</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                {colors.map((color) => {
                                    // Check if this color is available with selected size
                                    const isAvailable = !selectedSize || product.Variant.some((v: any) => v.size === selectedSize && v.color === color && v.stock > 0);

                                    return (
                                        <button
                                            key={color}
                                            onClick={() => isAvailable && setSelectedColor(color)}
                                            disabled={!isAvailable}
                                            className={`w-12 h-12 rounded-full border-4 shadow-sm transition-all relative
                                                ${selectedColor === color
                                                    ? 'border-indigo-600 scale-110 ring-2 ring-indigo-200'
                                                    : isAvailable
                                                        ? 'border-white hover:scale-105 hover:border-gray-200'
                                                        : 'border-white opacity-40 cursor-not-allowed grayscale'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            title={!isAvailable ? `${color} (Indisponible)` : color}
                                        >
                                            {selectedColor === color && (
                                                <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                                                    <svg className="w-6 h-6 filter drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                </span>
                                            )}
                                            {/* Cross line for unavailable */}
                                            {!isAvailable && (
                                                <span className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-full h-0.5 bg-gray-500 rotate-45"></div>
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-3">Quantité</label>
                        <div className="flex items-center gap-4 bg-white w-fit p-1 rounded-xl border border-gray-200 shadow-sm">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-12 h-12 rounded-lg bg-gray-50 hover:bg-gray-100 font-bold text-lg text-gray-600 flex items-center justify-center transition-colors"
                            >
                                -
                            </button>
                            <span className="text-xl font-bold w-16 text-center text-gray-900 dark:text-gray-900">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-12 h-12 rounded-lg bg-indigo-50 hover:bg-indigo-100 font-bold text-lg text-indigo-600 flex items-center justify-center transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                    <button
                        onClick={handleAddToCart}
                        className="btn btn-primary w-full py-4 text-lg font-bold shadow-xl shadow-indigo-200 hover:shadow-2xl transition-all hover:-translate-y-1"
                    >
                        🛒 Ajouter au panier
                    </button>
                    <Link
                        href="/cart"
                        className="btn btn-outline w-full py-4 text-center border-2 font-semibold hover:bg-gray-50"
                    >
                        Voir le panier
                    </Link>
                </div>
            </div>
        </>
    );
}
