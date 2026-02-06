'use client';

import { useState, useEffect } from 'react';
import { RatingStars } from './RatingStars';
import { User, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';

interface Review {
    id: string;
    rating: number;
    title?: string;
    comment?: string;
    isVerifiedPurchase: boolean;
    createdAt: string;
    User: {
        name: string;
    };
}

interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

interface ProductReviewsProps {
    productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            const data = await res.json();

            if (res.ok) {
                setReviews(data.reviews || []);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (rating === 0) {
            setError('Veuillez sélectionner une note');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    rating,
                    title,
                    comment
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Erreur lors de la soumission');
                return;
            }

            setSuccess(true);
            setRating(0);
            setTitle('');
            setComment('');
            setShowForm(false);

            // Refresh reviews
            fetchReviews();
        } catch (error) {
            setError('Erreur de connexion');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8">
            {/* Review Summary */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Avis clients</h2>

                {stats && stats.totalReviews > 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-5xl font-black text-gray-900 mb-2">
                                    {stats.averageRating.toFixed(1)}
                                </div>
                                <RatingStars rating={stats.averageRating} size="md" />
                                <p className="text-sm text-gray-600 mt-2">
                                    {stats.totalReviews} avis
                                </p>
                            </div>

                            <div className="flex-1">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = stats.ratingDistribution[star as keyof typeof stats.ratingDistribution];
                                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                                    return (
                                        <div key={star} className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-medium text-gray-700 w-12">
                                                {star} ⭐
                                            </span>
                                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-400 transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600 w-12">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <p className="text-gray-600">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
                    </div>
                )}
            </div>

            {/* Add Review Button/Form */}
            <div className="mb-8">
                {!user ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                        <p className="text-blue-800 font-medium mb-3">
                            ✍️ Connectez-vous pour partager votre avis
                        </p>
                        <Link
                            href="/login"
                            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            Se connecter
                        </Link>
                    </div>
                ) : showForm ? (
                    <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Votre avis</h3>

                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <p className="text-green-800 text-sm">Merci pour votre avis !</p>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Note <span className="text-rose-500">*</span>
                            </label>
                            <RatingStars
                                rating={rating}
                                interactive
                                onChange={setRating}
                                size="lg"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Titre (optionnel)
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                placeholder="Résumez votre expérience"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Commentaire (optionnel)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                                placeholder="Partagez votre expérience avec ce produit..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 px-6 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Envoi...' : 'Publier mon avis'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full bg-white border-2 border-rose-500 text-rose-600 py-3 px-6 rounded-lg font-bold hover:bg-rose-50 transition-colors"
                    >
                        ✍️ Écrire un avis
                    </button>
                )}
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {review.User.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{review.User.name || 'Utilisateur'}</p>
                                    <div className="flex items-center gap-2">
                                        <RatingStars rating={review.rating} size="sm" />
                                        {review.isVerifiedPurchase && (
                                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Achat vérifié
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                        </div>

                        {review.title && (
                            <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
                        )}

                        {review.comment && (
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
