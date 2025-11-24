import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMarker = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

export const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect }) => {
    // Mumbai Coordinates
    const center = { lat: 19.0760, lng: 72.8777 };

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border-2 border-gray-200 mt-2">
            <MapContainer center={center} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onSelect={onLocationSelect} />
            </MapContainer>
            <div className="bg-gray-50 p-2 text-xs text-center text-gray-500">
                Click on the map to pin your exact delivery location in Mumbai
            </div>
        </div>
    );
};
