"use client";

import { useTranslation } from '@/hooks/useTranslation';

export default function DeliveryBanner() {
    const { tr, lang } = useTranslation();

    const frSlogan = '"Li ychoufek ybghik, avec Achrilik !"';
    const arSlogan = '"لي يشوفك يبغيك، مع أشريليك!"';

    return (
        <div className="bg-gradient-to-r from-[#D21034] to-[#a80d2a] text-white py-3 px-4">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8 text-center animate-fade-in">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🚀</span>
                        <p className="font-bold text-sm md:text-base tracking-wide">
                            {lang === 'ar' ? 'اطلب الآن، ادفع عند التسليم!' : 'Commandez maintenant, payez à la livraison !'}
                        </p>
                    </div>
                    <div className="hidden md:block w-px h-6 bg-white/40"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📍</span>
                        <p className="font-semibold text-sm md:text-base">
                            <span className="text-yellow-300 font-bold">
                                {lang === 'ar' ? 'توصيل في وهران' : 'Livraison sur Oran'}
                            </span>
                            {' '}— {lang === 'ar' ? 'سريع وآمن' : 'Rapide et Sécurisée'}
                        </p>
                    </div>
                    <div className="hidden md:block w-px h-6 bg-white/40"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🔥</span>
                        <p className="font-bold text-sm md:text-base italic text-yellow-100">
                            {lang === 'ar' ? arSlogan : frSlogan}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
