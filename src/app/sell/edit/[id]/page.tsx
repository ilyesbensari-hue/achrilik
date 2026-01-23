"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

export default function EditProductPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [storeId, setStoreId] = useState('');

    // Product Fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [images, setImages] = useState<string[]>([]);

    // Variants
    const [variants, setVariants] = useState<{ size: string, color: string, stock: number }[]>([]);

    // Variant Input
    const [vSize, setVSize] = useState('M');
    const [vColor, setVColor] = useState('#000000');
    const [vStock, setVStock] = useState(10);

    useEffect(() => {
        const userId = localStorage.getItem('userId');

        // Fetch product data
        fetch(`/api/products/${params.id}`)
            .then(res => res.json())
            .then(product => {
                setTitle(product.title);
                setDescription(product.description);
                setPrice(product.price.toString());
                setImages(product.images.split(',').filter(Boolean));
                setVariants(product.Variant || []);
                setStoreId(product.StoreId);
                setLoading(false);
            })
            .catch(() => {
                alert('Erreur lors du chargement du produit');
                router.push('/sell');
            });
    }, [params.id, router]);

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

        setSaving(true);
        try {
            const res = await fetch(`/api/products/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    price: parseFloat(price),
                    images: images.join(','),
                    variants
                })
            });

            if (res.ok) {
                router.push('/sell');
            } else {
                alert('Erreur lors de la mise à jour');
            }
        } catch (e) {
            alert('Erreur technique');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="container py-10 text-center">Chargement...</div>;
    }

    return (
        <div className="container py-10">
            <div className="card max-w-2xl mx-auto p-8">
                <h1 className="text-2xl font-bold mb-6">Éditer le produit</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="label mb-1 block">Titre du produit</label>
                        <input className="input" required value={title} onChange={e => setTitle(e.target.value)} />
                    </div>

                    <div>
                        <label className="label mb-1 block">Description</label>
                        <textarea className="input h-24 py-2" required value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label mb-1 block">Prix (DA)</label>
                            <input className="input" type="number" required value={price} onChange={e => setPrice(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="label mb-1 block">Images du produit</label>
                        <ImageUpload onImagesChange={setImages} maxImages={5} initialImages={images} />
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
                        <button type="submit" disabled={saving} className="btn btn-primary">
                            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
