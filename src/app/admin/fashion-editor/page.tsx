
'use client';

import { useState, useEffect } from 'react';

export default function FashionEditorPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Local state for edits: { productId: newCategoryId }
    const [edits, setEdits] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/fashion-editor');
            const data = await res.json();
            if (data.products) setProducts(data.products);
            if (data.categories) setCategories(data.categories);
        } catch (e) {
            alert('Erreur chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (productId: string, newCatId: string) => {
        setEdits(prev => ({ ...prev, [productId]: newCatId }));
    };

    const saveChanges = async () => {
        setSaving(true);
        const updates = Object.entries(edits).map(([id, categoryId]) => ({ id, categoryId }));

        try {
            const res = await fetch('/api/admin/fashion-editor', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            });
            if (res.ok) {
                alert('Sauvegardé avec succès !');
                setEdits({});
                fetchData(); // Refresh
            } else {
                alert('Erreur sauvegarde');
            }
        } catch (e) {
            alert('Erreur technique');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Chargement...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Éditeur 'Fashion Oran' (Base de Données)</h1>
                    <button
                        onClick={saveChanges}
                        disabled={saving || Object.keys(edits).length === 0}
                        className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 disabled:opacity-50"
                    >
                        {saving ? 'Enregistrement...' : `Sauvegarder (${Object.keys(edits).length} modifiés)`}
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-4">Image</th>
                                <th className="p-4">Titre Produit</th>
                                <th className="p-4">Catégorie Actuelle</th>
                                <th className="p-4">Changer la Catégorie</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map(p => {
                                const currentCatId = edits[p.id] || p.categoryId;
                                return (
                                    <tr key={p.id} className={edits[p.id] ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                        <td className="p-4">
                                            {p.image && <img src={p.image} className="w-12 h-12 object-cover rounded" />}
                                        </td>
                                        <td className="p-4 font-medium">{p.title}</td>
                                        <td className="p-4 text-gray-500">
                                            {p.categoryName} <br />
                                            <span className="text-xs text-gray-400">({p.slug})</span>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                className="border rounded p-2 w-full max-w-xs"
                                                value={currentCatId || ''}
                                                onChange={(e) => handleCategoryChange(p.id, e.target.value)}
                                            >
                                                <option value="">-- Sans Catégorie --</option>
                                                {categories.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name} ({c.slug})
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
