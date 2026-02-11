"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Toast from '@/components/Toast';
import { logger } from '@/lib/logger';

interface Category {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    other_Category: Category[]; // subcategories
    _count: {
        Product: number;
    };
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', parentId: '' });
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        fetchCategories();
    }, []);

    const showToastNotification = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            logger.error("Error", { error: error });
            showToastNotification('Erreur lors du chargement', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategory)
            });

            if (res.ok) {
                showToastNotification('Catégorie créée !', 'success');
                setNewCategory({ name: '', slug: '', parentId: '' });
                fetchCategories();
            } else {
                showToastNotification('Erreur lors de la création', 'error');
            }
        } catch (error) {
            logger.error("Error", { error: error });
            showToastNotification('Erreur technique', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer cette catégorie ?')) return;

        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showToastNotification('Catégorie supprimée', 'success');
                fetchCategories();
            } else {
                const err = await res.json();
                showToastNotification(err.error || 'Erreur', 'error');
            }
        } catch (error) {
            logger.error("Error", { error: error });
            showToastNotification('Erreur technique', 'error');
        }
    };

    // Helper to generate slug from name
    const updateSlug = (name: string) => {
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        setNewCategory(prev => ({ ...prev, name, slug }));
    };

    return (
        <div>
            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            )}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Catégories</h1>
                <Link
                    href="/admin"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                    ← Retour
                </Link>
            </div>

            {/* Create Form */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold mb-4">Nouvelle Catégorie</h2>
                <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input
                            type="text"
                            required
                            value={newCategory.name}
                            onChange={e => updateSlug(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input
                            type="text"
                            required
                            value={newCategory.slug}
                            onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent (Optionnel)</label>
                        <select
                            value={newCategory.parentId}
                            onChange={e => setNewCategory({ ...newCategory, parentId: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                        >
                            <option value="">Aucun (Catégorie principale)</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                    >
                        Créer
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">Nom</th>
                            <th className="px-6 py-3 text-left">Slug</th>
                            <th className="px-6 py-3 text-left">Parent</th>
                            <th className="px-6 py-3 text-left">Produits</th>
                            <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td className="px-6 py-4 font-medium">{cat.name}</td>
                                <td className="px-6 py-4 text-gray-500">{cat.slug}</td>
                                <td className="px-6 py-4 text-gray-500">
                                    {cat.parentId ? categories.find(p => p.id === cat.parentId)?.name : '-'}
                                </td>
                                <td className="px-6 py-4">{cat._count.Product}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
