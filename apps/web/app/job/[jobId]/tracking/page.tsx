'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JobTrackingPage({ params }: { params: { jobId: string } }) {
  const [locationStatus, setLocationStatus] = useState('Fetching live location...');

  // Mocking real-time updates since backend/Socket.io is not ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocationStatus('Artisan is 5 minutes away');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/customer" className="text-[#0D2B5E] hover:underline font-medium">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Job Tracking: #{params.jobId}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#007A52]"></span>
          </span>
          <span className="text-sm font-medium text-gray-700">Live</span>
        </div>
      </div>

      {/* Map Area (Placeholder for Google Maps JS API) */}
      <div className="flex-1 relative bg-gray-200">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Map Placeholder Graphic */}
          <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-lg font-medium text-gray-600">Google Maps Interface</p>
          <p className="text-sm text-gray-500 mt-1 max-w-md text-center">
            The Google Maps API key will be added later. This area will render the live tracking map showing the artisan's background geolocation.
          </p>
        </div>
      </div>

      {/* Info Card Overlay (Bottom) */}
      <div className="bg-white shadow-lg rounded-t-2xl px-6 py-6 border-t z-10 -mt-4 relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Status Update</h2>
            <p className="text-sm text-[#007A52] font-medium mt-1">{locationStatus}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <img className="h-12 w-12 rounded-full object-cover" src="https://ui-avatars.com/api/?name=Artisan&background=F56500&color=fff" alt="Artisan" />
          </div>
        </div>

        <div className="border-t pt-4 flex gap-4">
          <button className="flex-1 bg-[#0D2B5E] text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#0D2B5E]/90">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            Call Artisan
          </button>
          <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            Message
          </button>
        </div>
      </div>
    </div>
  );
}
