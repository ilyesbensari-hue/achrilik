'use client';

import { Truck, X } from 'lucide-react';

interface FreeDeliveryIncentivePopupProps {
    storeName: string;
    currentAmount: number;
    threshold: number;
    amountNeeded: number;
    storeId: string;
    onClose: () => void;
}

export default function FreeDeliveryIncentivePopup({
    storeName,
    currentAmount,
    threshold,
    amountNeeded,
    storeId,
    onClose
}: FreeDeliveryIncentivePopupProps) {
    const handleViewProducts = () => {
        // Navigate to store's products
        window.location.href = `/stores/${storeId}`;
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-fade-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center">
                    {/* Icon */}
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                        <Truck className="w-10 h-10 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Livraison Gratuite à portée ! 🎉
                    </h3>

                    {/* Store name */}
                    <p className="text-gray-600 mb-6">
                        Chez <strong className="text-[#006233]">{storeName}</strong>
                    </p>

                    {/* Amount info */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 mb-6">
                        <p className="text-sm text-gray-700 mb-3">
                            Votre panier chez ce vendeur :
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mb-4">
                            {currentAmount.toLocaleString()} DA
                        </p>

                        <div className="bg-white rounded-lg p-4 border border-green-300">
                            <p className="text-lg font-bold text-green-600 mb-1">
                                Ajoutez seulement {amountNeeded.toLocaleString()} DA
                            </p>
                            <p className="text-sm text-gray-600">
                                et profitez de la <strong>livraison gratuite</strong> !
                            </p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-6">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((currentAmount / threshold) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {Math.round((currentAmount / threshold) * 100)}% vers la livraison gratuite
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Plus tard
                        </button>
                        <button
                            onClick={handleViewProducts}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-colors shadow-lg"
                        >
                            Voir les produits
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
