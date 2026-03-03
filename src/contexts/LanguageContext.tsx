'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Lang } from '@/lib/translations';

interface LanguageContextType {
    lang: Lang;
    isRTL: boolean;
    setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'fr',
    isRTL: false,
    setLang: () => { },
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>('fr');

    useEffect(() => {
        const stored = localStorage.getItem('achrilik_lang') as Lang | null;
        if (stored === 'ar' || stored === 'fr') {
            setLangState(stored);
        }

        const handleLangChange = (e: Event) => {
            const newLang = (e as CustomEvent<Lang>).detail;
            if (newLang === 'ar' || newLang === 'fr') {
                setLangState(newLang);
            }
        };

        window.addEventListener('achrilik_lang_change', handleLangChange);
        return () => window.removeEventListener('achrilik_lang_change', handleLangChange);
    }, []);

    const setLang = (newLang: Lang) => {
        setLangState(newLang);
        localStorage.setItem('achrilik_lang', newLang);
        window.dispatchEvent(new CustomEvent('achrilik_lang_change', { detail: newLang }));
        // Update document direction
        document.documentElement.setAttribute('lang', newLang);
        document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
    };

    // Sync HTML attributes on language change
    useEffect(() => {
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, isRTL: lang === 'ar', setLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
