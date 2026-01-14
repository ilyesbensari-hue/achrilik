"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic imports for Leaflet components to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Circle = dynamic(
    () => import('react-leaflet').then((mod) => mod.Circle),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

interface Store {
    id: string;
    name: string;
    city?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    clickCollect?: boolean;
    _count?: {
        products: number;
    };
}

interface StoreMapProps {
    showExact?: boolean;
    selectedStoreId?: string;
    onStoreSelect?: (storeId: string) => void;
    stores?: Store[];
}

export default function StoreMap({ showExact = false, selectedStoreId, onStoreSelect, stores: initialStores }: StoreMapProps) {
    const [stores, setStores] = useState<Store[]>(initialStores || []);
    const [loading, setLoading] = useState(!initialStores);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Fix for Leaflet default icon issues in Next.js
        (async function initLeaflet() {
            const L = (await import('leaflet')).default;
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: '/marker-icon-2x.png',
                iconUrl: '/marker-icon.png',
                shadowUrl: '/marker-shadow.png',
            });
        })();

        if (initialStores) {
            setLoading(false);
            return;
        }

        async function fetchStores() {
            try {
                const response = await fetch('/api/stores/locations');
                if (response.ok) {
                    const data = await response.json();
                    // Filter out online-only stores for the public map
                    // (Unless they are passed via props, which this internal fetch doesn't handle)
                    const physicalStores = data.filter((s: Store) => s.clickCollect !== false);
                    setStores(physicalStores);
                }
            } catch (error) {
                console.error('Failed to fetch stores', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStores();
    }, [initialStores]);

    if (!isMounted) return <div className="w-full h-[500px] bg-gray-100 rounded-xl animate-pulse" />;

    const validStores = stores.filter(s => s.latitude && s.longitude);
    const center: [number, number] = [35.6976, -0.6338]; // Oran

    return (
        <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0 relative">
            {loading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006233]"></div>
                </div>
            ) : (
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {validStores.map((store) => (
                        showExact ? (
                            <Marker
                                key={store.id}
                                position={[store.latitude!, store.longitude!]}
                            >
                                <Popup>
                                    <div className="p-2 min-w-[200px]">
                                        <h3 className="font-bold text-lg mb-2 text-[#006233]">{store.name}</h3>
                                        <p className="text-sm text-gray-700 mb-1">📍 {store.address}</p>
                                        <p className="text-sm text-gray-600 mb-2">{store.city}</p>
                                        {onStoreSelect && (
                                            <button
                                                onClick={() => onStoreSelect(store.id)}
                                                className="bg-[#006233] text-white px-3 py-2 rounded-lg text-xs font-bold w-full"
                                            >
                                                CHOISIR CE MAGASIN
                                            </button>
                                        )}
                                        {!onStoreSelect && (
                                            <div className="mt-3 flex gap-2 justify-center">
                                                <Link
                                                    href={`/stores/${store.id}`}
                                                    className="bg-[#006233] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#004d28] transition-colors"
                                                >
                                                    VISITER
                                                </Link>
                                                <a
                                                    href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-1"
                                                >
                                                    <span>🚗</span> ITINÉRAIRE
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ) : (
                            <Circle
                                key={store.id}
                                center={[store.latitude!, store.longitude!]}
                                radius={800} // 800m approximate radius
                                pathOptions={{ color: '#006233', fillColor: '#006233', fillOpacity: 0.2 }}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <h3 className="font-bold text-lg text-[#006233]">{store.name}</h3>
                                        <p className="text-sm text-gray-600">Zone de livraison: {store.city || 'Oran'}</p>
                                        <div className="mt-2 text-xs text-gray-500 italic">
                                            📍 Localisation approximative
                                        </div>
                                        <Link
                                            href={`/stores/${store.id}`}
                                            className="block mt-2 text-center bg-gray-100 text-[#006233] px-2 py-1 rounded text-xs font-bold"
                                        >
                                            VISITER LA BOUTIQUE
                                        </Link>
                                    </div>
                                </Popup>
                            </Circle>
                        )
                    ))}
                </MapContainer>
            )}
        </div>
    );
}
