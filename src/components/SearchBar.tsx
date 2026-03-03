'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchAutocomplete from './search/SearchAutocomplete';
import { useTranslation } from '@/hooks/useTranslation';

export default function SearchBar({ className = '' }: { className?: string }) {
    const [query, setQuery] = useState('');
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const router = useRouter();
    const { tr } = useTranslation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setShowAutocomplete(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setShowAutocomplete(true);
    };

    const handleSelect = (selectedQuery: string) => {
        setQuery(selectedQuery);
        setShowAutocomplete(false);
    };

    return (
        <div className={`relative w-full ${className}`}>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setShowAutocomplete(true)}
                    placeholder={tr('nav_search_placeholder')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006233] text-sm"
                />
                <button
                    type="submit"
                    className="btn btn-primary px-6 py-2 whitespace-nowrap font-bold"
                >
                    {tr('btn_submit') === 'Envoyer' ? 'GO' : '🔍'}
                </button>
            </form>

            {showAutocomplete && (
                <SearchAutocomplete
                    query={query}
                    onSelect={handleSelect}
                    onClose={() => setShowAutocomplete(false)}
                />
            )}
        </div>
    );
}
