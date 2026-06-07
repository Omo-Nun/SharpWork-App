'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

import 'leaflet/dist/leaflet.css';

interface OpenStreetMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
  label?: string;
}

export function OpenStreetMap({ lat, lng, zoom = 14, className = 'h-64 w-full rounded-xl', label }: OpenStreetMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    (async function init() {
      const L = (await import('leaflet')).default;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setMounted(true);
    })();
  }, []);

  if (!mounted) {
    return <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-500`}>Loading map...</div>;
  }

  return (
    <div className={className} style={{ position: 'relative', overflow: 'hidden', zIndex: 0 }}>
      <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          {label && <Popup>{label}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  );
}
