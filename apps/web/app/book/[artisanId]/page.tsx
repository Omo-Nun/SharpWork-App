'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RequireCustomerAuth } from '../../../components/RequireCustomerAuth';
import { useBookingStore } from '../../../store/useBookingStore';
import { fetchPublicArtisanProfile, fetchServiceCategories, uploadArtisanFile } from '../../../lib/marketplace';
import { ApiError, apiPost } from '../../../lib/api';

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
    mediaUrls,
    scheduledDate,
    scheduledTime,
    location,
    isDraft,
    lastSavedAt,
  } = useBookingStore();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1] || '';
          // We can reuse the uploadArtisanFile endpoint for now as a general media upload
          const result = await uploadArtisanFile(base64, file.type);
          updateBooking({ mediaUrls: [...mediaUrls, result.url] });
        } catch (err) {
          setError('Failed to upload image. Please try again.');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error processing file');
      setUploading(false);
    }
  }

  function removeMedia(index: number) {
    const newMedia = [...mediaUrls];
    newMedia.splice(index, 1);
    updateBooking({ mediaUrls: newMedia });
  }

  async function handleNext() {
    setError('');

    if (step === 1 && serviceDetails.trim().length < 10) {
      setError('Please describe the issue in at least 10 characters so the artisan understands your needs.');
      return;
    }

    if (step === 2) {
      if (!scheduledDate) {
        setError('Please select a preferred date for the service.');
        return;
      }
      const selected = new Date(scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        setError('Scheduled date cannot be in the past.');
        return;
      }
    }

    if (step === 3 && !location.address.trim()) {
      setError('Please enter the service address.');
      return;
    }

    if (step === 4) {
      setLoading(true);
      try {
        await apiPost('/booking', {
          artisanId: artisanIdParam,
          description: serviceDetails,
          scheduledDate,
          scheduledTime,
          serviceAddress: location.address,
          latitude: location.lat,
          longitude: location.lng,
          categorySlugs,
          mediaUrls,
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('sharpwork_access_token') || ''}` }
        });
        
        updateBooking({ step: 5 });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send inquiry');
      } finally {
        setLoading(false);
      }
      return;
    }

    nextStep();
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy mb-2">What do you need help with?</h2>
            <p className="text-gray-500 mb-6">Describe your issue in detail. Add photos or videos to help the artisan provide an accurate quote later.</p>
            
            {categoryLabels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {categoryLabels.map((label) => (
                  <span key={label} className="text-sm bg-brand-green/10 text-brand-green px-3 py-1 rounded-full font-bold">
                    {label}
                  </span>
                ))}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-bold text-brand-navy mb-2">Description</label>
              <textarea
                className={`w-full p-4 border-2 ${serviceDetails.length > 0 && serviceDetails.length < 10 ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-green'} rounded-2xl outline-none transition-colors bg-gray-50/50 resize-none text-base`}
                placeholder="E.g., The kitchen sink pipe is leaking and water is pooling on the floor..."
                rows={5}
                value={serviceDetails}
                onChange={(e) => updateBooking({ serviceDetails: e.target.value })}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                <span>{serviceDetails.length} characters (min 10)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-brand-navy mb-2">Add Photos (Optional)</label>
              <div className="flex flex-wrap gap-4">
                {mediaUrls.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden group">
                    <Image src={url} alt={`Upload ${i+1}`} fill unoptimized className="object-cover" />
                    <button 
                      onClick={() => removeMedia(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                
                {mediaUrls.length < 3 && (
                  <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-brand-green hover:border-brand-green hover:bg-brand-green/5 transition-colors cursor-pointer relative">
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        <span className="text-xs font-medium">Upload</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">Max 3 images. 5MB per file.</p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy mb-2">When do you need it?</h2>
            <p className="text-gray-500 mb-6">Select your preferred date and time for the artisan to arrive.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">Date</label>
                <input 
                  type="date" 
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-brand-green bg-gray-50/50" 
                  value={scheduledDate || ''} 
                  onChange={(e) => updateBooking({ scheduledDate: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">Time (Optional)</label>
                <input 
                  type="time" 
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-brand-green bg-gray-50/50" 
                  value={scheduledTime || ''} 
                  onChange={(e) => updateBooking({ scheduledTime: e.target.value })} 
                />
                <p className="text-xs text-gray-400 mt-2">Leave blank if you are flexible.</p>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy mb-2">Where do you need it?</h2>
            <p className="text-gray-500 mb-6">Enter the exact address where the service will be provided.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-brand-navy mb-2">Street Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                </div>
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-brand-green bg-gray-50/50 text-base"
                  placeholder="e.g. 15 Admiralty Way, Lekki Phase 1"
                  value={location.address}
                  onChange={(e) => updateBooking({ location: { ...location, address: e.target.value } })}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-navy/5 text-brand-navy font-bold text-sm hover:bg-brand-navy/10 transition-colors disabled:opacity-50"
            >
              {locating ? (
                <div className="w-4 h-4 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
              )}
              {locating ? 'Detecting...' : 'Use my current GPS location'}
            </button>
            {location.lat != null && location.lng != null && (
              <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                Precise coordinates saved
              </p>
            )}
          </div>
        );
      case 4:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy mb-2">Review your Inquiry</h2>
            <p className="text-gray-500 mb-6">Make sure everything looks good before sending it to the artisan.</p>
            
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 mb-6">
              {/* Artisan Summary */}
              {artisan && (
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm flex-shrink-0">
                    <Image 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(`${artisan.firstName} ${artisan.lastName}`)}&background=0D2B5E&color=fff&size=96`} 
                      alt="Artisan" 
                      width={48} 
                      height={48} 
                      unoptimized 
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Sending to</p>
                    <p className="font-bold text-brand-navy">{artisan.firstName} {artisan.lastName}</p>
                  </div>
                </div>
              )}

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-gray-500 mb-1">Service Required</dt>
                  <dd className="font-medium text-gray-900 bg-gray-50 p-3 rounded-xl">{serviceDetails}</dd>
                </div>
                
                {mediaUrls.length > 0 && (
                  <div>
                    <dt className="text-gray-500 mb-2">Attached Media</dt>
                    <dd className="flex gap-2">
                      {mediaUrls.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <Image src={url} alt={`Attached ${i+1}`} fill unoptimized className="object-cover" />
                        </div>
                      ))}
                    </dd>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-gray-500 mb-1">Date & Time</dt>
                    <dd className="font-medium text-gray-900">
                      {new Date(scheduledDate!).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      {scheduledTime ? ` at ${scheduledTime}` : ' (Flexible)'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-1">Location</dt>
                    <dd className="font-medium text-gray-900 truncate" title={location.address}>{location.address}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="bg-brand-navy/5 rounded-2xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-brand-navy mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
              <p className="text-sm text-brand-navy/80">
                <strong>What happens next?</strong> This inquiry will start a secure chat with {artisan?.firstName || 'the artisan'}. You can discuss details and receive a final quote before any payment is required.
              </p>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="text-center py-16 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </div>
            <h2 className="text-3xl font-black text-brand-navy mb-4">Inquiry Sent!</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Your service request has been sent to the artisan. A secure chat thread has been opened for you to negotiate the quote.</p>
            <button 
              type="button" 
              onClick={() => {
                resetBooking();
                router.push('/dashboard/customer/messages');
              }} 
              className="bg-brand-navy text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all hover:-translate-y-0.5"
            >
              Go to Messages →
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:py-12">
      <div className="max-w-2xl mx-auto mb-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black text-brand-navy flex items-center gap-1.5">
          <span className="bg-brand-green text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow shadow-brand-green/30">S</span>
          Sharp<span className="text-brand-green">Work</span>
        </Link>
        <div className="flex items-center gap-4">
          {isDraft && lastSavedAt && (
            <span className="text-xs text-gray-400 font-medium hidden sm:inline-block">
              Draft saved at {new Date(lastSavedAt).toLocaleTimeString()}
            </span>
          )}
          <Link href={artisanIdParam ? `/artisan/${artisanIdParam}/profile` : '/search'} className="text-sm font-bold text-gray-500 hover:text-brand-navy transition-colors">
            Cancel
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 sm:p-10 relative overflow-hidden">
        {step < 5 && (
          <div className="flex gap-2 mb-10">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex-1 relative">
                <div className={`h-1.5 w-full rounded-full transition-colors duration-500 ${n <= step ? 'bg-brand-green' : 'bg-gray-100'}`} />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        
        {renderStep()}

        {step < 5 && (
          <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
            <button 
              type="button" 
              onClick={prevStep} 
              disabled={step === 1} 
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-colors ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 bg-gray-50 hover:bg-gray-100'}`}
            >
              ← Back
            </button>
            <button 
              type="button" 
              onClick={handleNext} 
              disabled={loading || uploading} 
              className="bg-brand-green text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : step === 4 ? (
                'Send Inquiry →'
              ) : (
                'Continue →'
              )}
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
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <BookingWizardContent />
      </Suspense>
    </RequireCustomerAuth>
  );
}
