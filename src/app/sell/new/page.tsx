"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

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

    useEffect(() => {
        // Fetch categories
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                // Flatten categories (parent + children)
                const allCategories: any[] = [];
                data.forEach((cat: any) => {
                    allCategories.push(cat);
                    if (cat.children) {
                        cat.children.forEach((child: any) => {
                            allCategories.push(child);
                        });
                    }
                });
                setCategories(allCategories);
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
                    promotionLabel: promotionLabel || null
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

                    <div>
                        <label className="label mb-1 block">Catégorie</label>
                        <select className="input" required value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                            <option value="">-- Sélectionnez une catégorie --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.parentId ? `  └─ ${cat.name}` : cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

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
            </div>
        </div>
    );
}
