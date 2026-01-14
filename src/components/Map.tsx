"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icons
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ stores, onSelect }: { stores: any[], onSelect: (store: any) => void }) {
    const getGoogleMapsLink = (store: any): string | undefined => {
        if (store.latitude && store.longitude) {
            return `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
        }
        return undefined;
    };

    return (
        <>
            {stores.map(store => (
                store.latitude && store.longitude && (
                    <Marker
                        key={store.id}
                        position={[store.latitude, store.longitude]}
                        eventHandlers={{
                            click: () => onSelect(store),
                        }}
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong className="block mb-1">{store.name}</strong>
                                {store.city && <div className="text-gray-600 mb-2">{store.city}</div>}
                                {store.address && <div className="text-gray-600 text-xs mb-2">{store.address}</div>}
                                {getGoogleMapsLink(store) && (
                                    <a
                                        href={getGoogleMapsLink(store)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-xs font-medium"
                                    >
                                        📍 Ouvrir dans Google Maps →
                                    </a>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}
        </>
    );
}

export default function MapPicker({ stores, onSelectStore }: { stores: any[], onSelectStore: (store: any) => void }) {
    // Default center: Algiers
    const [position, setPosition] = useState<[number, number]>([36.75, 3.05]);

    useEffect(() => {
        // Basic geolocation to center map
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
            });
        }
    }, []);

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-inner border border-gray-200">
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker stores={stores} onSelect={onSelectStore} />
            </MapContainer>
        </div>
    );
}
