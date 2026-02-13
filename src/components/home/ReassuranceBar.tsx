'use client';

import { Truck, CreditCard } from 'lucide-react';

export default function ReassuranceBar() {
    return (
        <div className="px-4 mb-6">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {/* Livraison */}
                <div className="flex-shrink-0 flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3 min-w-[200px]">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-sm">
                        <Truck className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 leading-tight">Livraison Top</span>
                        <span className="text-[10px] text-gray-500 font-medium">Oran & Environs</span>
                    </div>
                </div>

                {/* Paiement */}
                <div className="flex-shrink-0 flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3 min-w-[200px]">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600 shadow-sm">
                        <CreditCard className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 leading-tight">Paiement Cash</span>
                        <span className="text-[10px] text-gray-500 font-medium">À la livraison</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
