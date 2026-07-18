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
  const [subStep, setSubStep] = useState<'SKILLS' | 'TEST'>('SKILLS');
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Email verification bypass states
  const [emailVerifyRequired, setEmailVerifyRequired] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [devVerifyUrl, setDevVerifyUrl] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

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

  async function handleResendVerification() {
    setResending(true);
    setResendMessage('');
    try {
      const res = await apiPost<any>('/auth/resend-verification', { email: unverifiedEmail });
      setResendMessage(res.message || 'Verification link sent!');
      if (res.devVerificationUrl) {
        setDevVerifyUrl(res.devVerificationUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  }

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
        if (subStep === 'SKILLS') {
          const skillsQuery = selectedSkills.length ? selectedSkills.join(',') : 'Plumbing';
          const res = await apiGet<any>(`/artisan/verification/skill-test?skills=${encodeURIComponent(skillsQuery)}`);
          setQuestions(res.questions || []);
          setAnswers({});
          setSubStep('TEST');
          setLoading(false);
          return;
        }

        const skillTestAnswers = Object.entries(answers).map(([qId, sIdx]) => ({
          questionId: qId,
          selectedIndex: sIdx
        }));

        await apiPost<any>('/artisan/verification/step-2', { 
          skills: selectedSkills.length ? selectedSkills : ['Plumbing'], 
          portfolioUrls,
          skillTestAnswers 
        });
        setStep(3);
      } else if (currentStep === 3) {
        const res = await apiPost<any>('/artisan/verification/step-3', { consent, bvn });
        setStep(4);
      } else if (currentStep === 4) {
        const refs = references.every(r => r.fullName) ? references : [
          { fullName: 'Jane Doe', phoneNumber: '08000000000' },
          { fullName: 'John Smith', phoneNumber: '0800000001' }
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
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setEmailVerifyRequired(true);
        setUnverifiedEmail(err.data?.email || '');
      }
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

          {emailVerifyRequired && (
            <div className="mb-6 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                ⚠️ Email Verification Required
              </h3>
              <p className="text-sm">
                Your email address <span className="font-semibold">{unverifiedEmail}</span> needs to be verified before you can submit your onboarding application.
              </p>
              {resendMessage && (
                <div className="p-3 bg-white/80 rounded-xl text-sm border border-amber-100 font-medium">
                  {resendMessage}
                </div>
              )}
              {devVerifyUrl && (
                <div className="p-3 bg-emerald-50 rounded-xl text-sm border border-emerald-200 space-y-2">
                  <p className="font-bold text-emerald-800">🛠️ Developer Convenience Bypass:</p>
                  <a 
                    href={devVerifyUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-emerald-700 transition-all"
                  >
                    Auto-Verify Email Instantly
                  </a>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-700 transition-all disabled:opacity-50"
                >
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            </div>
          )}

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

          {step === 2 && subStep === 'SKILLS' && (
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

          {step === 2 && subStep === 'TEST' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Skill Assessment Test</h2>
              <p className="text-sm text-gray-600">Please answer the questions below to verify your skills. You need a score of 80% or higher.</p>
              {questions.map((q, qIndex) => (
                <div key={q.id} className="p-4 border rounded-xl bg-gray-50/50 space-y-2">
                  <p className="font-bold text-sm text-gray-700">Question {qIndex + 1} ({q.skill}):</p>
                  <p className="text-gray-900 font-medium">{q.question}</p>
                  <div className="space-y-2 mt-2">
                    {q.options.map((opt: string, optIdx: number) => (
                      <label key={optIdx} className="flex items-center gap-3 p-2.5 rounded-lg border bg-white hover:bg-gray-50 cursor-pointer transition-all">
                        <input 
                          type="radio" 
                          name={`question-${q.id}`} 
                          checked={answers[q.id] === optIdx}
                          onChange={() => setAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                          className="w-4 h-4 text-brand-green focus:ring-brand-green"
                        />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => setSubStep('SKILLS')}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-bold hover:bg-gray-50"
                >
                  Back
                </button>
                <button 
                  onClick={() => handleNext(2)} 
                  disabled={Object.keys(answers).length < questions.length}
                  className="flex-1 bg-brand-green text-white font-bold py-3 rounded-xl hover:bg-emerald-600 disabled:opacity-50"
                >
                  Submit Assessment
                </button>
              </div>
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
