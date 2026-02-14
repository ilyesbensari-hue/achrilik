
'use client';

import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

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

export default function FashionEditorPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Local state: { productId: { categoryId?: string, status?: string } }
    const [edits, setEdits] = useState<Record<string, { categoryId?: string, status?: string }>>({});

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
            toast.error('❌ Erreur chargement');
        } finally {
            setLoading(false);
        }
    };

    // Memoize sorted options
    const sortedCategories = useMemo(() => buildHierarchy(categories), [categories]);
    // Create map for quick lookup of full names
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
        const toastId = toast.loading('Sauvegarde...');
        setSaving(true);
        const updates = Object.entries(edits).map(([id, changes]) => ({
            id,
            ...changes
        }));

        try {
            const res = await fetch('/api/admin/fashion-editor', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            });
            if (res.ok) {
                toast.success('✅ Sauvegardé avec succès', { id: toastId });
                setEdits({});
                setTimeout(() => fetchData(), 500);
            } else {
                toast.error('❌ Erreur sauvegarde', { id: toastId });
            }
        } catch (e) {
            toast.error('❌ Erreur technique', { id: toastId });
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
                                <th className="p-4">Produit</th>
                                <th className="p-4 w-1/3">Sélectionner la Catégorie (Hiérarchie)</th>
                                <th className="p-4">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map(p => {
                                const currentCatId = edits[p.id]?.categoryId !== undefined ? edits[p.id]!.categoryId : p.categoryId;
                                const originalCat = catMap.get(p.categoryId);
                                const currentSelection = catMap.get(currentCatId);

                                return (
                                    <tr key={p.id} className={edits[p.id] ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                        <td className="p-4 w-16">
                                            {p.image ? (
                                                <img src={p.image} className="w-12 h-12 object-cover rounded" />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded" />
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold">{p.title}</div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                Actuel: {originalCat ? (
                                                    <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-700">
                                                        {originalCat.fullPath}
                                                    </span>
                                                ) : <span className="text-red-500">Non classé</span>}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                className="border border-gray-300 rounded p-2 w-full text-sm font-medium"
                                                value={currentCatId || ''}
                                                onChange={(e) => handleCategoryChange(p.id, e.target.value)}
                                                style={{ minWidth: '300px' }}
                                            >
                                                <option value="">-- Sélectionner une catégorie --</option>
                                                {sortedCategories.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {'\u00A0'.repeat(c.level * 4)} {c.level > 0 ? '↳ ' : ''}{c.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {currentSelection && currentSelection.id !== originalCat?.id && (
                                                <div className="text-xs text-green-600 mt-1">
                                                    Nouveau: {currentSelection.fullPath}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <select
                                                className={`border rounded p-2 text-sm font-bold ${(edits[p.id]?.status || p.status) === 'APPROVED'
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
                </div>
            </div>
        </div>
    );
}
