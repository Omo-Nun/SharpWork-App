'use client';

import { useEffect, useState } from 'react';
import { apiPost, apiGet, apiPatch } from '../../lib/api';
import { getAccessToken } from '../../lib/auth-storage';

export default function AdminSettings() {
  const [totpSetup, setTotpSetup] = useState<{ secret: string; qrCode: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [platformFeePercent, setPlatformFeePercent] = useState(15);
  const [feeSaving, setFeeSaving] = useState(false);
  const [feeSaved, setFeeSaved] = useState(false);

  useEffect(() => {
    apiGet<{ platformFeePercent: number }>('/admin/settings/platform', getAccessToken())
      .then((data) => setPlatformFeePercent(data.platformFeePercent))
      .catch(() => undefined);
  }, []);

  const handleSaveFee = async () => {
    setFeeSaving(true);
    setFeeSaved(false);
    setError('');
    try {
      const data = await apiPatch<{ platformFeePercent: number }>(
        '/admin/settings/platform',
        { platformFeePercent },
        getAccessToken()
      );
      setPlatformFeePercent(data.platformFeePercent);
      setFeeSaved(true);
    } catch {
      setError('Failed to update platform fee');
    } finally {
      setFeeSaving(false);
    }
  };

  const handleSetupTOTP = async () => {
    setError('');
    try {
      const data = await apiPost<{ secret: string; qrCode: string }>(
        '/admin/totp/setup',
        {},
        getAccessToken()
      );
      setTotpSetup({ secret: data.secret, qrCode: data.qrCode });
    } catch {
      setError('Failed to setup TOTP');
    }
  };

  const handleVerifyTOTP = async () => {
    setError('');
    try {
      await apiPost('/admin/totp/verify', { token: verifyCode }, getAccessToken());
      setVerified(true);
    } catch {
      setError('Invalid TOTP code');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Settings</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <div className="bg-white rounded-xl shadow-sm border p-6 max-w-lg">
        <h2 className="text-xl font-bold mb-4">Two-Factor Authentication (TOTP)</h2>
        <p className="text-gray-600 text-sm mb-6">
          Protect your admin account with time-based one-time passwords. Scan the QR code with Google Authenticator or Authy.
        </p>

        {!totpSetup ? (
          <button
            onClick={handleSetupTOTP}
            className="bg-brand-green text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-600"
          >
            Enable 2FA
          </button>
        ) : !verified ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border text-center">
              {totpSetup.qrCode ? (
                <img src={totpSetup.qrCode} alt="TOTP QR Code" className="mx-auto w-48 h-48" />
              ) : null}
              <p className="text-xs text-gray-500 mt-2 font-mono break-all">Secret: {totpSetup.secret}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Enter 6-digit code to verify:</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 p-3 border rounded-lg text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                />
                <button
                  onClick={handleVerifyTOTP}
                  disabled={verifyCode.length !== 6}
                  className="bg-brand-black text-white px-6 rounded-lg font-bold disabled:opacity-40"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="font-bold text-green-700">2FA is enabled and verified!</p>
            <p className="text-sm text-green-600 mt-1">Your account is now protected with TOTP two-factor authentication.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 max-w-lg mt-8">
        <h2 className="text-xl font-bold mb-2">Platform Commission</h2>
        <p className="text-gray-600 text-sm mb-6">
          Percentage taken from each booking. Snapshotted per booking at payment time — changes apply only to new bookings.
        </p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Fee percent</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={platformFeePercent}
              onChange={(e) => setPlatformFeePercent(Number(e.target.value))}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <button
            onClick={handleSaveFee}
            disabled={feeSaving}
            className="bg-brand-green text-white px-6 py-3 rounded-lg font-bold disabled:opacity-60"
          >
            {feeSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
        {feeSaved && <p className="text-sm text-green-600 mt-3">Platform fee updated.</p>}
      </div>
    </div>
  );
}
