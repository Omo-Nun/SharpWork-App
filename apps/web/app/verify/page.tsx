'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function VerificationWizard() {
  const [step, setStep] = useState(1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-navy">Step 1: Identity Verification</h2>
            <p className="text-gray-500">Please provide your NIN or BVN for instant verification via Smile Identity.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">National Identity Number (NIN)</label>
              <input 
                type="text" 
                placeholder="Enter 11 digit NIN"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
              />
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
              <p className="text-sm text-blue-700">
                <strong>Next Step:</strong> You will be prompted to take a live selfie to match against your identity document.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-navy">Step 2: Skills & Portfolio</h2>
            <p className="text-gray-500">Upload photos of your past work to demonstrate your expertise.</p>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Skill Category</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green bg-white">
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Carpentry</option>
                <option>Cleaning</option>
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-navy">Step 3: Background Check</h2>
            <p className="text-gray-500">We require your consent to perform a background check.</p>
            <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <input type="checkbox" className="mt-1 w-5 h-5 text-brand-green rounded border-gray-300 focus:ring-brand-green" />
              <label className="text-sm text-gray-700">
                I authorize SharpWork and its background check partners to conduct a criminal background and public records check. I understand this is required for platform safety.
              </label>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-navy">Step 4: References</h2>
            <p className="text-gray-500">Provide contact details for two previous clients.</p>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-xl space-y-3">
                <h4 className="font-bold text-sm text-gray-700">Reference 1</h4>
                <input type="text" placeholder="Full Name" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                <input type="tel" placeholder="Phone Number" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <div className="p-4 border border-gray-200 rounded-xl space-y-3">
                <h4 className="font-bold text-sm text-gray-700">Reference 2</h4>
                <input type="text" placeholder="Full Name" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                <input type="tel" placeholder="Phone Number" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <Link href="/" className="text-2xl font-black text-brand-green">SharpWork</Link>
          <div className="text-sm font-medium text-gray-500">Artisan Verification</div>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`text-xs font-bold ${step >= i ? 'text-brand-green' : 'text-gray-400'}`}>
                STEP {i}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-brand-green h-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            {renderStep()}
          </div>

          <div className="flex justify-between mt-12 relative z-10 border-t border-gray-100 pt-6">
            <button 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0 cursor-default' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Back
            </button>
            <button 
              onClick={() => {
                if (step < 4) setStep(step + 1);
                else alert('Verification Submitted for Approval!');
              }}
              className="bg-brand-green text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
            >
              {step === 4 ? 'Submit for Review' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
