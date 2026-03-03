'use client';

import { useState, useEffect, useCallback } from 'react';
import { translations, type Lang, type TranslationKey } from '@/lib/translations';

export function useTranslation() {
    const [lang, setLang] = useState<Lang>('fr');

    useEffect(() => {
        // Initial sync from localStorage
        const stored = localStorage.getItem('achrilik_lang') as Lang | null;
        if (stored === 'ar' || stored === 'fr') {
            setLang(stored);
        }

        // Listen for language change events dispatched by Navbar
        const handleLangChange = (e: Event) => {
            const newLang = (e as CustomEvent<Lang>).detail;
            if (newLang === 'ar' || newLang === 'fr') {
                setLang(newLang);
            }
        };

        window.addEventListener('achrilik_lang_change', handleLangChange);
        return () => window.removeEventListener('achrilik_lang_change', handleLangChange);
    }, []);

    const tr = useCallback(
        (key: TranslationKey, params?: Record<string, string | number>): string => {
            const dict = translations[lang] as Record<string, string>;
            let text = dict[key] ?? (translations.fr as Record<string, string>)[key] ?? key;
            if (params) {
                Object.entries(params).forEach(([k, v]) => {
                    text = text.replace(`{${k}}`, String(v));
                });
            }
            return text;
        },
        [lang]
    );

    const isRTL = lang === 'ar';

    return { tr, lang, isRTL };
}
