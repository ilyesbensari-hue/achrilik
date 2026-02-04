"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useMap } from 'react-leaflet';
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
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

interface LeafletAddressPickerProps {
    onLocationSelect: (location: {
        address: string;
        wilaya: string;
        coordinates: { lat: number; lng: number };
    }) => void;
    initialLat?: number;
    initialLng?: number;
}

export default function LeafletAddressPicker({ onLocationSelect, initialLat, initialLng }: LeafletAddressPickerProps) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
    );
    const [isMounted, setIsMounted] = useState(false);
    const [draggable, setDraggable] = useState(true);
    const markerRef = useRef<any>(null);

    // Default center (Oran) or initial position
    const [center, setCenter] = useState<{ lat: number; lng: number }>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : { lat: 35.6976, lng: -0.6338 }
    );

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
    }, []);

    // Event handler for marker drag
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker) {
                    const newPos = marker.getLatLng();
                    setPosition(newPos);
                    // Simple reverse geocoding placeholder (Using lat/lng as address for now/optimization)
                    // In a real scenario, we might call Nominatim API here, but to correspond to 'potinage',
                    // the coordinates are the most important part.
                    onLocationSelect({
                        address: `Position: ${newPos.lat.toFixed(5)}, ${newPos.lng.toFixed(5)}`,
                        wilaya: '', // User will still enter Wilaya manually
                        coordinates: { lat: newPos.lat, lng: newPos.lng }
                    });
                }
            },
        }),
        [onLocationSelect],
    );

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const newPos = { lat: latitude, lng: longitude };
                    setCenter(newPos);
                    setPosition(newPos);
                    onLocationSelect({
                        address: `Position GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
                        wilaya: '',
                        coordinates: newPos
                    });
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    alert("Impossible de récupérer votre position. Veuillez vous déplacer manuellement sur la carte.");
                }
            );
        } else {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
        }
    };

    // Component to update map view when center changes
    const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
        const map = useMap(); // This needs to be inside MapContainer
        useEffect(() => {
            map.setView([lat, lng]);
        }, [lat, lng, map]);
        return null;
    };

    // Helper component to access map instance (since we can't use useMap outside MapContainer)
    // We'll define it inline inside the MapContainer for simplicity in this file structure if allowed,
    // OR just rely on key prop to force re-render if center changes drastically, 
    // BUT 'useMap' hook from react-leaflet is the standard way.
    // Since dynamic import makes 'useMap' tricky to import at top level, we might skip RecenterMap 
    // and just rely on the user dragging the map or initial center.
    // Note: To properly use useMap, we need to import it properly. 
    // Let's try to grab it via dynamic if possible or just stick to basic centering.
    // For now, let's keep it simple: The MapContainer 'center' prop is static after mount unless we use other tricks.
    // We will use a key on MapContainer to force re-render when 'center' changes by geolocation.

    if (!isMounted) return <div className="w-full h-[400px] bg-gray-100 rounded-xl animate-pulse text-center p-10 text-gray-400">Chargement de la carte...</div>;

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleLocateMe}
                    className="flex items-center gap-2 bg-[#006233] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#004d28] transition-colors"
                >
                    📍 Ma position actuelle
                </button>
            </div>

            <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0 relative">
                <MapContainer
                    key={`${center.lat}-${center.lng}`} // Force re-render on center change (poor man's Recenter)
                    center={[center.lat, center.lng]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                        draggable={draggable}
                        eventHandlers={eventHandlers}
                        position={position || center}
                        ref={markerRef}
                    >
                        <Popup minWidth={90}>
                            <span className="font-medium text-[#006233]">
                                {position ? "Position sélectionnée" : "Déplacez-moi !"}
                            </span>
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>

            <p className="text-xs text-gray-500 italic text-center">
                Déplacez le marqueur bleu pour indiquer votre position exacte de livraison.
            </p>
        </div>
    );
}
