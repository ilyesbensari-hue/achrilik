import { useState, useEffect, useRef } from 'react';

interface SearchSuggestion {
    id: string;
    type: 'product' | 'recent' | 'popular';
    title: string;
    slug?: string; // Product URL slug
    image?: string;
    price?: number;
    category?: string;
}

interface UseSearchSuggestionsResult {
    suggestions: SearchSuggestion[];
    isLoading: boolean;
    recentSearches: string[];
    addToRecent: (query: string) => void;
    clearRecent: () => void;
}

const RECENT_SEARCHES_KEY = 'achrilik_recent_searches';
const MAX_RECENT = 5;

export function useSearchSuggestions(
    query: string,
    delay: number = 300
): UseSearchSuggestionsResult {
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Load recent searches from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (stored) {
                try {
                    setRecentSearches(JSON.parse(stored));
                } catch (e) {
                    console.error('Failed to parse recent searches', e);
                }
            }
        }
    }, []);

    // Debounced fetch suggestions
    useEffect(() => {
        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Don't search for empty or very short queries
        if (!query || query.length < 2) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const timer = setTimeout(async () => {
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            try {
                const response = await fetch(
                    `/api/search/suggestions?q=${encodeURIComponent(query)}`,
                    { signal: abortController.signal }
                );

                if (!response.ok) throw new Error('Failed to fetch suggestions');

                const data = await response.json();
                setSuggestions(data.suggestions || []);
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching suggestions:', error);
                    setSuggestions([]);
                }
            } finally {
                setIsLoading(false);
            }
        }, delay);

        return () => {
            clearTimeout(timer);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [query, delay]);

    // Add to recent searches
    const addToRecent = (search: string) => {
        if (!search.trim()) return;

        const updated = [
            search,
            ...recentSearches.filter(s => s !== search)
        ].slice(0, MAX_RECENT);

        setRecentSearches(updated);

        if (typeof window !== 'undefined') {
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        }
    };

    // Clear recent searches
    const clearRecent = () => {
        setRecentSearches([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(RECENT_SEARCHES_KEY);
        }
    };

    return {
        suggestions,
        isLoading,
        recentSearches,
        addToRecent,
        clearRecent,
    };
}
