'use client';

import { useTranslation } from '@/hooks/useTranslation';

interface LoyaltyBadgeProps {
    totalSpent: number; // total DA spent on delivered orders
    compact?: boolean;
}

function getLoyaltyLevel(total: number) {
    if (total >= 50000) return { level: 'Or', levelAr: 'ذهبي', color: 'from-yellow-500 to-amber-400', textColor: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: '🥇', next: null, points: total };
    if (total >= 20000) return { level: 'Argent', levelAr: 'فضي', color: 'from-gray-400 to-slate-300', textColor: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: '🥈', next: 50000, points: total };
    if (total >= 5000)  return { level: 'Bronze', levelAr: 'برونزي', color: 'from-orange-600 to-amber-500', textColor: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: '🥉', next: 20000, points: total };
    return { level: 'Nouveau', levelAr: 'جديد', color: 'from-green-400 to-emerald-300', textColor: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: '🌱', next: 5000, points: total };
}

export default function LoyaltyBadge({ totalSpent, compact = false }: LoyaltyBadgeProps) {
    const { lang } = useTranslation();
    const loyalty = getLoyaltyLevel(totalSpent);
    const points = Math.floor(totalSpent); // 1 DA = 1 point

    if (compact) {
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${loyalty.bg} border ${loyalty.border}`}>
                <span>{loyalty.icon}</span>
                <span className={`text-xs font-bold ${loyalty.textColor}`}>
                    {lang === 'ar' ? loyalty.levelAr : loyalty.level}
                </span>
                <span className={`text-xs ${loyalty.textColor} opacity-70`}>
                    {points.toLocaleString('fr-DZ')} pts
                </span>
            </div>
        );
    }

    const progress = loyalty.next ? Math.min((totalSpent / loyalty.next) * 100, 100) : 100;
    const remaining = loyalty.next ? loyalty.next - totalSpent : 0;

    return (
        <div className={`rounded-2xl border ${loyalty.border} ${loyalty.bg} p-5`}>
            <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${loyalty.color} flex items-center justify-center text-2xl shadow-md`}>
                    {loyalty.icon}
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        {lang === 'ar' ? 'مستوى الولاء' : 'Niveau fidélité'}
                    </p>
                    <h3 className={`text-xl font-black ${loyalty.textColor}`}>
                        {lang === 'ar' ? loyalty.levelAr : loyalty.level}
                    </h3>
                </div>
                <div className="ml-auto text-right">
                    <p className={`text-2xl font-black ${loyalty.textColor}`}>
                        {points.toLocaleString('fr-DZ')}
                    </p>
                    <p className="text-xs text-gray-500">{lang === 'ar' ? 'نقطة' : 'points'}</p>
                </div>
            </div>

            {loyalty.next && (
                <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>{lang === 'ar' ? 'المستوى الحالي' : 'Niveau actuel'}</span>
                        <span>{lang === 'ar'
                            ? `${remaining.toLocaleString('fr-DZ')} دج للمستوى التالي`
                            : `${remaining.toLocaleString('fr-DZ')} DA pour le niveau suivant`
                        }</span>
                    </div>
                    <div className="w-full bg-white/70 rounded-full h-2.5 overflow-hidden border border-white/50">
                        <div
                            className={`h-full bg-gradient-to-r ${loyalty.color} rounded-full transition-all duration-700`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {!loyalty.next && (
                <p className={`text-sm font-semibold ${loyalty.textColor} mt-1`}>
                    {lang === 'ar' ? '🏆 أنت من أوفى عملائنا!' : '🏆 Vous êtes notre client le plus fidèle !'}
                </p>
            )}

            <p className="text-xs text-gray-500 mt-3">
                {lang === 'ar'
                    ? '💡 كل دينار تنفقه = نقطة ولاء'
                    : '💡 1 DA dépensé = 1 point de fidélité'
                }
            </p>
        </div>
    );
}
