'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'achrilik_recently_viewed';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
    const [ids, setIds] = useState<string[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setIds(JSON.parse(stored));
        } catch {}
    }, []);

    const addProduct = (productId: string) => {
        setIds(prev => {
            const filtered = prev.filter(id => id !== productId);
            const next = [productId, ...filtered].slice(0, MAX_ITEMS);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
            return next;
        });
    };

    const clearHistory = () => {
        setIds([]);
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
    };

    return { ids, addProduct, clearHistory };
}
