'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: { name: string | null };
}

interface ProductReviewsProps {
    productId: string;
}

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(star)}
                    className="p-0.5 transition-transform hover:scale-110"
                    aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                >
                    <svg
                        className={`w-7 h-7 transition-colors ${
                            star <= (hovered || value) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
        </div>
    );
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [canReview, setCanReview] = useState(false);
    const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);
    const [loadingReviews, setLoadingReviews] = useState(true);

    // Form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        // Load reviews
        fetch(`/api/reviews?productId=${productId}`)
            .then((r) => r.json())
            .then((data) => {
                setReviews(Array.isArray(data) ? data : data.reviews || []);
            })
            .catch(() => setReviews([]))
            .finally(() => setLoadingReviews(false));

        // Check if current user can review
        if (user) {
            fetch(`/api/reviews/can-review?productId=${productId}`)
                .then((r) => r.json())
                .then((data) => {
                    setCanReview(data.canReview);
                    setHasAlreadyReviewed(data.hasAlreadyReviewed);
                })
                .catch(() => {});
        }
    }, [productId, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setSubmitError('Veuillez sélectionner une note.');
            return;
        }
        setSubmitting(true);
        setSubmitError('');

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, rating, comment }),
            });

            if (!res.ok) {
                const data = await res.json();
                setSubmitError(data.error || 'Une erreur est survenue.');
            } else {
                setSubmitSuccess(true);
                setHasAlreadyReviewed(true);
                // Refresh reviews
                fetch(`/api/reviews?productId=${productId}`)
                    .then((r) => r.json())
                    .then((data) => setReviews(Array.isArray(data) ? data : data.reviews || []));
            }
        } catch {
            setSubmitError('Une erreur est survenue. Réessayez.');
        } finally {
            setSubmitting(false);
        }
    };

    // Average rating
    const avgRating =
        reviews.length > 0
            ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
            : null;

    if (loadingReviews) return null;

    return (
        <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    ⭐ Avis clients
                    {avgRating !== null && (
                        <span className="text-base font-normal text-gray-500 ml-2 bg-gray-100 px-3 py-1 rounded-full">
                            {avgRating}/5 · {reviews.length} avis
                        </span>
                    )}
                </h2>
            </div>

            {/* --- Contextual call-to-action ABOVE the form --- */}
            {!user && (
                <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
                    <span className="text-xl">🔐</span>
                    <p className="text-sm text-blue-800">
                        <a href="/login" className="font-bold underline underline-offset-2">Connectez-vous</a>
                        {' '}pour laisser un avis sur ce produit.
                    </p>
                </div>
            )}
            {user && !canReview && !hasAlreadyReviewed && (
                <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
                    <span className="text-xl">🛍️</span>
                    <p className="text-sm text-amber-800">
                        <strong>Achat requis.</strong> Vous devez avoir commandé et reçu ce produit pour laisser un avis.
                    </p>
                </div>
            )}

            {/* Review Form — only for verified buyers */}
            {canReview && !hasAlreadyReviewed && !submitSuccess && (
                <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6">
                    <h3 className="font-bold text-gray-900 mb-1">Partagez votre expérience</h3>
                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                        Acheteur vérifié — vous avez acheté ce produit
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                            <StarInput value={rating} onChange={setRating} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Commentaire <span className="text-gray-400">(facultatif)</span>
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                maxLength={500}
                                placeholder="Décrivez votre expérience avec ce produit..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                        </div>
                        {submitError && (
                            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{submitError}</p>
                        )}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Envoi...' : 'Publier mon avis'}
                        </button>
                    </form>
                </div>
            )}

            {submitSuccess && (
                <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                        <p className="font-bold text-green-800">Merci pour votre avis !</p>
                        <p className="text-sm text-green-600">Il sera visible par tous les acheteurs.</p>
                    </div>
                </div>
            )}

            {hasAlreadyReviewed && !submitSuccess && (
                <div className="mb-6 text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-xl">
                    ✅ Vous avez déjà laissé un avis pour ce produit.
                </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl">
                    <p className="text-4xl mb-3">💬</p>
                    <p className="font-medium text-gray-600">Aucun avis pour le moment.</p>
                    {!user ? (
                        <p className="text-sm mt-2 text-gray-500">
                            <a href="/login" className="text-[#006233] font-semibold underline underline-offset-2">Connectez-vous</a>
                            {' '}et commandez pour partager votre avis.
                        </p>
                    ) : !canReview && !hasAlreadyReviewed ? (
                        <p className="text-sm mt-2 text-gray-500">
                            Achetez ce produit pour laisser un avis.
                        </p>
                    ) : null}
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                        {(review.user.name || 'A')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{review.user.name || 'Acheteur'}</p>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                            ✓ Acheteur vérifié
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <StarDisplay rating={review.rating} />
                                    <span className="text-xs text-gray-400">
                                        {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                            {review.comment && (
                                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
