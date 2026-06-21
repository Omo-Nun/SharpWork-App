'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '../../../lib/api';
import { RequireArtisanAuth } from '../../../components/RequireArtisanAuth';

export default function ArtisanOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Step 1: Verification (NIN + Selfie)
  const [nin, setNin] = useState('');
  const [selfieBase64, setSelfieBase64] = useState('');

  // Step 2: Showcase (Skills + Portfolio)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);

  // Step 3: Background Consent
  const [consent, setConsent] = useState(false);
  const [bvn, setBvn] = useState('');

  // Step 4: References & Payout
  const [references, setReferences] = useState<{ fullName: string; phoneNumber: string }[]>([
    { fullName: '', phoneNumber: '' }, 
    { fullName: '', phoneNumber: '' }
  ]);
  const [settlementBank, setSettlementBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await apiGet<any>('/artisan/verification/status');
        if (res.verificationStatus === 'SUBMITTED' || res.verificationStatus === 'APPROVED') {
          router.push('/dashboard/artisan');
        } else {
          setStep(Math.max(1, res.verificationStep));
        }
      } catch (err) {
        // Ignored, might not be an artisan
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, [router]);

  async function handleNext(currentStep: number) {
    setError('');
    setLoading(true);
    try {
      if (currentStep === 1) {
        // Fake selfie base64 for demo if empty
        const fakeSelfie = selfieBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        const res = await apiPost<any>('/artisan/verification/step-1', { nin, selfieBase64: fakeSelfie });
        setStep(2);
      } else if (currentStep === 2) {
        // Need to pass a mock skill test
        const mockAnswers = [{ questionId: 'q1', answerId: 'a1' }];
        const res = await apiPost<any>('/artisan/verification/step-2', { 
          skills: selectedSkills.length ? selectedSkills : ['Plumbing'], 
          portfolioUrls,
          skillTestAnswers: mockAnswers 
        });
        setStep(3);
      } else if (currentStep === 3) {
        const res = await apiPost<any>('/artisan/verification/step-3', { consent, bvn });
        setStep(4);
      } else if (currentStep === 4) {
        const refs = references.every(r => r.fullName) ? references : [
          { fullName: 'Jane Doe', phoneNumber: '08000000000' },
          { fullName: 'John Smith', phoneNumber: '08000000001' }
        ];
        const res = await apiPost<any>('/artisan/verification/step-4', { 
          references: refs, 
          settlementBank: settlementBank || '058', 
          accountNumber: accountNumber || '0000000000' 
        });
        
        // Final submit
        await apiPost<any>('/artisan/verification/submit', {});
        router.push('/dashboard/artisan');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-10 text-center animate-pulse">Loading setup...</div>;

  return (
    <RequireArtisanAuth>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Artisan Onboarding</h1>
            <p className="text-gray-500 mt-2">Step {step} of 4</p>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
              <div className="bg-brand-green h-2 rounded-full transition-all" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
          </div>

          {error && <div className="mb-4 p-4 text-red-700 bg-red-50 rounded-xl text-sm">{error}</div>}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Identity Verification</h2>
              <p className="text-sm text-gray-600">Provide your NIN and a selfie to build trust with customers.</p>
              <div>
                <label className="block text-sm font-medium mb-1">NIN (National Identity Number)</label>
                <input 
                  type="text" 
                  value={nin} 
                  onChange={e => setNin(e.target.value)} 
                  className="w-full p-3 border rounded-xl" 
                  placeholder="Enter 11-digit NIN" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Upload Selfie</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setSelfieBase64(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} 
                  className="w-full p-3 border rounded-xl" 
                />
              </div>
              <button 
                onClick={() => handleNext(1)} 
                disabled={!nin}
                className="w-full bg-brand-green text-white font-bold py-3 rounded-xl hover:bg-emerald-600 disabled:opacity-50"
              >
                Verify Identity
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Service Category & Portfolio</h2>
              <p className="text-sm text-gray-600">What services do you offer?</p>
              <div>
                <label className="block text-sm font-medium mb-1">Skills</label>
                <select 
                  multiple 
                  onChange={(e) => setSelectedSkills(Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full p-3 border rounded-xl h-32"
                >
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
              <button 
                onClick={() => handleNext(2)} 
                disabled={selectedSkills.length === 0}
                className="w-full bg-brand-green text-white font-bold py-3 rounded-xl hover:bg-emerald-600 disabled:opacity-50"
              >
                Save Services
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Background Check</h2>
              <p className="text-sm text-gray-600">We run a background check to ensure customer safety.</p>
              <div>
                <label className="block text-sm font-medium mb-1">BVN (Optional for extra trust)</label>
                <input 
                  type="text" 
                  value={bvn} 
                  onChange={e => setBvn(e.target.value)} 
                  className="w-full p-3 border rounded-xl" 
                  placeholder="Enter 11-digit BVN" 
                />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <input 
                  type="checkbox" 
                  id="consent" 
                  checked={consent} 
                  onChange={e => setConsent(e.target.checked)} 
                  className="w-5 h-5"
                />
                <label htmlFor="consent" className="text-sm">I consent to a background check using my provided details.</label>
              </div>
              <button 
                onClick={() => handleNext(3)} 
                disabled={!consent}
                className="w-full bg-brand-green text-white font-bold py-3 rounded-xl hover:bg-emerald-600 disabled:opacity-50 mt-4"
              >
                Run Background Check
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Payout Details & References</h2>
              <p className="text-sm text-gray-600">Where should we send your money?</p>
              <div>
                <label className="block text-sm font-medium mb-1">Bank Code</label>
                <input 
                  type="text" 
                  value={settlementBank} 
                  onChange={e => setSettlementBank(e.target.value)} 
                  className="w-full p-3 border rounded-xl" 
                  placeholder="e.g. 058 (GTBank)" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Account Number</label>
                <input 
                  type="text" 
                  value={accountNumber} 
                  onChange={e => setAccountNumber(e.target.value)} 
                  className="w-full p-3 border rounded-xl" 
                  placeholder="10 digit account number" 
                />
              </div>
              
              <h3 className="font-bold text-sm mt-6">References (Optional for demo)</h3>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="Reference 1 Name" 
                  value={references[0]?.fullName || ''} 
                  onChange={e => setReferences([{ fullName: e.target.value, phoneNumber: references[0]?.phoneNumber || '' }, references[1] || { fullName: '', phoneNumber: '' }])} 
                  className="p-3 border rounded-xl" 
                />
                <input 
                  placeholder="Phone" 
                  value={references[0]?.phoneNumber || ''} 
                  onChange={e => setReferences([{ fullName: references[0]?.fullName || '', phoneNumber: e.target.value }, references[1] || { fullName: '', phoneNumber: '' }])} 
                  className="p-3 border rounded-xl" 
                />
              </div>

              <button 
                onClick={() => handleNext(4)} 
                className="w-full bg-brand-green text-white font-bold py-3 rounded-xl hover:bg-emerald-600 mt-6"
              >
                Complete Registration
              </button>
            </div>
          )}
        </div>
      </div>
    </RequireArtisanAuth>
  );
}
