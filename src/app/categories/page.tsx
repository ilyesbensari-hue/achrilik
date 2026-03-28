'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles, TrendingUp, Tag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

interface Category {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    children?: Category[];
}

// Arabic names mapped by slug (for DB categories)
const CATEGORY_AR_NAMES: Record<string, string> = {
    // === Top-level categories ===
    femmes: 'ملابس المرأة',
    hommes: 'ملابس الرجل',
    enfants: 'ملابس الأطفال',
    accessoires: 'إكسسوارات',
    maroquinerie: 'الجلديات',
    electronique: 'الإلكترونيات والتقنية',
    chaussures: 'أحذية',
    // === Vêtements Femme ===
    'tops-femme': 'توبات نسائية',
    't-shirts-femme': 'تيشيرتات نسائية',
    'debardeurs-femme': 'ديباردور نسائي',
    'blouses-femme': 'بلوزات نسائية',
    'robes-femme': 'فساتين',
    'robes-courtes-femme': 'فساتين قصيرة',
    'robes-longues-femme': 'فساتين طويلة',
    'robes-soiree-femme': 'فساتين سهرة',
    'jupes-femme': 'تنانير',
    'jupes-courtes-femme': 'تنانير قصيرة',
    'jupes-longues-femme': 'تنانير طويلة',
    'pantalons-femme': 'بناطيل نسائية',
    'jeans-femme': 'جينز نسائي',
    'leggings-femme': 'ليغنغ',
    'taille-haute-femme': 'بناطيل خصر عالٍ',
    'combinaisons-femme': 'أوفيرول نسائي',
    'sweats-pulls-femme': 'سويتشيرت ومولون نسائي',
    'vestes-manteaux-femme': 'جاكيتات ومعاطف نسائية',
    'blazers-femme': 'بلازر نسائي',
    'manteaux-femme': 'معاطف نسائية',
    'doudounes-femme': 'داون جاكيت نسائي',
    'lingerie-femme': 'لانجري',
    'pyjamas-femme': 'بيجامات ومنزلية نسائية',
    'sport-femme': 'ملابس رياضية نسائية',
    'vtements-de-prire': 'ملابس الصلاة',
    // === Vêtements Enfants ===
    'bebe': 'ملابس الرضع',
    'bodies-bebe': 'بودي للرضع',
    'ensembles-bebe': 'أطقم للرضع',
    'pyjamas-bebe': 'بيجامات للرضع',
    'garcon': 'ملابس الأولاد',
    't-shirts-garcon': 'تيشيرتات الأولاد',
    'pantalons-garcon': 'بناطيل الأولاد',
    'vestes-garcon': 'جاكيتات الأولاد',
    'fille': 'ملابس البنات',
    'robes-fille': 'فساتين البنات',
    'jupes-fille': 'تنانير البنات',
    't-shirts-fille': 'تيشيرتات البنات',
    'unisexe-enfant': 'ملابس مشتركة للأطفال',
    'scolaire-enfant': 'ملابس مدرسية',
    'sport-enfant': 'ملابس رياضية للأطفال',
    'vetements-de-priere-enfant': 'ملابس الصلاة للأطفال',
    // === Accessoires ===
    'chapeaux-casquettes': 'قبعات وكاسكيت',
    'ceintures': 'أحزمة',
    'echarpes-foulards': 'طواري وأوشحة',
    'gants': 'قفازات',
    'lunettes': 'نظارات',
    'lunettes-soleil': 'نظارات شمسية',
    'lunettes-vue': 'نظارات طبية',
    'bijoux': 'مجوهرات',
    'colliers': 'قلادات',
    'bracelets': 'أساور',
    'boucles-oreilles': 'حلق',
    'montres': 'ساعات',
    // === Maroquinerie ===
    'sacs': 'حقائب',
    'sacs-main': 'حقائب يد',
    'sacs-dos': 'حقائب ظهر',
    'sacs-voyage': 'حقائب سفر',
    'portefeuilles': 'محافظ',
    'porte-cartes': 'حامل بطاقات',
    'porte-monnaie': 'محفظة نقود',
    'trousses': 'حقيبة مستلزمات',
    'sacoches': 'شنط صغيرة',
    // === Électronique & Tech ===
    'telephones-accessoires': 'الهواتف والملحقات',
    'coques': 'كفرات هاتف',
    'coques-silicone': 'كفر سيليكون',
    'coques-rigide': 'كفر صلب',
    'coques-anti-choc': 'كفر مضاد للصدمات',
    'protege-ecrans': 'واقيات شاشة',
    'batteries-energie': 'بطاريات وطاقة',
    'power-banks': 'باور بانك',
    'cables-charge': 'كابلات شحن',
    'chargeurs-secteur': 'شواحن كهربائية',
    'chargeurs-voiture': 'شواحن سيارة',
    'audio': 'صوتيات',
    'ecouteurs-filaires': 'سماعات سلكية',
    'ecouteurs-sans-fil': 'سماعات لاسلكية',
    'casques-audio': 'سماعات رأس',
    'supports-gadgets': 'حوامل وأدوات',
    'supports-telephone': 'حوامل هاتف',
    'anneaux-maintien': 'حلقات هاتف',
    // === Vêtements Homme ===
    't-shirts-homme': 'تيشيرتات رجالية',
    'manches-courtes-homme': 'أكمام قصيرة',
    'manches-longues-homme': 'أكمام طويلة',
    'oversize-homme': 'أوفرسايز',
    't-shirts-manches-courtes-homme': 'تيشيرت أكمام قصيرة',
    'chemises-homme': 'قمصان رجالية',
    'chemises-classiques-homme': 'قمصان كلاسيكية',
    'chemises-casual-homme': 'قمصان كاجوال',
    'chemises-manches-courtes-homme': 'قمصان أكمام قصيرة',
    'polos-homme': 'بولو رجالي',
    'sweats-hoodies-homme': 'سويتشيرت وهودي رجالي',
    'vestes-manteaux-homme': 'جاكيتات ومعاطف رجالية',
    'vestes-legeres-homme': 'جاكيتات خفيفة',
    'manteaux-homme': 'معاطف رجالية',
    'doudounes-homme': 'داون جاكيت رجالي',
    'pantalons-homme': 'بناطيل رجالية',
    'jeans-homme': 'جينز رجالي',
    'chinos-homme': 'شينو رجالي',
    'cargo-homme': 'بنطال كارغو',
    'shorts-bermudas-homme': 'شورت وبيرمودا',
    'costumes-blazers-homme': 'بدلات وبلازر',
    'sous-vetements-homme': 'ملابس داخلية رجالية',
    'pyjamas-homewear-homme': 'بيجامات ومنزلية رجالية',
    'sport-homme': 'ملابس رياضية رجالية',
    'tenues-de-prire': 'ملابس الصلاة للرجال',
    // === Chaussures ===
    'chaussures-hommes': 'أحذية رجالية',
    'baskets-homme': 'كروسي رجالي',
    'souliers-homme': 'حذاء رسمي رجالي',
    'sandales-homme': 'صنادل رجالية',
    'chaussures-femmes': 'أحذية نسائية',
    'baskets-femme': 'كروسي نسائي',
    'escarpins-femme': 'إسكاربان',
    'sandales-femme': 'صنادل نسائية',
    'bottes-femme': 'بوط نسائي',
    'chaussures-enfants': 'أحذية الأطفال',
    // === Legacy slugs (kept for backward compat) ===
    'robes': 'فساتين',
    'tops': 'توبات',
    'pantalons': 'بناطيل',
    'jupes': 'تنانير',
    'vestes': 'جاكيتات',
    'manteaux': 'معاطف',
    'sous-vetements': 'ملابس داخلية',
    'pyjamas': 'بيجامات',
    'maillots-de-bain': 'ملابس السباحة',
    'chemises': 'قمصان',
    'pulls': 'بلوفرات',
    'costumes': 'بدلات',
    'shorts': 'شورتات',
    'joggings': 'جوغينغات',
    'foulards': 'أوشحة',
    'chapeaux': 'قبعات',
    'smartphones': 'هواتف ذكية',
    'tablettes': 'أجهزة لوحية',
    'accessoires-tech': 'ملحقات التقنية',
    'casques': 'سماعات',
    'chaussures-femme': 'أحذية المرأة',
    'chaussures-homme': 'أحذية الرجل',
    'chaussures-enfant': 'أحذية الأطفال',
};

