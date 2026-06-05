'use client';

import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RequireCustomerAuth } from '../../../components/RequireCustomerAuth';
import { useBookingStore } from '../../../store/useBookingStore';
import { createBooking, fetchPublicArtisanProfile, fetchServiceCategories } from '../../../lib/marketplace';
import { ApiError } from '../../../lib/api';

function BookingWizardContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const artisanIdParam = params.artisanId as string;
  const urlCategoriesKey = searchParams.get('categories') ?? '';
  const urlCategories = urlCategoriesKey.split(',').filter(Boolean);

  const {
    step,
    nextStep,
    prevStep,
    updateBooking,
    resetBooking,
    artisanId,
    categorySlugs,
    serviceDetails,
    scheduledDate,
    scheduledTime,
    location,
    priceEstimate,
  } = useBookingStore();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const { data: artisan } = useQuery({
    queryKey: ['artisan-public', artisanIdParam],
    queryFn: () => fetchPublicArtisanProfile(artisanIdParam),
    enabled: Boolean(artisanIdParam),
  });

  const { data: allCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchServiceCategories,
  });

  useEffect(() => {
    const slugs = urlCategories.length > 0 ? urlCategories : categorySlugs;
    if (artisanId !== artisanIdParam) {
      resetBooking();
      updateBooking({
        artisanId: artisanIdParam,
        categorySlugs: slugs,
        priceEstimate: null,
      });
    } else if (urlCategories.length > 0 && urlCategories.join(',') !== categorySlugs.join(',')) {
      updateBooking({ categorySlugs: urlCategories });
    }
  }, [artisanIdParam, urlCategoriesKey, artisanId, categorySlugs, resetBooking, updateBooking, urlCategories]);

  const categoryLabels = categorySlugs
    .map((slug) => allCategories.find((c) => c.slug === slug)?.name || slug)
    .filter(Boolean);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateBooking({
          location: {
            ...location,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        });
        setLocating(false);
      },
      () => {
        setError('Could not detect your location. Enter your address manually.');
        setLocating(false);
      }
    );
  }

  async function handleNext() {
    setError('');

    if (step === 1 && serviceDetails.length < 20) {
      setError('Please describe the service in at least 20 characters.');
      return;
    }

    if (step === 3 && !location.address.trim()) {
      setError('Please enter your service address.');
      return;
    }

    if (step === 4) {
      const quote = priceEstimate ?? 0;
      if (!Number.isFinite(quote) || quote < 1000) {
        setError('Enter an agreed quote of at least ₦1,000.');
        return;
      }

      setLoading(true);
      try {
        const result = await createBooking({
          artisanId,
          description: serviceDetails,
          price: quote,
          categorySlugs,
          scheduledDate,
          scheduledTime,
          serviceAddress: location.address,
          latitude: location.lat,
          longitude: location.lng,
        });
        window.location.href = result.payment.authorization_url;
        return;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Booking failed');
        setLoading(false);
        return;
      }
    }

    nextStep();
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-3xl font-black text-brand-navy mb-2">Service Details</h2>
            <p className="text-gray-500 mb-4">Describe the job. You and the artisan agree on the quote before payment.</p>
            {categoryLabels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {categoryLabels.map((label) => (
                  <span key={label} className="text-sm bg-brand-green/10 text-brand-green px-3 py-1 rounded-full font-bold">
                    {label}
                  </span>
                ))}
              </div>
            )}
            <textarea
              className="w-full p-5 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand-green bg-gray-50/50 resize-none text-lg"
              placeholder="E.g., The kitchen sink pipe is leaking and needs replacement..."
              rows={5}
              value={serviceDetails}
              onChange={(e) => updateBooking({ serviceDetails: e.target.value })}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-3xl font-black text-brand-navy mb-2">Schedule Time</h2>
            <p className="text-gray-500 mb-6">When should the artisan arrive?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="date" className="w-full p-4 border-2 border-gray-100 rounded-2xl" value={scheduledDate || ''} onChange={(e) => updateBooking({ scheduledDate: e.target.value })} />
              <input type="time" className="w-full p-4 border-2 border-gray-100 rounded-2xl" value={scheduledTime || ''} onChange={(e) => updateBooking({ scheduledTime: e.target.value })} />
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-3xl font-black text-brand-navy mb-2">Service Location</h2>
            <p className="text-gray-500 mb-4">Where should the work be done?</p>
            <input
              type="text"
              className="w-full p-4 border-2 border-gray-100 rounded-2xl mb-4"
              placeholder="Enter your full street address"
              value={location.address}
              onChange={(e) => updateBooking({ location: { ...location, address: e.target.value } })}
            />
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="text-sm font-bold text-brand-green hover:underline disabled:opacity-50"
            >
              {locating ? 'Detecting location...' : 'Use my current location'}
            </button>
            {location.lat != null && location.lng != null && (
              <p className="text-xs text-gray-400 mt-2">Coordinates saved for tracking</p>
            )}
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-3xl font-black text-brand-navy mb-2">Agree Quote & Pay into Escrow</h2>
            <p className="text-gray-500 mb-6">Enter the price you agreed with the artisan. Funds are held until you confirm completion.</p>
            <div className="bg-brand-navy text-white p-8 rounded-3xl mb-6">
              <p className="text-slate-300 mb-1">Agreed quote (NGN)</p>
              <input
                type="number"
                min={1000}
                step={500}
                className="w-full p-4 rounded-xl text-brand-navy text-2xl font-black mb-4"
                placeholder="e.g. 15000"
                value={priceEstimate ?? ''}
                onChange={(e) => updateBooking({ priceEstimate: e.target.value ? Number(e.target.value) : null })}
              />
              <p className="text-sm text-slate-300">Full amount held in Paystack escrow until job completion is confirmed.</p>
            </div>
            <div className="space-y-2 bg-gray-50 p-6 rounded-3xl border text-sm">
              {artisan && (
                <p><strong>Artisan:</strong> {artisan.firstName} {artisan.lastName}</p>
              )}
              <p><strong>Service:</strong> {serviceDetails.slice(0, 120)}{serviceDetails.length > 120 ? '...' : ''}</p>
              {categoryLabels.length > 0 && (
                <p><strong>Categories:</strong> {categoryLabels.join(', ')}</p>
              )}
              <p><strong>When:</strong> {scheduledDate || 'Flexible'} {scheduledTime || ''}</p>
              <p><strong>Where:</strong> {location.address}</p>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-4xl font-black text-brand-navy mb-4">Booking Secured!</h2>
            <button type="button" onClick={() => router.push('/dashboard/customer')} className="bg-brand-navy text-white px-10 py-4 rounded-full font-bold">
              Go to Dashboard
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black text-brand-navy">Sharp<span className="text-brand-green">Work</span></Link>
        <Link href="/search" className="text-sm font-bold text-gray-500">Cancel</Link>
      </div>

      {artisan && step < 5 && (
        <div className="max-w-3xl mx-auto mb-6 bg-white rounded-2xl border p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-brand-navy">{artisan.firstName} {artisan.lastName}</p>
            <p className="text-sm text-yellow-600">★ {artisan.averageRating || 'New'} ({artisan.reviewCount} reviews)</p>
          </div>
          <Link href={`/artisan/${artisanIdParam}/profile`} className="text-sm font-bold text-brand-green">View profile</Link>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-lg border p-8 md:p-12">
        {step < 5 && (
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bg-brand-green' : 'bg-gray-100'}`} />
            ))}
          </div>
        )}
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {renderStep()}

        {step < 5 && (
          <div className="mt-12 flex justify-between border-t pt-8">
            <button type="button" onClick={prevStep} disabled={step === 1} className="px-8 py-3 rounded-2xl font-bold bg-gray-100 disabled:opacity-40">Back</button>
            <button type="button" onClick={handleNext} disabled={loading} className="bg-brand-green text-white px-10 py-3 rounded-2xl font-bold disabled:opacity-60">
              {loading ? 'Processing...' : step === 4 ? 'Pay into Escrow' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingWizard() {
  return (
    <RequireCustomerAuth>
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading booking...</div>}>
        <BookingWizardContent />
      </Suspense>
    </RequireCustomerAuth>
  );
}
