'use client';

import { useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

interface MapAddressPickerProps {
    onLocationSelect: (lat: number, lng: number, address: string) => void;
    initialLat?: number;
    initialLng?: number;
}

const ORAN_CENTER = { lat: 35.6976, lng: -0.6337 };

export default function MapAddressPicker({
    onLocationSelect,
    initialLat,
    initialLng,
    onLoadError
}: MapAddressPickerProps & { onLoadError?: () => void }) {
    const [markerPosition, setMarkerPosition] = useState({
        lat: initialLat || ORAN_CENTER.lat,
        lng: initialLng || ORAN_CENTER.lng
    });
    const [mapCenter, setMapCenter] = useState(markerPosition);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [internalLoadError, setInternalLoadError] = useState(false);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries: ['places']
    });

    if (loadError && !internalLoadError) {
        setInternalLoadError(true);
        if (onLoadError) onLoadError();
    }

    const reverseGeocode = useCallback((position: { lat: number; lng: number }) => {
        if (typeof google === 'undefined') return;

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: position }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
                onLocationSelect(position.lat, position.lng, results[0].formatted_address);
            } else {
                // Fallback: just send coordinates
                onLocationSelect(position.lat, position.lng, `${position.lat}, ${position.lng}`);
            }
        });
    }, [onLocationSelect]);

    const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;

        const newPos = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };

        setMarkerPosition(newPos);
        reverseGeocode(newPos);
    }, [reverseGeocode]);

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Géolocalisation non supportée par votre navigateur');
            return;
        }

        setIsGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setMarkerPosition(pos);
                setMapCenter(pos);
                reverseGeocode(pos);
                setIsGettingLocation(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Impossible d\'obtenir votre position. Veuillez pointer votre adresse manuellement.');
                setIsGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    if (loadError || internalLoadError) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
                <p className="font-bold mb-1">⚠️ Carte indisponible</p>
                <p>La carte ne peut pas être chargée (Erreur de configuration). <br />
                    <strong>Pas de panique !</strong> Vous pouvez quand même passer commande en remplissant votre adresse manuellement ci-dessus.</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[#006233] mb-2"></div>
                    <p className="text-sm text-gray-600">Chargement de la carte...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Map Container */}
            <div className="h-[300px] rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                <GoogleMap
                    center={mapCenter}
                    zoom={15}
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        zoomControl: true,
                        styles: [
                            {
                                featureType: 'poi',
                                elementType: 'labels',
                                stylers: [{ visibility: 'off' }]
                            }
                        ]
                    }}
                >
                    <Marker
                        position={markerPosition}
                        draggable
                        onDragEnd={handleMarkerDragEnd}
                        animation={google.maps.Animation.DROP}
                    />
                </GoogleMap>
            </div>

            {/* Current Location Button */}
            <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isGettingLocation}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border-2 border-[#006233] text-[#006233] font-bold rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGettingLocation ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#006233] border-t-transparent"></div>
                        Localisation en cours...
                    </>
                ) : (
                    <>
                        📍 Utiliser ma position actuelle
                    </>
                )}
            </button>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 leading-relaxed">
                    💡 <strong>Comment ça marche?</strong><br />
                    1. Cliquez sur "Utiliser ma position actuelle" OU<br />
                    2. Déplacez le marqueur rouge sur votre adresse exacte<br />
                    3. Assurez-vous que le marqueur pointe vers votre porte d'entrée
                </p>
            </div>
        </div>
    );
}
