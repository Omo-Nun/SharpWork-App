'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { sendLocationUpdate } from '../lib/socket';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

import 'leaflet/dist/leaflet.css';

interface MapSimulatorProps {
  bookingId?: string;
  isActive: boolean; // True when booking state is EN_ROUTE
}

// Generate a random route near Lagos
function generateRandomRoute(startLat: number, startLng: number, steps: number) {
  const route: [number, number][] = [[startLat, startLng]];
  let currentLat = startLat;
  let currentLng = startLng;
  for (let i = 0; i < steps; i++) {
    currentLat += (Math.random() - 0.5) * 0.005;
    currentLng += (Math.random() - 0.5) * 0.005;
    route.push([currentLat, currentLng]);
  }
  return route;
}

export function MapSimulator({ bookingId, isActive }: MapSimulatorProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<[number, number]>([6.5244, 3.3792]);
  const [simulate, setSimulate] = useState(false);
  const [speedMs, setSpeedMs] = useState(1000);
  const routeIndex = useRef(0);
  const routeRef = useRef<[number, number][]>([]);

  useEffect(() => {
    (async function init() {
      const L = (await import('leaflet')).default;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      routeRef.current = generateRandomRoute(6.5244, 3.3792, 100);
      setMounted(true);
    })();
  }, []);

  // Sync the UI toggle with the `isActive` prop derived from booking state
  useEffect(() => {
    if (isActive && !simulate) {
      setSimulate(true);
    } else if (!isActive && simulate) {
      setSimulate(false);
    }
  }, [isActive]); 

  useEffect(() => {
    if (!simulate) return;

    const interval = setInterval(() => {
      routeIndex.current = (routeIndex.current + 1) % routeRef.current.length;
      const nextPos = routeRef.current[routeIndex.current];
      setPosition(nextPos);
      
      if (bookingId) {
        sendLocationUpdate(bookingId, nextPos[0], nextPos[1]);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [simulate, speedMs, bookingId]);

  if (!mounted) {
    return <div className="bg-gray-100 flex items-center justify-center text-gray-500 rounded-xl h-64 w-full">Loading map...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <label className="flex items-center gap-2 font-bold text-sm text-brand-navy cursor-pointer">
          <input 
            type="checkbox" 
            checked={simulate} 
            onChange={(e) => setSimulate(e.target.checked)} 
            className="w-4 h-4 rounded text-brand-green focus:ring-brand-green"
          />
          Simulate GPS Movement
        </label>
        
        {simulate && (
          <div className="flex items-center gap-2 text-sm ml-auto text-gray-500 font-medium">
            <span>Speed:</span>
            <input 
              type="range" 
              min="100" 
              max="3000" 
              step="100"
              value={3100 - speedMs} 
              onChange={(e) => setSpeedMs(3100 - Number(e.target.value))} 
              className="w-24 accent-brand-green"
            />
          </div>
        )}
      </div>

      <div className="h-64 w-full rounded-xl" style={{ position: 'relative', overflow: 'hidden', zIndex: 0 }}>
        <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>Artisan Location (Simulated)</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
