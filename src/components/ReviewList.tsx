"use client";

import { useEffect, useState } from "react";

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    images: string | null;
    createdAt: string;
    user: {
        name: string | null;
    };
}

export default function ReviewList({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews || []); // Extract reviews array from API response object
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();

        // Listen for new reviews
        const handleNewReview = () => fetchReviews();
        window.addEventListener('review-added', handleNewReview);
        return () => window.removeEventListener('review-added', handleNewReview);
    }, [productId]);

    if (loading) return <div className="text-center py-4 text-gray-400">Chargement des avis...</div>;

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-3xl block mb-2">✨</span>
                <p className="text-gray-500 font-medium">Soyez le premier à donner votre avis !</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="font-bold text-xl text-gray-900 border-b pb-2">Avis Clients ({reviews.length})</h3>
            <div className="space-y-6">
                {(reviews || []).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                    {(review.user.name || 'A')[0]}
                                </div>
                                <span className="font-bold text-gray-900">{review.user.name || 'Anonyme'}</span>
                            </div>
                            <span className="text-xs text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="flex text-yellow-400 text-sm mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                            ))}
                        </div>

                        {review.comment && (
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                        )}

                        {review.images && (
                            <div className="flex gap-2 mt-2">
                                {review.images.split(',').map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Review ${idx}`}
                                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 active:scale-150 transition-transform origin-bottom-left z-10"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
