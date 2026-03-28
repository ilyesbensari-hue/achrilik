'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { formatPrice } from '@/lib/formatPrice';

interface SearchAutocompleteProps {
    query: string;
    onSelect: (query: string) => void;
    onClose: () => void;
}

export default function SearchAutocomplete({ query, onSelect, onClose }: SearchAutocompleteProps) {
    const router = useRouter();
    const { suggestions, isLoading, recentSearches, addToRecent, clearRecent } = useSearchSuggestions(query);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const showRecent = query.length < 2 && recentSearches.length > 0;
    const showSuggestions = query.length >= 2;
    const displayItems = showRecent ? recentSearches : suggestions;

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!showSuggestions && !showRecent) return;
            const maxIndex = displayItems.length - 1;
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : 0));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0) handleSelect(selectedIndex);
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedIndex, displayItems, showSuggestions, showRecent]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleSelect = (index: number) => {
        if (showRecent) {
            const searchQuery = recentSearches[index];
            onSelect(searchQuery);
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        } else if (suggestions[index]) {
            const suggestion = suggestions[index];
            addToRecent(suggestion.title);
            router.push(`/products/${suggestion.slug || suggestion.id}`);
        }
        onClose();
    };

    const handleSeeAll = () => {
        if (query.trim()) {
            addToRecent(query);
            router.push(`/search?q=${encodeURIComponent(query)}`);
            onClose();
        }
    };

    // Nothing to show
    if (!showRecent && !showSuggestions) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in"
        >
            {/* ── Loading ── */}
            {isLoading && query.length >= 2 && (
                <div className="p-5 flex items-center gap-3 text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#006233]" />
                    <span className="text-sm">Recherche de &quot;{query}&quot;...</span>
                </div>
            )}

            {/* ── Recent searches ── */}
            {showRecent && (
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                            🕐 Recherches récentes
                        </h3>
                        <button onClick={clearRecent} className="text-xs text-red-500 hover:text-red-600 font-semibold">
                            Effacer
                        </button>
                    </div>
                    <div className="space-y-0.5">
                        {recentSearches.map((search, index) => (
                            <button
                                key={index}
                                onClick={() => { onSelect(search); router.push(`/search?q=${encodeURIComponent(search)}`); onClose(); }}
                                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center gap-3 ${selectedIndex === index ? 'bg-green-50 text-[#006233]' : 'hover:bg-gray-50'}`}
                            >
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="flex-1 text-sm font-medium">{search}</span>
                                <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M7 7h10v10" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Product suggestions ── */}
            {showSuggestions && !isLoading && suggestions.length > 0 && (
                <div className="p-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide px-2 mb-2">
                        Produits ({suggestions.length})
                    </h3>
                    <div className="space-y-0.5">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={suggestion.id}
                                onClick={() => handleSelect(index)}
                                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 group ${
                                    selectedIndex === index
                                        ? 'bg-green-50 ring-1 ring-[#006233]/30'
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                {/* Thumbnail */}
                                <div className="w-11 h-11 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {suggestion.image ? (
                                        <Image
                                            src={suggestion.image}
                                            alt={suggestion.title}
                                            width={44}
                                            height={44}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300 text-lg">📦</div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-gray-900 truncate leading-tight">
                                        {highlightMatch(suggestion.title, query)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {suggestion.category && (
                                            <span className="text-xs text-gray-400">{suggestion.category}</span>
                                        )}
                                        {(suggestion as any).storeName && (
                                            <>
                                                <span className="text-gray-200">·</span>
                                                <span className="text-xs text-gray-400 truncate">{(suggestion as any).storeName}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-sm text-[#006233]">
                                        {formatPrice(suggestion.price)}
                                    </p>
                                    {(suggestion as any).originalPrice && (
                                        <p className="text-xs text-gray-400 line-through">
                                            {formatPrice((suggestion as any).originalPrice)}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── No results ── */}
            {!isLoading && query.length >= 2 && suggestions.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                    <div className="text-3xl mb-2">🔍</div>
                    <p className="font-semibold text-sm">Aucun résultat pour &quot;{query}&quot;</p>
                    <p className="text-xs text-gray-400 mt-1">Essayez avec d&apos;autres mots-clés</p>
                </div>
            )}

            {/* ── See all results footer ── */}
            {query.length >= 2 && !isLoading && (
                <button
                    onClick={handleSeeAll}
                    className="w-full flex items-center justify-center gap-2 py-3 border-t border-gray-100 text-sm font-semibold text-[#006233] hover:bg-green-50 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Voir tous les résultats pour &quot;{query}&quot;
                </button>
            )}
        </div>
    );
}

// Bold-highlight the matched part
function highlightMatch(text: string, query: string) {
    if (!query || query.length < 2) return <>{text}</>;
    try {
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return (
            <>
                {parts.map((part, i) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <mark key={i} className="bg-yellow-100 text-yellow-800 font-bold rounded px-0.5">
                            {part}
                        </mark>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </>
        );
    } catch {
        return <>{text}</>;
    }
}
