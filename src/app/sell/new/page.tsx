"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import HierarchicalCategorySelector from '@/components/HierarchicalCategorySelector';
import { ALGERIA_WILAYAS } from '@/constants/wilayas';
import { getSizeConfig } from '@/lib/variantHelpers';
import { useTranslation } from '@/hooks/useTranslation';


export default function AddProductPage() {
    const router = useRouter();
    const { tr } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [storeId, setStoreId] = useState('');

    // Product Fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // Variants
    const [variants, setVariants] = useState<{
        size?: string;
        color: string;
        stock: number;
        length?: number;
        width?: number;
        height?: number;
    }[]>([]);

    // Variant Input
    const [vSize, setVSize] = useState('');
    const [vColor, setVColor] = useState('#000000');
    const [vStock, setVStock] = useState(10);
    const [vLength, setVLength] = useState<number | ''>('');
    const [vWidth, setVWidth] = useState<number | ''>('');
    const [vHeight, setVHeight] = useState<number | ''>('');

    // Promotion
    const [promotionLabel, setPromotionLabel] = useState('');

    // Enhanced Product Details - Existing
    const [cutType, setCutType] = useState('');
    const [sizeGuide, setSizeGuide] = useState('');
    const [countryOfManufacture, setCountryOfManufacture] = useState('');
    const [composition, setComposition] = useState('');

    // NEW: Storage Location
    const [storageZone, setStorageZone] = useState('');
    const [storageWilaya, setStorageWilaya] = useState('');

    // NEW: Design Details
    const [neckline, setNeckline] = useState('');
    const [pattern, setPattern] = useState('');
    const [closure, setClosure] = useState('');
    const [pockets, setPockets] = useState('');

    // NEW: Material & Fit
    const [material, setMaterial] = useState('');
    const [fit, setFit] = useState('');
    const [length, setLength] = useState('');

    // NEW: Care & Brand
    const [careInstructions, setCareInstructions] = useState('');
    const [brand, setBrand] = useState('');
    const [supplierReference, setSupplierReference] = useState('');

    // NEW: Warranty
    const [warranty, setWarranty] = useState('');

    // NEW: Sizes & Dimensions
    const [availableSizes, setAvailableSizes] = useState<string[]>([]);
    const [weight, setWeight] = useState('');
    const [productLength, setProductLength] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');

    // NEW: Badges & Status
    const [badges, setBadges] = useState<string[]>([]);
    const [isNew, setIsNew] = useState(false);
    const [isTrending, setIsTrending] = useState(false);
    const [isBestSeller, setIsBestSeller] = useState(false);

    useEffect(() => {
        // Fetch categories
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                // Recursively flatten ALL categories (including grandchildren)
                const flattenCategories = (cats: any[]): any[] => {
                    let result: any[] = [];
                    cats.forEach((cat: any) => {
                        result.push(cat);
                        if (cat.children && cat.children.length > 0) {
                            result = result.concat(flattenCategories(cat.children));
                        }
                    });
                    return result;
                };
                setCategories(flattenCategories(data));
            });

        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/login');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            // Fetch store for this user
            fetch('/api/stores').then(res => res.json()).then(stores => {
                const myStore = stores.find((s: any) => s.ownerId === user.id);

                if (!myStore) {
                    alert(tr('new_product_first_create'));
                    router.push('/sell');
                    return;
                }

                // Check completeness
                // Name and Description are likely present if created, but City is critical for shipping.
                // If Physical Store (clickCollect !== false), Address is mandatory.
                const isPhysical = myStore.clickCollect !== false;
                const isComplete = myStore.name && myStore.city && (!isPhysical || myStore.address);

                if (!isComplete) {
                    alert(tr('new_product_complete_store'));
                    router.push('/sell');
                    return;
                }

                // FIX: use myStore.id from API (not user.storeId from localStorage which is often missing)
                setStoreId(myStore.id);
            });
        } catch (error) {
            console.error('Failed to parse user:', error);
            // If user data is corrupted or missing, redirect to login
            localStorage.removeItem('user');
            router.push('/login');
        }
    }, [router]);

    // Get dynamic size configuration based on selected category
    const getSizeConfigForCategory = () => {
        if (!categoryId || categories.length === 0) {
            return getSizeConfig();
        }

        const selectedCategory = categories.find(c => c.id === categoryId);
        if (!selectedCategory) {
            return getSizeConfig();
        }

        return getSizeConfig(selectedCategory.slug, selectedCategory.name);
    };

    const sizeConfig = getSizeConfigForCategory();

    // Set default size when category changes
    useEffect(() => {
        if (sizeConfig.options.length > 0 && !vSize) {
            setVSize(sizeConfig.options[0].value);
        }
    }, [categoryId, sizeConfig]);

    const addVariant = () => {
        const newVariant: any = {
            color: vColor,
            stock: vStock,
        };

        // Add size if required and provided
        if (sizeConfig.required || vSize) {
            newVariant.size = vSize;
        }

        // Add dimensions if provided (for bags)
        if (sizeConfig.showDimensions) {
            if (vLength) newVariant.length = Number(vLength);
            if (vWidth) newVariant.width = Number(vWidth);
            if (vHeight) newVariant.height = Number(vHeight);
        }

        setVariants([...variants, newVariant]);

        // Reset dimension inputs
        if (sizeConfig.showDimensions) {
            setVLength('');
            setVWidth('');
            setVHeight('');
        }
    };

    const removeVariant = (index: number) => {
        const newVariants = [...variants];
        newVariants.splice(index, 1);
        setVariants(newVariants);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeId) return alert(tr('new_product_need_store'));
        if (!categoryId) return alert(tr('new_product_need_cat'));
        if (variants.length === 0) return alert(tr('new_product_need_variant'));
        if (images.length === 0) return alert(tr('new_product_need_photo'));

        setLoading(true);
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    price: parseFloat(price),
                    categoryId,
                    images: images.join(','),
                    storeId,
                    variants,
                    promotionLabel: promotionLabel || null,
                    cutType: cutType || null,
                    sizeGuide: sizeGuide || null,
                    countryOfManufacture: countryOfManufacture || null,
                    composition: composition || null,
                    // NEW FIELDS
                    neckline: neckline || null,
                    pattern: pattern || null,
                    closure: closure || null,
                    pockets: pockets || null,
                    material: material || null,
                    fit: fit || null,
                    length: length || null,
                    careInstructions: careInstructions || null,
                    brand: brand || null,
                    supplierReference: supplierReference || null,
                    availableSizes: availableSizes.length > 0 ? availableSizes : null,
                    weight: weight ? parseFloat(weight) : null,
                    productLength: productLength ? parseFloat(productLength) : null,
                    width: width ? parseFloat(width) : null,
                    height: height ? parseFloat(height) : null,
                    badges: badges.length > 0 ? badges : null,
                    isNew,
                    isTrending,
                    isBestSeller,
                    // Warranty
                    warranty: warranty || null,
                    // Storage Location
                    storageZone: storageZone || null,
                    storageWilaya: storageWilaya || null
                })
            });

            if (res.ok) {
                router.push('/sell');
            } else {
                alert(tr('new_product_create_error'));
            }
        } catch (e) {
            alert(tr('orders_tech_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-10">
            <div className="card max-w-2xl mx-auto p-8">
                <h1 className="text-2xl font-bold mb-6">{tr('new_product_title')}</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="label mb-1 block">{tr('new_product_name')}</label>
                        <input className="input" required value={title} onChange={e => setTitle(e.target.value)} />
                    </div>

                    <div>
                        <label className="label mb-1 block">{tr('new_product_desc')}</label>
                        <textarea className="input h-24 py-2" required value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    <HierarchicalCategorySelector
                        value={categoryId}
                        onChange={setCategoryId}
                        categories={categories}
                    />


                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label mb-1 block">{tr('new_product_price')}</label>
                            <input className="input" type="number" required value={price} onChange={e => setPrice(e.target.value)} />
                        </div>
                    </div>

                    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
                        <label className="label mb-1 block font-bold flex items-center gap-2">
                            <span>📸</span>
                            <span>{tr('new_product_photos')} <span className="text-red-500">*</span></span>
                        </label>
                        {/* Recommendation banner */}
                        <div className={`mb-3 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${images.length === 0
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : images.length === 1
                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                : 'bg-green-100 text-green-700 border border-green-300'
                            }`}>
                            <span>{images.length === 0 ? '⚠️' : images.length === 1 ? '💡' : '✅'}</span>
                            <span>
                                {images.length === 0 && tr('new_product_photo0')}
                                {images.length === 1 && tr('new_product_photo1')}
                                {images.length >= 2 && tr('new_product_photo2').replace('{n}', images.length.toString())}
                            </span>
                        </div>
                        <ImageUpload onImagesChange={setImages} maxImages={5} />
                        <p className="text-xs text-gray-500 mt-2">{tr('new_product_photo_hint')}</p>
                    </div>

                    {/* Enhanced Product Details Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span>📋</span>
                            <span>{tr('new_product_details')}</span>
                        </h3>

                        {/* Notice: Produits neufs uniquement */}
                        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                            <p className="text-sm text-blue-900 font-medium flex items-start gap-2">
                                <span className="text-xl">⚠️</span>
                                <span>{tr('new_product_new_only')}</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Cut Type */}
                            <div>
                                <label className="label mb-1 block">{tr('new_product_cut')}</label>
                                <select className="input" value={cutType} onChange={e => setCutType(e.target.value)}>
                                    <option value="">{tr('nav_explore')}</option>
                                    <option value="Slim fit">Slim fit</option>
                                    <option value="Regular fit">Regular fit</option>
                                    <option value="Oversized">Oversized</option>
                                    <option value="Coupe droite">Coupe droite</option>
                                    <option value="Coupe ajustée">Coupe ajustée</option>
                                    <option value="Coupe ample">Coupe ample</option>
                                </select>
                            </div>

                            {/* Size Guide */}
                            <div>
                                <label className="label mb-1 block">{tr('new_product_size_guide')}</label>
                                <textarea className="input h-20 py-2" value={sizeGuide} onChange={e => setSizeGuide(e.target.value)} />
                            </div>

                            {/* Country of Manufacture */}
                            <div>
                                <label className="label mb-1 block">{tr('new_product_country')}</label>
                                <input type="text" className="input" value={countryOfManufacture} onChange={e => setCountryOfManufacture(e.target.value)} />
                            </div>

                            <div>
                                <label className="label mb-1 block">{tr('new_product_composition')}</label>
                                <textarea className="input h-20 py-2" value={composition} onChange={e => setComposition(e.target.value)} />
                            </div>

                            <div className="bg-green-50 p-4 rounded-xl border-2 border-green-300">
                                <label className="label mb-2 block flex items-center gap-2">
                                    <span className="text-lg">🛡️</span>
                                    <span>{tr('new_product_warranty')}</span>
                                </label>
                                <select className="input mb-2" value={warranty} onChange={e => setWarranty(e.target.value)}>
                                    <option value="">{tr('new_product_no_warranty')}</option>
                                    <option value="3 mois">3 {tr('order_detail_cod_amount').replace('(DA)', '').trim()} - 3 months</option>
                                    <option value="6 mois">6 months</option>
                                    <option value="1 an">1 {tr('new_product_country').replace(' (اختياري)', '')}</option>
                                    <option value="2 ans">2 ans</option>
                                </select>
                                <p className="text-xs text-gray-600 flex items-start gap-2">
                                    <span>💡</span>
                                    <span>
                                        {tr('new_product_warranty_tip')}
                                        <strong className="block mt-1 text-green-700">{tr('new_product_warranty_elec')}</strong>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* STORAGE LOCATION - MANDATORY */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span>📍</span>
                            <span>{tr('new_product_storage')}</span>
                            <span className="text-red-500 text-sm ml-2">{tr('new_product_storage_required')}</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label mb-1 block">{tr('new_product_wilaya')} <span className="text-red-500">*</span></label>
                                <select className="input" value={storageWilaya} onChange={e => setStorageWilaya(e.target.value)} required>
                                    <option value="">{tr('nav_explore')}</option>
                                    {ALGERIA_WILAYAS.map(wilaya => (
                                        <option key={wilaya} value={wilaya}>{wilaya}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label mb-1 block">{tr('new_product_zone')} <span className="text-red-500">*</span></label>
                                <input type="text" className="input" placeholder={tr('new_product_zone_ph')} value={storageZone} onChange={e => setStorageZone(e.target.value)} required />
                            </div>
                        </div>

                        <p className="text-xs text-gray-600 mt-3">{tr('new_product_storage_hint')}</p>
                    </div>

                    {/* Promotion Label */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border-2 border-red-200">
                        <label className="label mb-2 block flex items-center gap-2">
                            <span className="text-lg">🏷️</span>
                            <span>{tr('new_product_promo')}</span>
                        </label>
                        <input className="input mb-2" placeholder={tr('new_product_promo_ph')} value={promotionLabel} onChange={e => setPromotionLabel(e.target.value)} maxLength={20} />
                        <p className="text-xs text-gray-600 mt-1">{tr('new_product_promo_tip')}</p>
                        {promotionLabel && (
                            <div className="mt-3 p-2 bg-white rounded-lg border border-red-300">
                                <p className="text-xs font-semibold text-gray-700 mb-1">{tr('new_product_preview')}</p>
                                <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                    {promotionLabel}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Variants Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border">
                        <h3 className="font-bold mb-4">
                            {tr('new_product_variants')}
                        </h3>

                        {/* Responsive flex layout: stack on mobile, row on desktop */}
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end mb-4">
                            {/* Size input - dynamic based on category */}
                            {sizeConfig.options.length > 0 && (
                                <div className="flex-1 sm:flex-initial">
                                    <label className="text-xs font-bold uppercase mb-1 block">{sizeConfig.sizeLabel}</label>
                                    <select className="input h-10 w-full sm:w-32" value={vSize} onChange={e => setVSize(e.target.value)}>
                                        {sizeConfig.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Dimensions for bags */}
                            {sizeConfig.showDimensions && (
                                <>
                                    <div className="flex-1 sm:flex-initial">
                                        <label className="text-xs font-bold uppercase mb-1 block">L (cm)</label>
                                        <input
                                            type="number"
                                            className="input h-10 w-full sm:w-20"
                                            placeholder="30"
                                            value={vLength}
                                            onChange={e => setVLength(e.target.value ? Number(e.target.value) : '')}
                                        />
                                    </div>
                                    <div className="flex-1 sm:flex-initial">
                                        <label className="text-xs font-bold uppercase mb-1 block">l (cm)</label>
                                        <input
                                            type="number"
                                            className="input h-10 w-full sm:w-20"
                                            placeholder="20"
                                            value={vWidth}
                                            onChange={e => setVWidth(e.target.value ? Number(e.target.value) : '')}
                                        />
                                    </div>
                                    <div className="flex-1 sm:flex-initial">
                                        <label className="text-xs font-bold uppercase mb-1 block">H (cm)</label>
                                        <input
                                            type="number"
                                            className="input h-10 w-full sm:w-20"
                                            placeholder="10"
                                            value={vHeight}
                                            onChange={e => setVHeight(e.target.value ? Number(e.target.value) : '')}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex-1 sm:flex-initial">
                                <label className="text-xs font-bold uppercase mb-1 block">{tr('new_product_color')}</label>
                                <input type="color" className="h-10 w-full sm:w-16 p-0 border-0 rounded" value={vColor} onChange={e => setVColor(e.target.value)} />
                            </div>
                            <div className="flex-1 sm:flex-initial">
                                <label className="text-xs font-bold uppercase mb-1 block">{tr('new_product_stock')}</label>
                                <input type="number" className="input h-10 w-full sm:w-20" value={vStock} onChange={e => setVStock(parseInt(e.target.value))} />
                            </div>
                            <button type="button" onClick={addVariant} className="btn btn-secondary h-10 px-4 w-full sm:w-auto">{tr('new_product_add_variant')}</button>
                        </div>

                        <div className="space-y-2">
                            {variants.map((v, i) => (
                                <div key={i} className="flex flex-wrap items-center justify-between gap-2 bg-white p-2 border rounded">
                                    {v.size && <span className="text-sm font-medium">{sizeConfig.sizeLabel}: {v.size}</span>}
                                    {(v.length || v.width || v.height) && (
                                        <span className="text-sm font-medium">
                                            📏 {[v.length, v.width, v.height].filter(d => d).join('×')} cm
                                        </span>
                                    )}
                                    <div className="w-4 h-4 rounded-full border" style={{ background: v.color }}></div>
                                    <span className="text-sm">Stock: {v.stock}</span>
                                    <button type="button" onClick={() => removeVariant(i)} className="text-red-500 text-sm ml-auto">X</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => router.back()} className="btn btn-outline">{tr('new_product_cancel')}</button>
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? tr('new_product_publishing') : tr('new_product_publish')}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
