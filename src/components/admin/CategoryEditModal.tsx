'use client';

import { useState } from 'react';
import HierarchicalCategorySelector from '@/components/HierarchicalCategorySelector';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    parentId?: string | null;
    image?: string | null;
    icon?: string | null;
    order: number;
    isActive: boolean;
    isFeatured: boolean;
    metaTitle?: string | null;
    metaDescription?: string | null;
    keywords?: string[];
}

interface Props {
    category: Category;
    allCategories: Category[];
    onClose: () => void;
    onSave: () => void;
}

export default function CategoryEditModal({ category, allCategories, onClose, onSave }: Props) {
    const [formData, setFormData] = useState({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId || '',
        image: category.image || '',
        icon: category.icon || '',
        order: category.order,
        isActive: category.isActive,
        isFeatured: category.isFeatured,
        metaTitle: category.metaTitle || '',
        metaDescription: category.metaDescription || '',
        keywords: category.keywords || []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState(formData.image);

    // Auto-generate slug from name
    const updateSlug = (name: string) => {
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        setFormData(prev => ({ ...prev, name, slug }));
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            // Set preview and URL
            setImagePreview(data.url);
            setFormData(prev => ({ ...prev, image: data.url }));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            handleImageUpload(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
        setFormData(prev => ({ ...prev, image: '' }));
    };

    const addKeyword = (keyword: string) => {
        if (keyword && !formData.keywords.includes(keyword)) {
            setFormData(prev => ({
                ...prev,
                keywords: [...prev.keywords, keyword]
            }));
        }
    };

    const removeKeyword = (keyword: string) => {
        setFormData(prev => ({
            ...prev,
            keywords: prev.keywords.filter(k => k !== keyword)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/admin/categories/${category.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors de la mise à jour');
            }

            onSave();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Modifier Catégorie</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Informations de base</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom de la catégorie *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => updateSlug(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Ex: Vêtements Femme"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Slug (URL) *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                                placeholder="vetements-femme"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                URL: /categories/{formData.slug || 'slug'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                rows={3}
                                placeholder="Description de la catégorie..."
                            />
                        </div>
                    </div>

                    {/* Hierarchy */}
                    <div className="space-y-4 border-t pt-5">
                        <h3 className="font-semibold text-gray-900">Hiérarchie</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Catégorie parente
                            </label>
                            <select
                                value={formData.parentId}
                                onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">Aucun (Catégorie racine)</option>
                                {allCategories
                                    .filter(c => c.id !== category.id)
                                    .map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* Display Settings */}
                    <div className="space-y-4 border-t pt-5">
                        <h3 className="font-semibold text-gray-900">Affichage</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Icône (emoji)
                                </label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-2xl text-center"
                                    placeholder="👗"
                                    maxLength={2}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ordre d'affichage
                                </label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    min={0}
                                />
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-gray-700">En vedette</span>
                            </label>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4 border-t pt-5">
                        <h3 className="font-semibold text-gray-900">Image de catégorie</h3>

                        {imagePreview ? (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                <label className="flex flex-col items-center cursor-pointer">
                                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="text-sm text-gray-600 mb-1">Cliquez pour uploader une image</span>
                                    <span className="text-xs text-gray-500">PNG, JPG, WEBP - Max 5MB</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                                {uploading && (
                                    <div className="mt-2 text-center text-sm text-indigo-600">
                                        Upload en cours...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SEO Section */}
                    <div className="space-y-4 border-t pt-5">
                        <h3 className="font-semibold text-gray-900">SEO & Référencement</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Titre Meta (SEO)
                            </label>
                            <input
                                type="text"
                                value={formData.metaTitle}
                                onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Titre pour les moteurs de recherche"
                                maxLength={60}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.metaTitle.length}/60 caractères
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description Meta (SEO)
                            </label>
                            <textarea
                                value={formData.metaDescription}
                                onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                rows={3}
                                placeholder="Description pour les moteurs de recherche"
                                maxLength={160}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.metaDescription.length}/160 caractères
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mots-clés
                            </label>
                            <div className="flex gap-2 mb-2 flex-wrap">
                                {formData.keywords.map(keyword => (
                                    <span
                                        key={keyword}
                                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-1"
                                    >
                                        {keyword}
                                        <button
                                            type="button"
                                            onClick={() => removeKeyword(keyword)}
                                            className="hover:text-indigo-900"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Ajoutez un mot-clé et appuyez sur Entrée"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addKeyword(e.currentTarget.value.trim());
                                        e.currentTarget.value = '';
                                    }
                                }}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Appuyez sur Entrée pour ajouter un mot-clé
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Enregistrement...
                                </>
                            ) : (
                                'Enregistrer'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
