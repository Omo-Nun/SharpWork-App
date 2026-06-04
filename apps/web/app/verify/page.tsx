'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchSkillTest,
  getVerificationStatus,
  submitVerification,
  submitVerificationStep,
  uploadArtisanFile,
} from '../../lib/marketplace';
import { ApiError } from '../../lib/api';

const SKILL_OPTIONS = ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Painting', 'AC Repair'];
const BANK_OPTIONS = [
  { code: '044', name: 'Access Bank' },
  { code: '058', name: 'GTBank' },
  { code: '033', name: 'UBA' },
  { code: '057', name: 'Zenith Bank' },
  { code: '011', name: 'First Bank' },
];

interface SkillQuestion {
  id: string;
  skill: string;
  question: string;
  options: string[];
}

export default function VerificationWizard() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [nin, setNin] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [skillQuestions, setSkillQuestions] = useState<SkillQuestion[]>([]);
  const [skillAnswers, setSkillAnswers] = useState<Record<string, number>>({});
  const [consent, setConsent] = useState(false);
  const [bvn, setBvn] = useState('');
  const [settlementBank, setSettlementBank] = useState('044');
  const [accountNumber, setAccountNumber] = useState('');
  const [ref1, setRef1] = useState({ fullName: '', phoneNumber: '' });
  const [ref2, setRef2] = useState({ fullName: '', phoneNumber: '' });

  useEffect(() => {
    getVerificationStatus()
      .then((data) => {
        setStep(Math.max(1, Math.min(data.verificationStep, 4)));
        setStatus(data.verificationStatus);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (step === 2 && skills.length > 0) {
      fetchSkillTest(skills)
        .then((data) => setSkillQuestions(data.questions))
        .catch(() => setSkillQuestions([]));
    }
  }, [step, skills]);

  async function handleFileUpload(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const result = await uploadArtisanFile(dataUrl, file.type);
        setPortfolioUrl(result.url);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Upload failed');
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleContinue() {
    setError('');
    setLoading(true);
    try {
      if (step === 1) {
        await submitVerificationStep(1, { nin, selfieBase64: 'dev-selfie' });
        setStep(2);
      } else if (step === 2) {
        const skillTestAnswers = skillQuestions.map((q) => ({
          questionId: q.id,
          selectedIndex: skillAnswers[q.id] ?? -1,
        }));
        await submitVerificationStep(2, {
          skills,
          portfolioUrls: portfolioUrl ? [portfolioUrl] : [],
          skillTestAnswers,
        });
        setStep(3);
      } else if (step === 3) {
        await submitVerificationStep(3, { consent: true, bvn: bvn || undefined });
        setStep(4);
      } else if (step === 4) {
        await submitVerificationStep(4, {
          references: [ref1, ref2],
          settlementBank,
          accountNumber,
        });
        await submitVerification();
        setStatus('SUBMITTED');
        setStep(5);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Step failed');
    } finally {
      setLoading(false);
    }
  }

  function toggleSkill(skill: string) {
    setSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  }

  if (status === 'SUBMITTED' || status === 'UNDER_REVIEW' || step === 5) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white p-8 rounded-3xl shadow-xl text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-brand-navy mb-2">Submitted for Review</h1>
          <p className="text-gray-500 mb-6">An admin will review your verification. You will be notified once approved.</p>
          <Link href="/dashboard/artisan" className="text-brand-green font-bold hover:underline">Back to Dashboard</Link>
        </div>
      </main>
    );
  }

  if (status === 'APPROVED') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white p-8 rounded-3xl shadow-xl text-center">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-brand-navy mb-2">You are Verified</h1>
          <Link href="/dashboard/artisan" className="text-brand-green font-bold hover:underline">Go to Dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <Link href="/" className="text-2xl font-black text-brand-green">SharpWork</Link>
          <div className="text-sm font-medium text-gray-500">Artisan Verification — Step {Math.min(step, 4)} of 4</div>
        </div>

        <div className="mb-6 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div className="bg-brand-green h-full transition-all" style={{ width: `${(Math.min(step, 4) / 4) * 100}%` }} />
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 min-h-[400px] flex flex-col justify-between">
          <div>
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-brand-navy">Step 1: Identity Verification</h2>
                <input type="text" placeholder="11-digit NIN" maxLength={11} value={nin} onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                <p className="text-sm text-gray-500">Smile Identity verifies your NIN and liveness. Dev mode auto-passes at 85%+ confidence.</p>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-brand-navy">Step 2: Skills, Test & Portfolio</h2>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => (
                    <button key={skill} type="button" onClick={() => toggleSkill(skill)} className={`px-4 py-2 rounded-full text-sm font-bold border ${skills.includes(skill) ? 'bg-brand-green text-white border-brand-green' : 'border-gray-200 text-gray-600'}`}>
                      {skill}
                    </button>
                  ))}
                </div>
                {skillQuestions.map((q) => (
                  <div key={q.id} className="border rounded-xl p-4">
                    <p className="font-medium text-sm mb-3">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((option, index) => (
                        <label key={option} className="flex items-center gap-2 text-sm">
                          <input type="radio" name={q.id} checked={skillAnswers[q.id] === index} onChange={() => setSkillAnswers({ ...skillAnswers, [q.id]: index })} />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium mb-2">Portfolio photo</label>
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} className="text-sm" />
                  {portfolioUrl && <p className="text-xs text-green-600 mt-2">Uploaded: {portfolioUrl}</p>}
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-brand-navy">Step 3: Background Check</h2>
                <input type="text" placeholder="BVN (optional)" maxLength={11} value={bvn} onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                <label className="flex items-start gap-3 text-sm text-gray-700">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
                  I authorize SharpWork to conduct a background check via Smile Identity.
                </label>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-brand-navy">Step 4: References & Payout Account</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select value={settlementBank} onChange={(e) => setSettlementBank(e.target.value)} className="px-3 py-2 rounded-lg border text-sm">
                    {BANK_OPTIONS.map((bank) => (
                      <option key={bank.code} value={bank.code}>{bank.name}</option>
                    ))}
                  </select>
                  <input type="text" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} className="px-3 py-2 rounded-lg border text-sm" />
                </div>
                {[ref1, ref2].map((ref, i) => (
                  <div key={i} className="p-4 border rounded-xl space-y-2">
                    <input type="text" placeholder="Reference Full Name" value={ref.fullName} onChange={(e) => (i === 0 ? setRef1({ ...ref1, fullName: e.target.value }) : setRef2({ ...ref2, fullName: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" />
                    <input type="tel" placeholder="Reference Phone" value={ref.phoneNumber} onChange={(e) => (i === 0 ? setRef1({ ...ref1, phoneNumber: e.target.value }) : setRef2({ ...ref2, phoneNumber: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between mt-12 border-t border-gray-100 pt-6">
            <button type="button" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 disabled:opacity-40">Back</button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={
                loading ||
                (step === 1 && nin.length !== 11) ||
                (step === 2 && (skills.length === 0 || skillQuestions.some((q) => skillAnswers[q.id] === undefined))) ||
                (step === 3 && !consent) ||
                (step === 4 && (!accountNumber || !ref1.fullName || !ref2.fullName))
              }
              className="bg-brand-green text-white px-8 py-3 rounded-xl font-bold disabled:opacity-60"
            >
              {loading ? 'Saving...' : step === 4 ? 'Submit for Review' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
