'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ className = '' }: { className?: string }) {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setQuery(''); // Clear after search
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`flex items-center gap-2 w-full ${className}`}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tapez votre boutique ou votre produit"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006233] text-sm"
            />
            <button
                type="submit"
                className="btn btn-primary px-6 py-2 whitespace-nowrap font-bold"
            >
                GO
            </button>
        </form>
    );
}
