'use client';

import { useState } from 'react';
//import { useLoadScript, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'] as const;

interface LocationData {
    address: string;
    latitude: number;
    longitude: number;
    city?: string;
    postalCode?: string;
}

interface AddressInputProps {
    value: string;
    onChange: (address: string) => void;
    onLocationSelect?: (location: LocationData) => void;
    required?: boolean;
    className?: string;
}

export default function AddressInput({
    value,
    onChange,
    onLocationSelect,
    required = false,
    className = '',
}: AddressInputProps) {
    const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

    // NOTE: Google Maps API integration requires:
    // 1. npm install @react-google-maps/api
    // 2. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
    // 3. Uncomment the imports and useLoadScript hook

    /*
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries,
    });

    if (loadError) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">Erreur de chargement de Google Maps</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
        );
    }
    */

    // Temporary fallback without Google Maps
    return (
        <div className={className}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Entrez votre adresse complète..."
                required={required}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006233] focus:border-transparent transition-all"
            />

            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                    ⚠️ <strong>Google Maps GPS à configurer:</strong>
                </p>
                <ul className="mt-1 text-xs text-yellow-700 list-disc list-inside space-y-1">
                    <li>Installer: <code className="bg-yellow-100 px-1 rounded">npm install @react-google-maps/api</code></li>
                    <li>Configurer NEXT_PUBLIC_GOOGLE_MAPS_API_KEY dans .env.local</li>
                    <li>Décommenter le code dans AddressInput.tsx</li>
                </ul>
            </div>

            {/* This section will be enabled once Google Maps is configured */}
            {/*
            {selectedLocation && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                        Cliquez et glissez le marqueur pour ajuster:
                    </p>
                    <GoogleMap
                        zoom={15}
                        center={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
                        mapContainerClassName="w-full h-64 rounded-lg border border-gray-300"
                    >
                        <Marker
                            position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
                            draggable
                            onDragEnd={(e) => {
                                if (e.latLng) {
                                    const newLocation: LocationData = {
                                        ...selectedLocation,
                                        latitude: e.latLng.lat(),
                                        longitude: e.latLng.lng(),
                                    };
                                    setSelectedLocation(newLocation);
                                    onLocationSelect?.(newLocation);
                                }
                            }}
                        />
                    </GoogleMap>
                    
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                        <p><strong>Coordonnées GPS:</strong></p>
                        <p>Latitude: {selectedLocation.latitude.toFixed(6)}</p>
                        <p>Longitude: {selectedLocation.longitude.toFixed(6)}</p>
                    </div>
                </div>
            )}
            */}
        </div>
    );
}
