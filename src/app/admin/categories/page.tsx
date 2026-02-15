"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Toast from '@/components/Toast';
import CategoryEditModal from '@/components/admin/CategoryEditModal';
import CategoryTree from '@/components/admin/CategoryTree';
import { logger } from '@/lib/logger';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    parentId: string | null;
    image?: string | null;
    icon?: string | null;
    order: number;
    isActive: boolean;
    isFeatured: boolean;
    _count: {
        products: number;
    };
}

interface DeleteConfirmation {
    categoryId: string;
    categoryName: string;
    productCount: number;
    subCount: number;
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', parentId: '' });
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'tree'>('tree'); // Default to tree view

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

    const handleReorder = async (updates: { id: string; order: number }[]) => {
        try {
            const res = await fetch('/api/admin/categories/reorder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            });

            if (!res.ok) {
                throw new Error('Failed to reorder');
            }

            showToastNotification('✅ Ordre mis à jour', 'success');
            fetchCategories(); // Refresh
        } catch (error) {
            logger.error('Error reordering categories', { error });
            showToastNotification('❌ Erreur lors de la réorganisation', 'error');
            throw error; // Re-throw to trigger rollback in CategoryTree
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
                showToastNotification('✅ Catégorie créée !', 'success');
                setNewCategory({ name: '', slug: '', parentId: '' });
                fetchCategories();
            } else {
                const data = await res.json();
                showToastNotification(`❌ ${data.error || 'Erreur'}`, 'error');
            }
        } catch (error) {
            logger.error("Error", { error: error });
            showToastNotification('❌ Erreur technique', 'error');
        }
    };

    const handleDeleteClick = async (category: Category) => {
        try {
            const res = await fetch(`/api/admin/categories/${category.id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (res.status === 409 && data.needsAction) {
                // Show confirmation dialog with options
                setDeleteConfirmation({
                    categoryId: category.id,
                    categoryName: category.name,
                    productCount: data.productCount,
                    subCount: data.subCount
                });
            } else if (res.ok) {
                showToastNotification('✅ Catégorie supprimée', 'success');
                fetchCategories();
            } else {
                showToastNotification(`❌ ${data.error || 'Erreur'}`, 'error');
            }
        } catch (error) {
            logger.error('Delete category exception', { error: error });
            showToastNotification('❌ Erreur de connexion', 'error');
        }
    };

    const handleDeleteConfirm = async (action: 'move' | 'uncategorize' | 'cascade', targetId?: string) => {
        if (!deleteConfirmation) return;

        try {
            const params = new URLSearchParams({ action });
            if (targetId) params.append('targetCategoryId', targetId);

            const res = await fetch(`/api/admin/categories/${deleteConfirmation.categoryId}?${params}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showToastNotification('✅ Catégorie supprimée', 'success');
                setDeleteConfirmation(null);
                fetchCategories();
            } else {
                const data = await res.json();
                showToastNotification(`❌ ${data.error}`, 'error');
            }
        } catch (error) {
            logger.error('Delete with action failed', { error });
            showToastNotification('❌ Erreur', 'error');
        }
    };

    // Helper to generate slug from name
    const updateSlug = (name: string) => {
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        setNewCategory(prev => ({ ...prev, name, slug }));
    };

    return (
        <div>
            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    duration={toastType === 'error' ? 10000 : 5000}
                    onClose={() => setShowToast(false)}
                />
            )}

            {editingCategory && (
                <CategoryEditModal
                    category={editingCategory}
                    allCategories={categories}
                    onClose={() => setEditingCategory(null)}
                    onSave={() => {
                        fetchCategories();
                        showToastNotification('✅ Catégorie mise à jour', 'success');
                    }}
                />
            )}

            {deleteConfirmation && (
                <DeleteConfirmationDialog
                    confirmation={deleteConfirmation}
                    categories={categories}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteConfirmation(null)}
                />
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestion des Catégories</h1>
                    <p className="text-gray-600 mt-1">{categories.length} catégories</p>
                </div>
                <div className="flex gap-2">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('tree')}
                            className={`px-4 py-2 rounded-md font-medium transition-all ${viewMode === 'tree'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-700'
                                }`}
                        >
                            🌳 Arbre
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-2 rounded-md font-medium transition-all ${viewMode === 'table'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-700'
                                }`}
                        >
                            📋 Table
                        </button>
                    </div>
                    <Link
                        href="/admin"
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        ← Retour
                    </Link>
                </div>
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
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
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
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium whitespace-nowrap"
                    >
                        Créer
                    </button>
                </form>
            </div>

            {/* List */}
            {viewMode === 'tree' ? (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Chargement...</div>
                    ) : (
                        <CategoryTree
                            categories={categories}
                            onEdit={(cat) => setEditingCategory(cat)}
                            onDelete={handleDeleteClick}
                            onReorder={handleReorder}
                        />
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nom</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Slug</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Parent</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Produits</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {categories.map(cat => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {cat.icon && <span className="text-xl">{cat.icon}</span>}
                                            <span className="font-medium text-gray-900">{cat.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{cat.slug}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {cat.parentId ? categories.find(p => p.id === cat.parentId)?.name : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">{cat._count.products}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {cat.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingCategory(cat)}
                                                className="text-indigo-600 hover:text-indigo-800 font-medium"
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(cat)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// Delete Confirmation Dialog Component
function DeleteConfirmationDialog({
    confirmation,
    categories,
    onConfirm,
    onCancel
}: {
    confirmation: DeleteConfirmation;
    categories: Category[];
    onConfirm: (action: 'move' | 'uncategorize' | 'cascade', targetId?: string) => void;
    onCancel: () => void;
}) {
    const [selectedCategory, setSelectedCategory] = useState('');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    ⚠️ Confirmer la suppression
                </h3>

                <p className="text-gray-700 mb-4">
                    La catégorie <strong>{confirmation.categoryName}</strong> contient:
                </p>

                <ul className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 space-y-2">
                    {confirmation.productCount > 0 && (
                        <li className="flex items-center gap-2 text-yellow-800">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span>{confirmation.productCount} produit(s)</span>
                        </li>
                    )}
                    {confirmation.subCount > 0 && (
                        <li className="flex items-center gap-2 text-yellow-800">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm10.293 2.293a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 10.586l4.293-4.293z" clipRule="evenodd" />
                            </svg>
                            <span>{confirmation.subCount} sous-catégorie(s)</span>
                        </li>
                    )}
                </ul>

                <div className="space-y-3">
                    {confirmation.productCount > 0 && (
                        <>
                            <button
                                onClick={() => {
                                    if (selectedCategory) {
                                        onConfirm('move', selectedCategory);
                                    } else {
                                        alert('Sélectionnez une catégorie de destination');
                                    }
                                }}
                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                            >
                                Déplacer les produits vers:
                            </button>
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="">Choisir catégorie...</option>
                                {categories
                                    .filter(c => c.id !== confirmation.categoryId)
                                    .map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                            </select>

                            <button
                                onClick={() => onConfirm('uncategorize')}
                                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                            >
                                Retirer la catégorie des produits
                            </button>
                        </>
                    )}

                    {confirmation.subCount > 0 && (
                        <button
                            onClick={() => onConfirm('cascade')}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                        >
                            Supprimer avec sous-catégories
                        </button>
                    )}

                    <button
                        onClick={onCancel}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}
