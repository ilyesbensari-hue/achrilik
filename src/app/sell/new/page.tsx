"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import HierarchicalCategorySelector from '@/components/HierarchicalCategorySelector';
import { ALGERIA_WILAYAS } from '@/constants/wilayas';


export default function AddProductPage() {
    const router = useRouter();
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
    const [variants, setVariants] = useState<{ size: string, color: string, stock: number }[]>([]);

    // Variant Input
    const [vSize, setVSize] = useState('M');
    const [vColor, setVColor] = useState('#000000');
    const [vStock, setVStock] = useState(10);

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

    // NEW: Free Delivery
    const [offersFreeDelivery, setOffersFreeDelivery] = useState(false);
    const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('');

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
                    alert('Vous devez d\'abord créer une boutique.');
                    router.push('/sell');
                    return;
                }

                // Check completeness
                // Name and Description are likely present if created, but City is critical for shipping.
                // If Physical Store (clickCollect !== false), Address is mandatory.
                const isPhysical = myStore.clickCollect !== false;
                const isComplete = myStore.name && myStore.city && (!isPhysical || myStore.address);

                if (!isComplete) {
                    // Use a small timeout to ensure the alert is seen before redirect, 
                    // or better, handled by the destination page, but alert is simple for now.
                    alert('Veuillez compléter le profil de votre boutique (Ville, Adresse...) avant d\'ajouter des produits.');
                    router.push('/sell');
                    return;
                }

                setStoreId(myStore.id);
            });
        } catch (e) {
            localStorage.removeItem('user');
            router.push('/login');
        }
    }, [router]);

    const addVariant = () => {
        setVariants([...variants, { size: vSize, color: vColor, stock: vStock }]);
    };

    const removeVariant = (index: number) => {
        const newVariants = [...variants];
        newVariants.splice(index, 1);
        setVariants(newVariants);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeId) return alert('Boutique introuvable');
        if (!categoryId) return alert('Veuillez sélectionner une catégorie complète');
        if (variants.length === 0) return alert('Ajoutez au moins une variante');
        if (images.length === 0) return alert('Ajoutez au moins une image');

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
                    // Storage & Delivery
                    storageZone: storageZone || null,
                    storageWilaya: storageWilaya || null,
                    offersFreeDelivery,
                    freeDeliveryThreshold: offersFreeDelivery && freeDeliveryThreshold ? parseInt(freeDeliveryThreshold) : null
                })
            });

            if (res.ok) {
                router.push('/sell');
            } else {
                alert('Erreur lors de la création');
            }
        } catch (e) {
            alert('Erreur technique');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-10">
            <div className="card max-w-2xl mx-auto p-8">
                <h1 className="text-2xl font-bold mb-6">Ajouter un produit</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="label mb-1 block">Titre du produit</label>
                        <input className="input" required value={title} onChange={e => setTitle(e.target.value)} />
                    </div>

                    <div>
                        <label className="label mb-1 block">Description</label>
                        <textarea className="input h-24 py-2" required value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    <HierarchicalCategorySelector
                        value={categoryId}
                        onChange={setCategoryId}
                        categories={categories}
                    />


                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label mb-1 block">Prix (DA)</label>
                            <input className="input" type="number" required value={price} onChange={e => setPrice(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="label mb-1 block">Images du produit</label>
                        <ImageUpload onImagesChange={setImages} maxImages={5} />
                    </div>

                    {/* Enhanced Product Details Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span>📋</span>
                            <span>Détails du Produit</span>
                        </h3>

                        {/* Notice: Produits neufs uniquement */}
                        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                            <p className="text-sm text-blue-900 font-medium flex items-start gap-2">
                                <span className="text-xl">⚠️</span>
                                <span>
                                    <strong>Important:</strong> Produits neufs uniquement.
                                    Les articles d'occasion ne sont pas acceptés sur la plateforme.
                                </span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Cut Type */}
                            <div>
                                <label className="label mb-1 block">Type de coupe (optionnel)</label>
                                <select
                                    className="input"
                                    value={cutType}
                                    onChange={e => setCutType(e.target.value)}
                                >
                                    <option value="">Sélectionner...</option>
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
                                <label className="label mb-1 block">Guide des tailles (optionnel)</label>
                                <textarea
                                    className="input h-20 py-2"
                                    placeholder="Ex: Taille normalement, prenez votre taille habituelle"
                                    value={sizeGuide}
                                    onChange={e => setSizeGuide(e.target.value)}
                                />
                            </div>

                            {/* Country of Manufacture */}
                            <div>
                                <label className="label mb-1 block">Pays de fabrication (optionnel)</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Ex: Algérie, Turquie, France..."
                                    value={countryOfManufacture}
                                    onChange={e => setCountryOfManufacture(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Composition */}
                        <div>
                            <label className="label mb-1 block">Composition produit (optionnel)</label>
                            <textarea
                                className="input h-20 py-2"
                                placeholder="Ex: 100% Coton, 80% Polyester 20% Élasthanne..."
                                value={composition}
                                onChange={e => setComposition(e.target.value)}
                            />
                        </div>
                    </div>
            </div>

            {/* STORAGE LOCATION - MANDATORY */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span>📍</span>
                    <span>Localisation du Stock</span>
                    <span className="text-red-500 text-sm ml-2">* Obligatoire</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Storage Wilaya */}
                    <div>
                        <label className="label mb-1 block">
                            Wilaya de stockage <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="input"
                            value={storageWilaya}
                            onChange={e => setStorageWilaya(e.target.value)}
                            required
                        >
                            <option value="">Sélectionner une wilaya...</option>
                            {ALGERIA_WILAYAS.map(wilaya => (
                                <option key={wilaya} value={wilaya}>{wilaya}</option>
                            ))}
                        </select>
                    </div>

                    {/* Storage Zone */}
                    <div>
                        <label className="label mb-1 block">
                            Zone de stockage <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Ex: Centre-ville, Zone industrielle..."
                            value={storageZone}
                            onChange={e => setStorageZone(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <p className="text-xs text-gray-600 mt-3 flex items-start gap-2">
                    <span>💡</span>
                    <span>
                        Ces informations aident les clients à estimer les délais de livraison
                        et les frais de port selon leur localisation.
                    </span>
                </p>
            </div>

            {/* FREE DELIVERY OPTION */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span>🚚</span>
                    <span>Livraison Gratuite</span>
                    <span className="text-sm font-normal text-gray-600">(optionnel)</span>
                </h3>

                <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            checked={offersFreeDelivery}
                            onChange={e => setOffersFreeDelivery(e.target.checked)}
                        />
                        <span className="font-medium">J'offre la livraison gratuite pour ce produit</span>
                    </label>
                </div>

                {offersFreeDelivery && (
                    <div className="mt-4 pl-8">
                        <label className="label mb-1 block">
                            Montant minimum pour livraison gratuite (DA)
                        </label>
                        <input
                            type="number"
                            className="input max-w-xs"
                            placeholder="Ex: 5000"
                            value={freeDeliveryThreshold}
                            onChange={e => setFreeDeliveryThreshold(e.target.value)}
                            min="0"
                        />
                        <p className="text-xs text-gray-600 mt-2">
                            Si vide, la livraison sera gratuite sans condition de montant.
                        </p>
                    </div>
                )}

                <p className="text-xs text-gray-600 mt-3 flex items-start gap-2">
                    <span>💡</span>
                    <span>
                        <strong>Astuce:</strong> Offrir la livraison gratuite augmente vos ventes!
                        Un badge "Livraison gratuite" sera affiché sur votre produit.
                    </span>
                </p>
            </div>

            {/* Promotion Label */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border-2 border-red-200">
                <label className="label mb-2 block flex items-center gap-2">
                    <span className="text-lg">🏷️</span>
                    <span>Label Promotion (optionnel)</span>
                </label>
                <input
                    className="input mb-2"
                    placeholder="Ex: -20%, PROMO, SOLDES, NOUVEAU"
                    value={promotionLabel}
                    onChange={e => setPromotionLabel(e.target.value)}
                    maxLength={20}
                />
                <p className="text-xs text-gray-600 mt-1">
                    💡 <strong>Astuce:</strong> Ajoutez un badge accrocheur pour attirer l'attention !
                    Exemples: "-30%", "PROMO", "SOLDES", "NOUVEAU", "OFFRE LIMITÉE"
                </p>
                {promotionLabel && (
                    <div className="mt-3 p-2 bg-white rounded-lg border border-red-300">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Aperçu:</p>
                        <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            {promotionLabel}
                        </span>
                    </div>
                )}
            </div>

            {/* Variants Section */}
            <div className="bg-gray-50 p-4 rounded-xl border">
                <h3 className="font-bold mb-4">Variantes (Tailles & Couleurs)</h3>

                <div className="flex gap-2 items-end mb-4">
                    <div>
                        <label className="text-xs font-bold uppercase mb-1 block">Taille</label>
                        <select className="input h-10 w-24" value={vSize} onChange={e => setVSize(e.target.value)}>
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase mb-1 block">Couleur</label>
                        <input type="color" className="h-10 w-16 p-0 border-0" value={vColor} onChange={e => setVColor(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase mb-1 block">Stock</label>
                        <input type="number" className="input h-10 w-20" value={vStock} onChange={e => setVStock(parseInt(e.target.value))} />
                    </div>
                    <button type="button" onClick={addVariant} className="btn btn-secondary h-10 px-4">Ajouter</button>
                </div>

                <div className="space-y-2">
                    {variants.map((v, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-2 border rounded">
                            <span className="text-sm font-medium">Taille: {v.size}</span>
                            <div className="w-4 h-4 rounded-full border" style={{ background: v.color }}></div>
                            <span className="text-sm">Stock: {v.stock}</span>
                            <button type="button" onClick={() => removeVariant(i)} className="text-red-500 text-sm">X</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <button type="button" onClick={() => router.back()} className="btn btn-outline">Annuler</button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Publication...' : 'Publier le produit'}
                </button>
            </div>
        </form>
        </div >
    </div >
    );
}
