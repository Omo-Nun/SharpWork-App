'use client';

interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
  label?: string;
}

export function GoogleMap({ lat, lng, zoom = 14, className = 'h-64 w-full rounded-xl', label }: GoogleMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className={`${className} bg-gray-100 flex flex-col items-center justify-center text-gray-500 p-6 text-center`}>
        <p className="font-medium">Map preview</p>
        <p className="text-sm mt-1">{label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}</p>
        <p className="text-xs mt-2">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for live Google Maps.</p>
      </div>
    );
  }

  const src = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=${zoom}`;

  return (
    <iframe
      title={label || 'Map'}
      className={`${className} border-0`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={src}
    />
  );
}
