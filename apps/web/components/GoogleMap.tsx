'use client';

import { useEffect, useRef } from 'react';

interface GoogleMapProps {
  lat: number;
  lng: number;
  label?: string;
  className?: string;
  markers?: Array<{ lat: number; lng: number; label?: string }>;
}

declare global {
  interface Window {
    google: any;
    __gmapCallback?: () => void;
  }
}

let gmapLoaded = false;
const callbackQueue: Array<() => void> = [];

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (gmapLoaded && window.google?.maps) {
      resolve();
      return;
    }

    callbackQueue.push(resolve);

    if (document.querySelector('script[data-gmap-loader]')) return;

    window.__gmapCallback = () => {
      gmapLoaded = true;
      callbackQueue.forEach((cb) => cb());
      callbackQueue.length = 0;
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__gmapCallback&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-gmap-loader', 'true');
    document.head.appendChild(script);
  });
}

export function GoogleMap({ lat, lng, label, className, markers = [] }: GoogleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  useEffect(() => {
    if (!containerRef.current) return;
    if (!apiKey) return; // No key: container stays empty, parent shows fallback

    loadGoogleMaps(apiKey).then(() => {
      if (!containerRef.current || mapRef.current) return;

      const map = new window.google.maps.Map(containerRef.current, {
        center: { lat, lng },
        zoom: 14,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e5f0' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        ],
      });
      mapRef.current = map;

      // Primary marker
      new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: label || 'Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#007A52',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
      });

      // Additional markers
      markers.forEach((m) => {
        new window.google.maps.Marker({
          position: { lat: m.lat, lng: m.lng },
          map,
          title: m.label || '',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#0D2B5E',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });
      });
    });
  }, [lat, lng, apiKey, label, markers]);

  // Update map center when coords change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter({ lat, lng });
    }
  }, [lat, lng]);

  if (!apiKey) {
    // Graceful fallback: styled placeholder
    return (
      <div
        className={className}
        style={{
          background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 'inherit',
        }}
      >
        <span style={{ fontSize: 32 }}>📍</span>
        <span style={{ fontSize: 13, color: '#0369a1', fontWeight: 600 }}>
          {label || 'Map'}
        </span>
        <span style={{ fontSize: 11, color: '#0369a1', opacity: 0.7 }}>
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>
    );
  }

  return <div ref={containerRef} className={className} style={{ borderRadius: 'inherit' }} />;
}