function getCategoryName(slug: string, frName: string, lang: 'fr' | 'ar'): string {
    if (lang === 'ar') {
        return CATEGORY_AR_NAMES[slug] || frName;
    }
    return frName;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const { lang, isRTL } = useLanguage();
    const t = translations[lang];

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828]"></div>
            </div>
        );
    }

    // Sort categories in specific order
    const sortedCategories = [...categories].sort((a, b) => {
        const order = ['femmes', 'hommes', 'enfants', 'maroquinerie', 'accessoires', 'chaussures', 'electronique'];
        const aIndex = order.findIndex(slug => a.slug === slug || a.name.toLowerCase().includes(slug));
        const bIndex = order.findIndex(slug => b.slug === slug || b.name.toLowerCase().includes(slug));

        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.name.localeCompare(b.name);
    });

    const pageTitle = lang === 'ar' ? 'الفئات' : 'Catégories';
    const pageSubtitle = lang === 'ar' ? 'استكشف مجموعتنا حسب الفئة' : 'Explorez notre collection par catégorie';
    const allCategoriesTitle = lang === 'ar' ? 'جميع الفئات' : 'Toutes les catégories';
    const promoLabel = lang === 'ar' ? 'العروض' : 'Promos';
    const promoSub = lang === 'ar' ? 'عروض خاصة' : 'Offres spéciales';
    const newLabel = lang === 'ar' ? 'وصل حديثاً' : 'Nouveautés';
    const newSub = lang === 'ar' ? 'أحدث الوصولات' : 'Dernières arrivées';
    const seeAll = lang === 'ar' ? 'عرض الكل' : 'Voir tous';

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="container mx-auto px-4 py-6 pb-24">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[#C62828] to-purple-600 bg-clip-text text-transparent mb-2">
                        {pageTitle}
                    </h1>
                    <p className="text-gray-600 text-sm">{pageSubtitle}</p>
                </div>

                {/* Special Links */}
                <div className="space-y-3 mb-8">
                    <Link
                        href="/categories/promotions"
                        className="group flex items-center justify-between bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                <Tag className="w-6 h-6" />
                            </div>
                            <div className={isRTL ? 'text-right' : ''}>
                                <span className="font-bold text-lg block">{promoLabel}</span>
                                <span className="text-xs text-white/80">{promoSub}</span>
                            </div>
                        </div>
                        <ChevronRight className={`w-6 h-6 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>

                    <Link
                        href="/nouveautes"
                        className="group flex items-center justify-between bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div className={isRTL ? 'text-right' : ''}>
                                <span className="font-bold text-lg block">{newLabel}</span>
                                <span className="text-xs text-white/80">{newSub}</span>
                            </div>
                        </div>
                        <ChevronRight className={`w-6 h-6 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                </div>

                {/* Category List */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className={`text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="w-1 h-6 bg-gradient-to-b from-[#C62828] to-purple-600 rounded-full"></div>
                        {allCategoriesTitle}
                    </h2>

                    {sortedCategories.map((topCategory, index) => {
                        const isExpanded = expandedCategories.has(topCategory.id);
                        const hasSubcategories = topCategory.children && topCategory.children.length > 0;
                        const displayName = getCategoryName(topCategory.slug, topCategory.name, lang);

                        return (
                            <div key={topCategory.id} className={`${index > 0 ? 'mt-6' : ''}`}>
                                {/* Top-level category */}
                                <button
                                    onClick={() => hasSubcategories && toggleCategory(topCategory.id)}
                                    className="w-full group flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl mb-2 hover:from-rose-50 hover:to-purple-50 transition-all hover:shadow-md"
                                >
                                    <h3 className={`text-lg font-bold text-gray-900 uppercase tracking-wide group-hover:text-[#C62828] transition-colors ${isRTL ? 'text-right' : ''}`}>
                                        {displayName}
                                    </h3>
                                    <ChevronRight
                                        className={`w-6 h-6 text-gray-400 group-hover:text-[#C62828] transition-all ${isExpanded ? 'rotate-90' : ''} ${isRTL ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Subcategories */}
                                {isExpanded && topCategory.children && topCategory.children.length > 0 && (
                                    <div className="space-y-2 ml-2 mb-4">
                                        {/* "Voir tous" link */}
                                        <Link
                                            href={`/categories/${topCategory.slug}`}
                                            className="group flex items-center justify-between px-5 py-3 rounded-xl bg-gradient-to-r from-[#C62828]/5 to-purple-600/5 hover:from-[#C62828]/10 hover:to-purple-600/10 transition-all border border-[#C62828]/20 hover:shadow-md"
                                        >
                                            <span className="font-bold text-[#C62828] group-hover:text-[#B71C1C] transition-colors">
                                                {seeAll}
                                            </span>
                                            <ChevronRight className={`w-5 h-5 text-[#C62828] group-hover:translate-x-1 transition-all ${isRTL ? 'rotate-180' : ''}`} />
                                        </Link>

                                        {/* Sort subcategories for Vêtements */}
                                        {[...topCategory.children].sort((a, b) => {
                                            if (topCategory.slug === 'femmes' || topCategory.slug === 'hommes' || topCategory.slug === 'enfants') {
                                                const order = ['femme', 'homme', 'enfant', 'bébé', 'bebe', 'fille', 'garcon'];
                                                const aIndex = order.findIndex(name => a.slug.includes(name) || a.name.toLowerCase().includes(name));
                                                const bIndex = order.findIndex(name => b.slug.includes(name) || b.name.toLowerCase().includes(name));
                                                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                                                if (aIndex !== -1) return -1;
                                                if (bIndex !== -1) return 1;
                                            }
                                            return a.name.localeCompare(b.name);
                                        }).map(subCategory => {
                                            const subDisplayName = getCategoryName(subCategory.slug, subCategory.name, lang);
                                            return (
                                                <div key={subCategory.id}>
                                                    <Link
                                                        href={`/categories/${subCategory.slug}`}
                                                        className="group flex items-center justify-between px-5 py-3 rounded-xl hover:bg-gradient-to-r hover:from-rose-50 hover:to-purple-50 transition-all border border-transparent hover:border-[#C62828]/20 hover:shadow-md"
                                                    >
                                                        <span className={`font-semibold text-gray-800 group-hover:text-[#C62828] transition-colors ${isRTL ? 'text-right' : ''}`}>
                                                            {subDisplayName}
                                                        </span>
                                                        <ChevronRight className={`w-5 h-5 text-gray-400 group-hover:text-[#C62828] group-hover:translate-x-1 transition-all ${isRTL ? 'rotate-180' : ''}`} />
                                                    </Link>

                                                    {/* Sub-subcategories */}
                                                    {subCategory.children && subCategory.children.length > 0 && (
                                                        <div className="ml-8 mt-1 space-y-1">
                                                            {subCategory.children.map(subSubCategory => {
                                                                const subSubDisplayName = getCategoryName(subSubCategory.slug, subSubCategory.name, lang);
                                                                return (
                                                                    <Link
                                                                        key={subSubCategory.id}
                                                                        href={`/categories/${subSubCategory.slug}`}
                                                                        className="group flex items-center justify-between px-4 py-2 rounded-lg hover:bg-white/60 transition-all text-sm"
                                                                    >
                                                                        <span className={`text-gray-600 group-hover:text-[#C62828] transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover:bg-[#C62828]"></span>
                                                                            {subSubDisplayName}
                                                                        </span>
                                                                        <ChevronRight className={`w-4 h-4 text-gray-300 group-hover:text-[#C62828] group-hover:translate-x-1 transition-all ${isRTL ? 'rotate-180' : ''}`} />
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
