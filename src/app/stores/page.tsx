"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import Map component dynamically to avoid SSR issues
const MapPicker = dynamic(() => import('@/components/Map'), { ssr: false });

interface Store {
    id: string;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
    clickCollect?: boolean;
    Product?: any[];
}

export default function StoresPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [filteredStores, setFilteredStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);

    // Filters
    const [cityFilter, setCityFilter] = useState('');
    const [clickCollectFilter, setClickCollectFilter] = useState(false);
    const [cities, setCities] = useState<string[]>([]);

    useEffect(() => {
        fetchStores();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [stores, cityFilter, clickCollectFilter]);

    const fetchStores = async () => {
        try {
            const res = await fetch('/api/stores');
            const data = await res.json();
            setStores(data);

            // Extract unique cities
            const uniqueCities = Array.from(new Set(data.map((s: Store) => s.city).filter(Boolean)));
            setCities(uniqueCities as string[]);

            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = stores;

        if (cityFilter) {
            filtered = filtered.filter(s => s.city === cityFilter);
        }

        if (clickCollectFilter) {
            filtered = filtered.filter(s => s.clickCollect);
        }

        setFilteredStores(filtered);
    };

    const getGoogleMapsLink = (store: Store) => {
        if (store.latitude && store.longitude) {
            return `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
        } else if (store.address && store.city) {
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address + ', ' + store.city)}`;
        }
        return null;
    };

    if (loading) {
        return <div className="container py-10 text-center">Chargement...</div>;
    }

    return (
        <div className="container py-10">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Trouvez un magasin</h1>
                <p className="text-gray-600">Découvrez nos boutiques partenaires pour le Click & Collect</p>
            </div>

            {/* Filters */}
            <div className="card p-6 mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium mb-1">Ville</label>
                        <select
                            className="input w-full"
                            value={cityFilter}
                            onChange={e => setCityFilter(e.target.value)}
                        >
                            <option value="">Toutes les villes</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                        <input
                            type="checkbox"
                            id="clickCollect"
                            checked={clickCollectFilter}
                            onChange={e => setClickCollectFilter(e.target.checked)}
                            className="w-5 h-5 text-[#006233] border-gray-300 rounded focus:ring-[#006233]"
                        />
                        <label htmlFor="clickCollect" className="text-sm font-medium">
                            Click & Collect uniquement
                        </label>
                    </div>

                    <div className="flex-1 min-w-[200px] pt-6 text-right">
                        <span className="text-sm text-gray-600">
                            {filteredStores.length} magasin{filteredStores.length > 1 ? 's' : ''} trouvé{filteredStores.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="mb-6">
                <MapPicker
                    stores={filteredStores.filter(s => s.latitude && s.longitude)}
                    onSelectStore={setSelectedStore}
                />
            </div>

            {/* Store Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStores.map(store => {
                    const mapsLink = getGoogleMapsLink(store);

                    return (
                        <div
                            key={store.id}
                            className={`card p-6 hover:shadow-xl transition-shadow cursor-pointer ${selectedStore?.id === store.id ? 'ring-2 ring-[#006233]' : ''}`}
                            onClick={() => setSelectedStore(store)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold">{store.name}</h3>
                                {store.clickCollect && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                        Click & Collect
                                    </span>
                                )}
                            </div>

                            {store.description && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{store.description}</p>
                            )}

                            <div className="space-y-2 mb-4">
                                {store.city && (
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {store.address && `${store.address}, `}{store.city}
                                    </div>
                                )}

                                {store.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {store.phone}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    {store.Product?.length || 0} produit{store.Product?.length > 1 ? 's' : ''}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <a
                                    href={`/stores/${store.id}`}
                                    className="btn btn-primary flex-1 text-center"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Voir la boutique
                                </a>
                                {mapsLink && (
                                    <a
                                        href={mapsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline px-3"
                                        onClick={(e) => e.stopPropagation()}
                                        title="Voir sur Google Maps"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredStores.length === 0 && (
                <div className="card p-10 text-center text-gray-500">
                    <p className="mb-2">Aucun magasin trouvé</p>
                    <button
                        onClick={() => {
                            setCityFilter('');
                            setClickCollectFilter(false);
                        }}
                        className="btn btn-outline"
                    >
                        Réinitialiser les filtres
                    </button>
                </div>
            )}
        </div>
    );
}
