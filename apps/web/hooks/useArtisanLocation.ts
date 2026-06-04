'use client';

import { useEffect, useState } from 'react';
import { sendLocationUpdate } from '../lib/socket';

export function useArtisanLocationPublisher(bookingId?: string, enabled = false) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled || !bookingId || !navigator.geolocation) {
      setActive(false);
      return;
    }

    setActive(true);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        sendLocationUpdate(bookingId, pos.coords.latitude, pos.coords.longitude);
      },
      () => setActive(false),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setActive(false);
    };
  }, [bookingId, enabled]);

  return active;
}
