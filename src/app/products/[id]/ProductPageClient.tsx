"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import Image from 'next/image';
import { getSizeConfig } from '@/lib/variantHelpers';
import { useTranslation } from '@/hooks/useTranslation';

interface ProductPageClientProps {
    product: any;
    sizes: string[];
    colors: string[];
    images: string[];
}

export default function ProductPageClient({ product, sizes: sizesProps, colors: colorsProps, images: imagesProps }: ProductPageClientProps) {
    const router = useRouter();
    const { tr } = useTranslation();

    // Safe defaults to prevent crashes if props are null/undefined
    const images = imagesProps || [];
    const sizes = sizesProps || [];
    const colors = colorsProps || [];

    // Get dynamic size configuration based on product category
    const sizeConfig = getSizeConfig(product?.Category?.slug, product?.Category?.name);

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
        // Basic validation with detailed error messages
        // Skip size validation for categories without size requirement
        if (sizeConfig.required && sizes.length > 0 && !selectedSize) {
            showToast(`⚠️ ${tr('error_size_color')}`, 'error');
            return;
        }
        if (colors.length > 0 && !selectedColor) {
            showToast(`⚠️ ${tr('error_size_color')}`, 'error');
            return;
        }

        // Find variant
        const variant = product.Variant.find((v: any) =>
            (!sizes.length || v.size === selectedSize || !sizeConfig.required) &&
            (!colors.length || v.color === selectedColor)
        );

        if (!variant) {
            showToast(`❌ ${tr('error_size_color')}`, 'error');
            return;
        }

        if (variant.stock === 0) {
            showToast(`❌ ${tr('card_out_of_stock')}`, 'error');
            return;
        }

        if (variant.stock < quantity) {
            showToast(`⚠️ ${tr('error_stock')}: ${variant.stock}`, 'error');
            return;
        }

        // Check if already in cart
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find((item: any) =>
            item.productId === product.id &&
            item.variantId === variant.id
        );

        if (existingItem) {
            showToast(`ℹ️ ${tr('toast_cart_added')}`, 'info', {
                label: tr('nav_cart'),
                onClick: () => router.push('/cart')
            });
            return;
        }

        // ── Vérification contrainte intra-wilaya ──────────────────────────
        const newItemWilaya = product.storageWilaya || product.Store?.storageWilaya || null;
        if (newItemWilaya && cart.length > 0) {
            const existingWilayas = [...new Set(
                cart
                    .filter((item: any) => item.storageWilaya)
                    .map((item: any) => item.storageWilaya)
            )];
            if (existingWilayas.length > 0 && !existingWilayas.includes(newItemWilaya)) {
                showToast(`🗺️ ${tr('error_stock')}`, 'error');
                return;
            }
        }
        // ─────────────────────────────────────────────────────────────────

        // Prepare cart item
        const cartItem = {
            id: `${product.id}-${variant.id}`,
            productId: product.id,
            title: product.title,
            price: product.price,
            variantId: variant.id,
            size: selectedSize || variant.size || 'Standard',
            color: selectedColor || variant.color || 'N/A',
            image: images[0],
            storeId: product.storeId,
            storeName: product.Store?.name || 'Boutique',
            storageWilaya: newItemWilaya,   // ← inclus pour future validation
            stock: variant.stock,
            quantity
        };

        cart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('storage'));

        showToast(`✅ ${tr('toast_cart_added')}`, 'success', {
            label: tr('nav_cart'),
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
                            {tr('card_photo')}
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
                    {/* Size Selection - shown based on configuration */}
                    {sizeConfig.options.length > 0 && sizes.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-bold text-gray-900 dark:text-gray-900">
                                    {sizeConfig.sizeLabel || tr('product_size')}
                                </label>
                                {selectedSize && <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{tr('product_choose_size')}: {selectedSize}</span>}
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
                                <label className="text-sm font-bold text-gray-900 dark:text-gray-900">{tr('product_color')}</label>
                                {selectedColor && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: selectedColor }}></div>
                                        <span className="text-xs font-semibold text-gray-500">{tr('product_choose_color')}</span>
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
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-900 mb-3">{tr('product_quantity')}</label>
                        <div className="flex items-center gap-4 bg-white w-fit p-1 rounded-xl border border-gray-200 shadow-sm">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-12 h-12 rounded-lg bg-gray-50 hover:bg-gray-100 font-bold text-lg text-gray-600 flex items-center justify-center transition-colors"
                            >
                                -
                            </button>
                            <span className="text-xl font-bold w-16 text-center text-gray-900 dark:text-gray-900">{quantity}</span>
                            <button
                                onClick={() => {
                                    // Find current variant to check stock
                                    const variant = product.Variant.find((v: any) =>
                                        (!sizes.length || v.size === selectedSize) &&
                                        (!colors.length || v.color === selectedColor)
                                    );
                                    const maxStock = variant?.stock || 999;

                                    if (quantity >= maxStock) {
                                        showToast(`⚠️ ${tr('error_stock')} (${maxStock})`, 'error');
                                        return;
                                    }
                                    setQuantity(quantity + 1);
                                }}
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
                        🛒 {tr('product_add_cart')}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                        {/* WhatsApp CTA */}
                        {product.Store?.phone && (
                            <a
                                href={`https://wa.me/${product.Store.phone.replace(/\s+/g, '').replace(/^0/, '213')}?text=${encodeURIComponent(`${tr('product_whatsapp')} — ${product.title} — ${window?.location?.href || ''}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl font-bold text-sm transition-colors shadow-md"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.856L.053 24l6.304-1.654A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.796 9.796 0 01-5.031-1.388l-.361-.214-3.741.981.999-3.648-.235-.374A9.787 9.787 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                                </svg>
                                WhatsApp
                            </a>
                        )}
                        {/* Share button */}
                        <button
                            onClick={async () => {
                                const url = window.location.href;
                                if (navigator.share) {
                                    try {
                                        await navigator.share({ title: product.title, url });
                                    } catch {}
                                } else {
                                    await navigator.clipboard.writeText(url);
                                    showToast(`✅ ${tr('product_share_copied')}`, 'success');
                                }
                            }}
                            className={`flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors ${product.Store?.phone ? '' : 'col-span-2'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            {tr('product_share')}
                        </button>
                    </div>
                    <Link
                        href="/cart"
                        className="btn btn-outline w-full py-4 text-center border-2 font-semibold hover:bg-gray-50"
                    >
                        {tr('nav_cart')}
                    </Link>
                </div>

                {/* Trust Signals */}
                <div className="mt-5 grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-600 leading-tight">{tr('trust_secure_payment')}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-600 leading-tight">{tr('trust_fast_delivery')}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                        <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-600 leading-tight">{tr('trust_verified_seller')}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
