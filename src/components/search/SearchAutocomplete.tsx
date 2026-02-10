'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';

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

    // Show recent searches if query is empty, otherwise show suggestions
    const showRecent = query.length < 2 && recentSearches.length > 0;
    const showSuggestions = query.length >= 2 && suggestions.length > 0;
    const displayItems = showRecent ? recentSearches : suggestions;

    // Handle keyboard navigation
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
                    if (selectedIndex >= 0) {
                        handleSelect(selectedIndex);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, displayItems, showSuggestions, showRecent]);

    // Close dropdown when clicking outside
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
        } else if (showSuggestions) {
            const suggestion = suggestions[index];
            addToRecent(suggestion.title);
            router.push(`/product/${suggestion.slug}`);
        }
        onClose();
    };

    const handleRecentClick = (searchQuery: string) => {
        onSelect(searchQuery);
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        onClose();
    };

    // Don't show dropdown if nothing to display
    if (!showRecent && !showSuggestions && !isLoading) {
        return null;
    }

    return (
        <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in"
        >
            {/* Loading state */}
            {isLoading && query.length >= 2 && (
                <div className="p-6 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#006233] mx-auto mb-2" />
                    <p className="text-sm">Recherche en cours...</p>
                </div>
            )}

            {/* Recent searches */}
            {showRecent && (
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <span>🕐</span> Recherches récentes
                        </h3>
                        <button
                            onClick={clearRecent}
                            className="text-xs text-red-600 hover:text-red-700 font-semibold"
                        >
                            Effacer
                        </button>
                    </div>
                    <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                            <button
                                key={index}
                                onClick={() => handleRecentClick(search)}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${selectedIndex === index
                                        ? 'bg-green-50 text-[#006233]'
                                        : 'hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-gray-400">🔍</span>
                                <span className="flex-1 text-sm font-medium">{search}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Product suggestions */}
            {showSuggestions && (
                <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span>✨</span> Suggestions
                    </h3>
                    <div className="space-y-1">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={suggestion.id}
                                onClick={() => handleSelect(index)}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-4 ${selectedIndex === index
                                        ? 'bg-green-50 border-2 border-[#006233] scale-[1.02]'
                                        : 'hover:bg-gray-50 border-2 border-transparent'
                                    }`}
                            >
                                {/* Product image */}
                                {suggestion.image && (
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image
                                            src={suggestion.image}
                                            alt={suggestion.title}
                                            width={48}
                                            height={48}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                )}

                                {/* Product info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 truncate">
                                        {highlightMatch(suggestion.title, query)}
                                    </p>
                                    {suggestion.category && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {suggestion.category}
                                        </p>
                                    )}
                                </div>

                                {/* Price */}
                                {suggestion.price && (
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-[#006233]">
                                            {suggestion.price.toLocaleString()} DA
                                        </p>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* No results */}
            {!isLoading && query.length >= 2 && suggestions.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="font-semibold mb-1">Aucun résultat</p>
                    <p className="text-sm">Essayez avec d'autres mots-clés</p>
                </div>
            )}
        </div>
    );
}

// Helper: Highlight matching text
function highlightMatch(text: string, query: string) {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-200 font-bold">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
}
