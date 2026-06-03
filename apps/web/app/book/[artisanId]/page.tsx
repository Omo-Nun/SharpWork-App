'use client';

import { useEffect } from 'react';
import { useBookingStore } from '../../../store/useBookingStore';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BookingWizard() {
  const params = useParams();
  const router = useRouter();
  const { step, nextStep, prevStep, updateBooking, resetBooking, artisanId } = useBookingStore();

  useEffect(() => {
    // If starting a new booking for a different artisan, reset state
    if (params.artisanId && artisanId !== params.artisanId) {
      resetBooking();
      updateBooking({ artisanId: params.artisanId as string });
    }
  }, [params.artisanId, artisanId, resetBooking, updateBooking]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-brand-navy mb-2">Service Details</h2>
            <p className="text-gray-500 mb-6">Describe the problem you need fixed in detail.</p>
            <div className="relative">
              <textarea 
                className="w-full p-5 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand-green focus:ring-4 focus:ring-brand-green/10 transition-all bg-gray-50/50 resize-none text-lg" 
                placeholder="E.g., The kitchen sink pipe is leaking from the bottom joint..."
                rows={5}
                onChange={(e) => updateBooking({ serviceDetails: e.target.value })}
              ></textarea>
              <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100 text-xs font-bold text-gray-400">
                Minimum 20 chars
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-brand-navy mb-2">Schedule Time</h2>
            <p className="text-gray-500 mb-6">When do you need the artisan to arrive?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Date</label>
                <input 
                  type="date" 
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand-green bg-gray-50/50 text-lg transition-colors" 
                  onChange={(e) => updateBooking({ scheduledDate: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Time</label>
                <input 
                  type="time" 
                  className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand-green bg-gray-50/50 text-lg transition-colors" 
                  onChange={(e) => updateBooking({ scheduledTime: e.target.value })} 
                />
              </div>
            </div>
            <div className="mt-6 flex items-start space-x-3 bg-blue-50 text-blue-800 p-4 rounded-2xl border border-blue-100">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="text-sm font-medium">Please ensure someone is available at the property during the scheduled 1-hour arrival window.</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-brand-navy mb-2">Service Location</h2>
            <p className="text-gray-500 mb-6">Where should the artisan go?</p>
            
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <input 
                type="text" 
                className="w-full p-4 pl-12 border-2 border-gray-100 rounded-2xl outline-none focus:border-brand-green bg-gray-50/50 text-lg transition-colors" 
                placeholder="Enter your full street address" 
                onChange={(e) => updateBooking({ location: { address: e.target.value, lat: null, lng: null } })} 
              />
            </div>
            
            {/* Map Placeholder */}
            <div className="w-full h-48 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 relative overflow-hidden">
              <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
              <span className="font-bold">Google Maps API Integration</span>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black text-brand-navy mb-2">Review & Escrow Payment</h2>
            <p className="text-gray-500 mb-6">Review your job details and secure funds.</p>
            
            <div className="bg-brand-navy text-white p-8 rounded-3xl mb-6 relative overflow-hidden shadow-xl shadow-brand-navy/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <p className="text-slate-300 font-medium mb-1">Estimated Call-out Fee</p>
              <p className="text-5xl font-black mb-4 tracking-tight">₦ 15<span className="text-3xl">,000</span></p>
              <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm text-sm text-slate-200">
                <span className="font-bold text-white mr-2">Paystack Escrow:</span>
                Your money is securely held. The artisan only gets paid after you confirm the job is 100% complete and satisfactory.
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Service</span>
                <span className="font-bold text-brand-navy">Plumbing Repair</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Schedule</span>
                <span className="font-bold text-brand-navy">Tomorrow, 10:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Address</span>
                <span className="font-bold text-brand-navy truncate max-w-[200px]">123 Main Street, Lagos</span>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="animate-in zoom-in-95 duration-500 text-center py-12 relative">
            <div className="absolute inset-0 bg-brand-green/5 blur-3xl rounded-full -z-10 w-64 h-64 mx-auto"></div>
            <div className="w-24 h-24 bg-gradient-to-tr from-brand-green to-green-400 text-white rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-xl shadow-brand-green/30">
              ✓
            </div>
            <h2 className="text-4xl font-black text-brand-navy mb-4 tracking-tight">Booking Secured!</h2>
            <p className="text-gray-500 text-lg mb-10 max-w-sm mx-auto">
              Your request has been sent. We've notified the artisan and your funds are safe in Escrow.
            </p>
            <button 
              onClick={() => router.push('/dashboard/customer')} 
              className="bg-brand-navy text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95 shadow-lg shadow-brand-navy/20"
            >
              Go to My Dashboard
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand-green/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center relative z-10">
        <Link href="/" className="text-2xl font-black text-brand-navy tracking-tighter">
          Sharp<span className="text-brand-green">Work</span>
        </Link>
        <Link href="/search" className="text-sm font-bold text-gray-500 hover:text-brand-navy">
          Cancel Booking
        </Link>
      </div>

      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden relative z-10">
        
        {/* Progress Tracker */}
        <div className="px-10 pt-10 pb-6 flex items-center justify-between relative">
          <div className="absolute top-1/2 left-10 right-10 h-1 bg-gray-100 -z-10 -translate-y-1/2 mt-2"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-500 ${
                step > i ? 'bg-brand-green text-white shadow-lg shadow-brand-green/30' : 
                step === i ? 'bg-brand-navy text-white shadow-lg shadow-brand-navy/30 scale-110' : 
                'bg-white text-gray-400 border-2 border-gray-200'
              }`}>
                {step > i ? '✓' : i}
              </div>
              <span className={`text-xs font-bold mt-3 uppercase tracking-wider ${step >= i ? 'text-brand-navy' : 'text-gray-400'}`}>
                {i === 1 ? 'Details' : i === 2 ? 'Time' : i === 3 ? 'Location' : 'Payment'}
              </span>
            </div>
          ))}
        </div>

        <div className="p-8 md:p-12 border-t border-gray-100 bg-white">
          {renderStep()}

          {/* Navigation Buttons */}
          {step < 5 && (
            <div className="mt-12 flex justify-between items-center pt-8 border-t border-gray-100">
              <button 
                onClick={prevStep}
                disabled={step === 1}
                className={`px-8 py-3.5 rounded-2xl font-bold transition-all ${
                  step === 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100 bg-gray-50'
                }`}
              >
                Go Back
              </button>
              <button 
                onClick={nextStep}
                className="bg-brand-green text-white px-10 py-3.5 rounded-2xl font-bold text-lg hover:bg-green-600 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-brand-green/20 flex items-center group"
              >
                {step === 4 ? 'Pay into Escrow' : 'Continue'}
                {step !== 4 && (
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
