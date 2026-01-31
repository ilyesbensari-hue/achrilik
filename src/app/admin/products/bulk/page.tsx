
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// Helper to build hierarchy
const buildHierarchy = (flatCategories: any[]) => {
    const map = new Map();
    flatCategories.forEach(c => map.set(c.id, { ...c, children: [] }));
    const roots: any[] = [];

    flatCategories.forEach(c => {
        if (c.parentId && map.has(c.parentId)) {
            map.get(c.parentId).children.push(map.get(c.id));
        } else {
            roots.push(map.get(c.id));
        }
    });

    // Flatten for dropdown
    const options: any[] = [];
    const traverse = (nodes: any[], level = 0, path = '') => {
        nodes.sort((a, b) => a.name.localeCompare(b.name));
        for (const node of nodes) {
            const currentPath = path ? `${path} > ${node.name}` : node.name;
            options.push({
                id: node.id,
                name: node.name,
                slug: node.slug,
                level,
                fullPath: currentPath
            });
            if (node.children.length > 0) {
                traverse(node.children, level + 1, currentPath);
            }
        }
    };
    traverse(roots);
    return options;
};

export default function BulkEditorPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedStore, setSelectedStore] = useState('');

    // Local state: { productId: { categoryId?: string, status?: string } }
    const [edits, setEdits] = useState<Record<string, { categoryId?: string, status?: string }>>({});

    useEffect(() => {
        fetchData();
    }, [selectedStore]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedStore) params.set('storeId', selectedStore);

            const res = await fetch(`/api/admin/products/bulk-editor?${params.toString()}`);
            const data = await res.json();

            if (data.products) setProducts(data.products);
            if (data.categories) setCategories(data.categories);
            if (data.stores) setStores(data.stores);
        } catch (e) {
            alert('Erreur chargement');
        } finally {
            setLoading(false);
        }
    };

    // Memoize sorted options
    const sortedCategories = useMemo(() => buildHierarchy(categories), [categories]);
    // Create map for quick lookup
    const catMap = useMemo(() => {
        const m = new Map();
        sortedCategories.forEach(c => m.set(c.id, c));
        return m;
    }, [sortedCategories]);

    const handleCategoryChange = (productId: string, newCatId: string) => {
        setEdits(prev => ({
            ...prev,
            [productId]: { ...prev[productId], categoryId: newCatId }
        }));
    };

    const handleStatusChange = (productId: string, newStatus: string) => {
        setEdits(prev => ({
            ...prev,
            [productId]: { ...prev[productId], status: newStatus }
        }));
    };

    const saveChanges = async () => {
        setSaving(true);
        const updates = Object.entries(edits).map(([id, changes]) => ({
            id,
            ...changes
        }));

        try {
            const res = await fetch('/api/admin/products/bulk-editor', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            });
            if (res.ok) {
                alert('Sauvegardé avec succès !');
                setEdits({});
                fetchData();
            } else {
                alert('Erreur sauvegarde');
            }
        } catch (e) {
            alert('Erreur technique');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Éditeur en Masse</h1>
                    <p className="text-gray-500">Gérez rapidement les catégories et statuts de vos produits.</p>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/admin/products"
                        className="px-4 py-2 text-gray-700 bg-white border rounded hover:bg-gray-50"
                    >
                        Retour
                    </Link>
                    <button
                        onClick={saveChanges}
                        disabled={saving || Object.keys(edits).length === 0}
                        className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 disabled:opacity-50 font-bold"
                    >
                        {saving ? 'Enregistrement...' : `Sauvegarder (${Object.keys(edits).length})`}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
                <span className="font-medium text-gray-700">Filtrer par Boutique:</span>
                <select
                    className="border rounded p-2 min-w-[200px]"
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                >
                    <option value="">Toutes les boutiques</option>
                    {stores.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <button onClick={() => fetchData()} className="text-indigo-600 hover:underline">
                    Rafraîchir
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-gray-500">Chargement des données...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 w-16">Img</th>
                                <th className="p-4 w-1/4">Produit / Boutique</th>
                                <th className="p-4 w-1/3">Catégorie (Hiérarchie)</th>
                                <th className="p-4">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y relative">
                            {products.map(p => {
                                const currentCatId = edits[p.id]?.categoryId !== undefined ? edits[p.id]!.categoryId : p.categoryId;
                                const originalCat = catMap.get(p.categoryId);
                                const currentSelection = catMap.get(currentCatId);
                                const isEdited = edits[p.id];

                                return (
                                    <tr key={p.id} className={isEdited ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                        <td className="p-4">
                                            {p.image ? (
                                                <img src={p.image} className="w-10 h-10 object-cover rounded bg-gray-200" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-200 rounded" />
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900">{p.title}</div>
                                            <div className="text-xs text-gray-500">{p.storeName}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500 mb-1">
                                                    Actuel: {originalCat ? originalCat.fullPath : 'Non classé'}
                                                </div>
                                                <select
                                                    className="border border-gray-300 rounded p-1.5 w-full text-sm"
                                                    value={currentCatId || ''}
                                                    onChange={(e) => handleCategoryChange(p.id, e.target.value)}
                                                >
                                                    <option value="">-- Sélectionner --</option>
                                                    {sortedCategories.map(c => (
                                                        <option key={c.id} value={c.id}>
                                                            {'\u00A0'.repeat(c.level * 4)} {c.level > 0 ? '↳ ' : ''}{c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {currentSelection && currentSelection.id !== originalCat?.id && (
                                                    <div className="text-xs text-green-600 font-medium">
                                                        → {currentSelection.fullPath}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                className={`border rounded p-1.5 text-sm font-bold w-full ${(edits[p.id]?.status || p.status) === 'APPROVED'
                                                        ? 'text-green-700 bg-green-50'
                                                        : 'text-red-700 bg-red-50'
                                                    }`}
                                                value={edits[p.id]?.status || p.status || 'PENDING'}
                                                onChange={(e) => handleStatusChange(p.id, e.target.value)}
                                            >
                                                <option value="APPROVED">En Ligne</option>
                                                <option value="PENDING">En Attente</option>
                                                <option value="REJECTED">Rejeté</option>
                                                <option value="ARCHIVED">Archivé</option>
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
