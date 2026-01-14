"use client";

import { useState } from "react";

export default function ReviewForm({ productId, onSuccess }: { productId: string, onSuccess?: () => void }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!userId) {
            setError("Veuillez vous connecter pour laisser un avis.");
            return;
        }
        if (rating === 0) {
            setError("Veuillez sélectionner une note.");
            return;
        }

        setLoading(true);

        try {
            let imageUrl = null;

            // 1. Upload Image if exists
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    imageUrl = data.url;
                } else {
                    throw new Error("L'upload de l'image a échoué");
                }
            }

            // 2. Submit Review
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    productId,
                    rating,
                    comment,
                    images: imageUrl // Sending single image for MVP, could be array joined
                })
            });

            if (res.ok) {
                setRating(0);
                setComment("");
                setFile(null);
                if (onSuccess) onSuccess();
                // Dispatch event for ReviewList to update
                window.dispatchEvent(new Event('review-added'));
            } else {
                throw new Error("Erreur lors de l'envoi de l'avis");
            }

        } catch (err: any) {
            setError(err.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    if (!userId) {
        return (
            <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-100">
                <p className="text-gray-500 mb-2">Connectez-vous pour partager votre avis.</p>
                <a href="/login" className="text-indigo-600 font-bold hover:underline">Se connecter</a>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4">Écrire un avis</h3>

            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

            {/* Rating */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Note</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className={`text-2xl transition-colors ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>

            {/* Comment */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Commentaire</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input w-full min-h-[100px]"
                    placeholder="Qu'avez-vous pensé de ce produit ?"
                />
            </div>

            {/* Photo Upload */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ajouter une photo (optionnel)</label>
                <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <span>📷</span> Choisir une photo
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </label>
                    {file && <span className="text-sm text-green-600 truncate max-w-[200px]">{file.name}</span>}
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {loading ? 'Envoi...' : 'Publier mon avis'}
            </button>
        </form>
    );
}
