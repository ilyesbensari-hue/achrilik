'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import Link from 'next/link';
import HierarchicalCategorySelector from '@/components/HierarchicalCategorySelector';
import { getSizeConfig } from '@/lib/variantHelpers';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);

    // Product Fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [promotionLabel, setPromotionLabel] = useState('');

    // Enhanced Product Details
    const [cutType, setCutType] = useState('');
    const [sizeGuide, setSizeGuide] = useState('');
    const [countryOfManufacture, setCountryOfManufacture] = useState('');
    const [composition, setComposition] = useState('');

    // Badges
    // NOTE: isNew, isTrending, isBestSeller states removed - managed automatically

    // NEW: Additional Product Details
    const [material, setMaterial] = useState('');
    const [fit, setFit] = useState('');
    const [neckline, setNeckline] = useState('');
    const [pattern, setPattern] = useState('');
    const [careInstructions, setCareInstructions] = useState('');
    const [brand, setBrand] = useState('');

    // NEW: Warranty
    const [warranty, setWarranty] = useState('');

    // Variants - Updated to support dimensions
    const [variants, setVariants] = useState<{
        size?: string | null,
        color: string,
        stock: number,
        length?: number | null,
        width?: number | null,
        height?: number | null
    }[]>([]);

    // Variant Input
    const [vSize, setVSize] = useState('');
    const [vColor, setVColor] = useState('#000000');
    const [vStock, setVStock] = useState(10);

    // Dimension inputs (for bags)
    const [productLength, setProductLength] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');

    useEffect(() => {
        fetchProduct();
        fetchCategories();
    }, [id]);

    // Get size configuration based on selected category
    const selectedCategory = categories.find(c => c.id === categoryId);
    const sizeConfig = getSizeConfig(selectedCategory?.slug, selectedCategory?.name);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();

            // Recursively flatten ALL categories
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
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${id}`);
            const data = await res.json();

            if (res.ok) {
                setTitle(data.title);
                setDescription(data.description);
                setPrice(data.price.toString());
                setCategoryId(data.categoryId || '');
                setImages(data.images.split(','));
                setPromotionLabel(data.promotionLabel || '');
                setCutType(data.cutType || '');
                setSizeGuide(data.sizeGuide || '');
                setCountryOfManufacture(data.countryOfManufacture || '');
                setComposition(data.composition || '');
                // NEW: Load additional fields
                setMaterial(data.material || '');
                setFit(data.fit || '');
                setNeckline(data.neckline || '');
                setPattern(data.pattern || '');
                setCareInstructions(data.careInstructions || '');
                setBrand(data.brand || '');
                setWarranty(data.warranty || '');
                // NOTE: Badges ne sont plus chargés ni modifiables par les vendeurs
                setVariants(data.Variant.map((v: any) => ({
                    size: v.size || null,
                    color: v.color,
                    stock: v.stock,
                    length: v.length || null,
                    width: v.width || null,
                    height: v.height || null
                })));

                // Initialize first variant size if available
                if (data.Variant.length > 0 && data.Variant[0].size) {
                    setVSize(data.Variant[0].size);
                }
            } else {
                alert('Produit introuvable');
                router.push('/sell/analytics');
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
            alert('Erreur lors du chargement');
        } finally {
            setLoadingProduct(false);
        }
    };

    const addVariant = () => {
        // Validate based on category
        if (!vColor || !vStock) {
            alert('Veuillez renseigner la couleur et le stock.');
            return;
        }

        // Handle size/dimensions based on category
        let currentSize: string | null = vSize || null;
        let currentLength: number | null = null;
        let currentWidth: number | null = null;
        let currentHeight: number | null = null;

        if (sizeConfig.showDimensions) {
            // Bags - dimensions required
            if (!productLength || !width || !height) {
                alert('Veuillez renseigner les dimensions (Longueur, Largeur, Hauteur).');
                return;
            }
            currentLength = parseFloat(productLength);
            currentWidth = parseFloat(width);
            currentHeight = parseFloat(height);
            currentSize = vSize || null; // Size is optional for bags
        } else if (sizeConfig.required && !currentSize) {
            // Size required for clothing/shoes
            alert(`Veuillez sélectionner une ${sizeConfig.sizeLabel}.`);
            return;
        }

        setVariants([...variants, {
            size: currentSize,
            color: vColor,
            stock: vStock,
            length: currentLength,
            width: currentWidth,
            height: currentHeight
        }]);
    };

    const removeVariant = (index: number) => {
        const newVariants = [...variants];
        newVariants.splice(index, 1);
        setVariants(newVariants);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId) return alert('Veuillez sélectionner une catégorie complète');
        if (variants.length === 0) return alert('Ajoutez au moins une variante');
        if (images.length === 0) return alert('Ajoutez au moins une image');

        setLoading(true);
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    price: parseFloat(price),
                    images: images.join(','),
                    categoryId: categoryId || null,
                    promotionLabel: promotionLabel || null,
                    cutType: cutType || null,
                    sizeGuide: sizeGuide || null,
                    countryOfManufacture: countryOfManufacture || null,
                    composition: composition || null,
                    // NEW: Additional fields
                    material: material || null,
                    fit: fit || null,
                    neckline: neckline || null,
                    pattern: pattern || null,
                    careInstructions: careInstructions || null,
                    brand: brand || null,
                    warranty: warranty || null,
                    // NOTE: Badges ne sont plus envoyés - calculés côté serveur
                    variants
                })
            });

            if (res.ok) {
                // Revalidate homepage cache to show updated product
                try {
                    await fetch('/api/admin/revalidate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            paths: ['/', '/categories/[slug]', '/nouveautes']
                        })
                    });
                } catch (e) {
                    console.log('Cache revalidation failed (non-critical)');
                }

                router.push(`/sell`);
            } else {
                const error = await res.json();
                alert('Erreur lors de la mise à jour: ' + (error.error || 'Erreur inconnue'));
            }
        } catch (e) {
            alert('Erreur technique');
        } finally {
            setLoading(false);
        }
    };

    if (loadingProduct) {
        return (
            <div className="container py-10">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006233] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement du produit...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-10">
            <div className="card max-w-2xl mx-auto p-8">
                <div className="mb-6">
                    <Link href="/sell" className="text-[#006233] hover:underline">
                        ← Retour au tableau de bord
                    </Link>
                    <h1 className="text-2xl font-bold mt-4">Modifier le produit</h1>
                </div>

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
                        categories={categories}
                        value={categoryId}
                        onChange={setCategoryId}
                    />


                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label mb-1 block">Prix (DA)</label>
                            <input className="input" type="number" required value={price} onChange={e => setPrice(e.target.value)} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
                        <label className="label mb-1 block flex items-center gap-2">
                            <span className="text-lg">🏷️</span>
                            Label Promotion (optionnel)
                        </label>
                        <input
                            className="input mb-2"
                            placeholder="Ex: -20%, PROMO, SOLDES, NOUVEAU"
                            value={promotionLabel}
                            onChange={e => setPromotionLabel(e.target.value)}
                            maxLength={20}
                        />
                        <p className="text-xs text-gray-600 mb-2">
                            Ajoutez un badge promotionnel qui apparaîtra sur votre produit (max 20 caractères)
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

                    {/* Enhanced Product Details Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                            <span>📋</span>
                            Détails du produit (optionnel)
                        </h3>
                        <p className="text-xs text-gray-600 mb-4">
                            Ces informations aident vos clients à faire le bon choix
                        </p>

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

                            {/* Country of Manufacture - MOVED UP */}
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

                            {/* Warranty */}
                            <div className="bg-green-50 p-4 rounded-xl border-2 border-green-300">
                                <label className="label mb-2 block flex items-center gap-2">
                                    <span className="text-lg">🛡️</span>
                                    <span>Garantie (optionnel mais recommandé)</span>
                                </label>
                                <select
                                    className="input mb-2"
                                    value={warranty}
                                    onChange={e => setWarranty(e.target.value)}
                                >
                                    <option value="">Aucune garantie</option>
                                    <option value="3 mois">3 mois</option>
                                    <option value="6 mois">6 mois (recommandé pour électronique)</option>
                                    <option value="1 an">1 an</option>
                                    <option value="2 ans">2 ans</option>
                                </select>
                                <p className="text-xs text-gray-600 flex items-start gap-2">
                                    <span>💡</span>
                                    <span>
                                        <strong>Astuce:</strong> Offrir une garantie rassure vos clients et augmente vos ventes !
                                        <strong className="block mt-1 text-green-700">Pour l'électronique, une garantie de 6 mois est fortement recommandée.</strong>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* NOTE: Section "Badges Produit" retirée - badges gérés automatiquement */}

                    <div>
                        <label className="label mb-1 block">Images du produit</label>
                        <ImageUpload onImagesChange={setImages} maxImages={5} initialImages={images} />
                    </div>

                    {/* Variants Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border">
                        <h3 className="font-bold mb-4">
                            {sizeConfig.sizeLabel ? `Variantes (${sizeConfig.sizeLabel} & Couleurs)` : 'Variantes (Couleurs & Stock)'}
                        </h3>

                        {/* Size Selection - Dynamic based on category */}
                        {sizeConfig.options.length > 0 && (
                            <div className="mb-4">
                                <label className="label mb-1 block">
                                    {sizeConfig.sizeLabel}{sizeConfig.required ? ' *' : ' (optionnel)'}
                                </label>
                                <select
                                    className="input"
                                    value={vSize}
                                    onChange={e => setVSize(e.target.value)}
                                    required={sizeConfig.required}
                                >
                                    {!sizeConfig.required && <option value="">Aucune taille</option>}
                                    {sizeConfig.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Dimensions - Show for bags */}
                        {sizeConfig.showDimensions && (
                            <div className="mb-4 grid grid-cols-3 gap-3">
                                <div>
                                    <label className="label mb-1 block">L (cm) *</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="Longueur"
                                        value={productLength}
                                        onChange={e => setProductLength(e.target.value)}
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <label className="label mb-1 block">l (cm) *</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="Largeur"
                                        value={width}
                                        onChange={e => setWidth(e.target.value)}
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <label className="label mb-1 block">H (cm) *</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="Hauteur"
                                        value={height}
                                        onChange={e => setHeight(e.target.value)}
                                        step="0.1"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Color & Stock */}
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end mb-4">
                            <div className="flex-1 sm:flex-initial">
                                <label className="text-xs font-bold uppercase mb-1 block">Couleur *</label>
                                <input type="color" className="h-10 w-full sm:w-16 p-0 border-0 rounded" value={vColor} onChange={e => setVColor(e.target.value)} />
                            </div>
                            <div className="flex-1 sm:flex-initial">
                                <label className="text-xs font-bold uppercase mb-1 block">Stock *</label>
                                <input type="number" className="input h-10 w-full sm:w-20" value={vStock} onChange={e => setVStock(parseInt(e.target.value))} />
                            </div>
                            <button type="button" onClick={addVariant} className="btn btn-secondary h-10 px-4 w-full sm:w-auto">Ajouter</button>
                        </div>

                        {/* Variant List */}
                        <div className="space-y-2">
                            {variants.map((v, i) => (
                                <div key={i} className="flex flex-wrap items-center justify-between gap-2 bg-white p-2 border rounded">
                                    {v.size && <span className="text-sm font-medium">{sizeConfig.sizeLabel}: {v.size}</span>}
                                    {v.length && v.width && v.height && (
                                        <span className="text-sm font-medium">{v.length}×{v.width}×{v.height} cm</span>
                                    )}
                                    <div className="w-4 h-4 rounded-full border" style={{ background: v.color }}></div>
                                    <span className="text-sm">Stock: {v.stock}</span>
                                    <button type="button" onClick={() => removeVariant(i)} className="text-red-500 text-sm ml-auto">X</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link href="/sell" className="btn btn-outline">
                            Annuler
                        </Link>
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
