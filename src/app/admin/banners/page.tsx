'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface Banner {
    id: string;
    title: string;
    title_ar?: string | null;
    subtitle: string | null;
    subtitle_ar?: string | null;
    image: string;
    videoUrl?: string | null; // NEW: Support vidéo
    link: string | null;
    buttonText: string;
    buttonText_ar?: string | null;
    isActive: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export default function BannersManagementPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        title_ar: '',
        subtitle: '',
        subtitle_ar: '',
        image: '',
        videoUrl: '', // NEW
        link: '',
        buttonText: "Voir l'offre",
        buttonText_ar: '',
        isActive: true,
        order: 0,
        height: 110 // NEW: Hauteur personnalisable (px)
    });
    const [imagePreview, setImagePreview] = useState<string>('');
    const [videoPreview, setVideoPreview] = useState<string>(''); // NEW

    useEffect(() => {
        fetchBanners();
    }, []);

    async function fetchBanners() {
        try {
            const res = await fetch('/api/admin/banners');
            const data = await res.json();
            setBanners(data || []);
        } catch (error) {
            logger.error('Error fetching banners:', { error });
        } finally {
            setLoading(false);
        }
    }

    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image trop grande (max 5MB)');
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setFormData({ ...formData, image: base64 });
            setImagePreview(base64);
        };
        reader.readAsDataURL(file);
    }

    function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (10MB max for video - Vercel limit)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Vidéo trop grande (max 10MB pour éviter timeout serveur)');
            return;
        }

        // Validate file type
        if (!file.type.match(/video\/(mp4|webm)/) && !file.type.match(/image\/gif/)) {
            toast.error('Format non supporté. Utilisez MP4, WebM ou GIF animé.');
            return;
        }

        // Convert to base64 (for demonstration, consider upload to storage in production)
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setFormData({ ...formData, videoUrl: base64 });
            setVideoPreview(base64);
        };
        reader.readAsDataURL(file);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Validation: Titre + (Image OU Vidéo)
        if (!formData.title) {
            toast.error('Le titre est requis');
            return;
        }

        if (!formData.image && !formData.videoUrl) {
            toast.error('Vous devez uploader soit une image, soit une vidéo');
            return;
        }

        const toastId = toast.loading('Sauvegarde...');
        try {
            const method = editingBanner ? 'PUT' : 'POST';
            const body = editingBanner
                ? { ...formData, id: editingBanner.id }
                : formData;

            const res = await fetch('/api/admin/banners', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success(editingBanner ? '✅ Banner modifié avec succès' : '✅ Banner créé avec succès', { id: toastId });
                await fetchBanners();
                resetForm();
            } else {
                const errorData = await res.json();
                logger.error('API Error:', { errorData });
                toast.error(`❌ ${errorData.error || 'Impossible de sauvegarder le banner'}`, { id: toastId });
            }
        } catch (error) {
            logger.error('Error saving banner:', { error });
            toast.error('❌ Erreur serveur: vérifiez la taille des fichiers (Image: max 5MB, Vidéo: max 10MB)', { id: toastId });
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Supprimer ce banner?')) return;

        const toastId = toast.loading('Suppression...');
        try {
            const res = await fetch(`/api/admin/banners?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('✅ Banner supprimé', { id: toastId });
                await fetchBanners();
            } else {
                toast.error('❌ Erreur lors de la suppression', { id: toastId });
            }
        } catch (error) {
            logger.error('Error deleting banner:', { error });
            toast.error('❌ Erreur réseau', { id: toastId });
        }
    }

    async function toggleActive(banner: Banner) {
        try {
            const res = await fetch('/api/admin/banners', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: banner.id,
                    isActive: !banner.isActive
                })
            });

            if (res.ok) {
                await fetchBanners();
            }
        } catch (error) {
            logger.error('Error toggling active:', { error });
        }
    }

    function editBanner(banner: Banner) {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            title_ar: banner.title_ar || '',
            subtitle: banner.subtitle || '',
            subtitle_ar: banner.subtitle_ar || '',
            image: banner.image,
            videoUrl: banner.videoUrl || '', // NEW
            link: banner.link || '',
            buttonText: banner.buttonText,
            buttonText_ar: banner.buttonText_ar || '',
            isActive: banner.isActive,
            order: banner.order,
            height: 110  // Keep default
        });
        setImagePreview(banner.image);
        setVideoPreview(banner.videoUrl || ''); // NEW
        setShowForm(true);
    }

    function resetForm() {
        setFormData({
            title: '',
            title_ar: '',
            subtitle: '',
            subtitle_ar: '',
            image: '',
            videoUrl: '', // NEW
            link: '',
            buttonText: "Voir l'offre",
            buttonText_ar: '',
            isActive: true,
            order: 0,
            height: 110  // Default height
        });
        setImagePreview('');
        setVideoPreview(''); // NEW
        setEditingBanner(null);
        setShowForm(false);
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="text-center">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Banners Promo</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#006233] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#005028] transition"
                >
                    <Plus className="h-5 w-5" />
                    Ajouter un Banner
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                    <h2 className="text-xl font-bold mb-4">
                        {editingBanner ? 'Modifier le Banner' : 'Nouveau Banner'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Left Column - Form Fields */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Titre (FR) *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">عنوان (AR)</label>
                                        <input
                                            type="text"
                                            value={formData.title_ar}
                                            onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg text-right"
                                            dir="rtl"
                                            placeholder="العنوان بالعربية"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Sous-titre (FR)</label>
                                        <input
                                            type="text"
                                            value={formData.subtitle}
                                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">عنوان فرعي (AR)</label>
                                        <input
                                            type="text"
                                            value={formData.subtitle_ar}
                                            onChange={(e) => setFormData({ ...formData, subtitle_ar: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg text-right"
                                            dir="rtl"
                                            placeholder="العنوان الفرعي"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Texte du Bouton (FR)</label>
                                        <input
                                            type="text"
                                            value={formData.buttonText}
                                            onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">نص الزر (AR)</label>
                                        <input
                                            type="text"
                                            value={formData.buttonText_ar}
                                            onChange={(e) => setFormData({ ...formData, buttonText_ar: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg text-right"
                                            dir="rtl"
                                            placeholder="نص الزر"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Lien (URL)</label>
                                    <input
                                        type="text"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        placeholder="/categories/promotions"
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Ordre</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <label className="text-sm font-medium">Actif</label>
                                </div>
                            </div>

                            {/* Right Column - Image Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Image du Banner</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    {imagePreview ? (
                                        <div className="space-y-2">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview('');
                                                    setFormData({ ...formData, image: '' });
                                                }}
                                                className="text-sm text-red-600 hover:underline"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-8">
                                            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 mb-2">PNG, JPG, GIF, WebP (max 5MB)</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="banner-upload"
                                            />
                                            <label
                                                htmlFor="banner-upload"
                                                className="inline-block bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200"
                                            >
                                                Choisir une image
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* NEW: Video Upload Section */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Vidéo/Animation (Optionnel)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        {videoPreview ? (
                                            <div className="space-y-2">
                                                <video
                                                    src={videoPreview}
                                                    className="w-full h-48 object-cover rounded-lg"
                                                    controls
                                                    muted
                                                    loop
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setVideoPreview('');
                                                        setFormData({ ...formData, videoUrl: '' });
                                                    }}
                                                    className="text-sm text-red-600 hover:underline"
                                                >
                                                    Supprimer vidéo
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="py-8">
                                                <p className="text-sm text-gray-600 mb-2">
                                                    MP4, WebM, GIF (max 50MB)
                                                </p>
                                                <input
                                                    type="file"
                                                    accept="video/mp4,video/webm,image/gif"
                                                    onChange={handleVideoUpload}
                                                    className="hidden"
                                                    id="video-upload"
                                                />
                                                <label
                                                    htmlFor="video-upload"
                                                    className="inline-block bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200"
                                                >
                                                    Choisir une vidéo
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        ⚠️ <strong>Vous devez fournir soit une image, soit une vidéo (au moins l'un des deux)</strong>. Si les deux sont fournis, la vidéo sera affichée en priorité.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="bg-[#006233] text-white px-6 py-2 rounded-lg hover:bg-[#005028]"
                            >
                                {editingBanner ? 'Mettre à jour' : 'Créer'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Banners List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aperçu</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Titre</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sous-titre</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Lien</th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Ordre</th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Statut</th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {banners.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    Aucun banner. Cliquez sur "Ajouter un Banner" pour commencer.
                                </td>
                            </tr>
                        ) : (
                            banners.map((banner) => (
                                <tr key={banner.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <img
                                            src={banner.image}
                                            alt={banner.title}
                                            className="h-16 w-24 object-cover rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium">{banner.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{banner.subtitle || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-blue-600">{banner.link || '-'}</td>
                                    <td className="px-6 py-4 text-center">{banner.order}</td>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={banner.isActive}
                                            onChange={() => toggleActive(banner)}
                                            className="h-5 w-5 rounded border-gray-300 text-[#006233] focus:ring-[#006233] cursor-pointer"
                                            title={banner.isActive ? 'Cliquez pour désactiver' : 'Cliquez pour activer'}
                                        />
                                        <span className={`block text-xs mt-1 font-medium ${banner.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                            {banner.isActive ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => editBanner(banner)}
                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                                                title="Modifier"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
