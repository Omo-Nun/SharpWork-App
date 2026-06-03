'use client';

import { useState } from 'react';

export default function AdminSettings() {
  const [totpSetup, setTotpSetup] = useState<{ secret: string; qrCode: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verified, setVerified] = useState(false);

  const handleSetupTOTP = async () => {
    // TODO: Replace with real API call
    // const res = await fetch('http://localhost:4000/admin/totp/setup', { method: 'POST', credentials: 'include' });
    // const data = await res.json();
    setTotpSetup({
      secret: 'PLACEHOLDER_SECRET_KEY',
      qrCode: '', // Will be a data:image/png;base64,... URL from the real API
    });
  };

  const handleVerifyTOTP = async () => {
    // TODO: Replace with real API call
    // const res = await fetch('http://localhost:4000/admin/totp/verify', { method: 'POST', body: JSON.stringify({ token: verifyCode }), ... });
    if (verifyCode.length === 6) {
      setVerified(true);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Settings</h1>

      {/* TOTP 2FA Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6 max-w-lg">
        <h2 className="text-xl font-bold mb-4">Two-Factor Authentication (TOTP)</h2>
        <p className="text-gray-600 text-sm mb-6">
          Protect your admin account with time-based one-time passwords. Scan the QR code with Google Authenticator or Authy.
        </p>

        {!totpSetup ? (
          <button
            onClick={handleSetupTOTP}
            className="bg-brand-green text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-600 transition-colors"
          >
            Enable 2FA
          </button>
        ) : !verified ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border text-center">
              {totpSetup.qrCode ? (
                <img src={totpSetup.qrCode} alt="TOTP QR Code" className="mx-auto w-48 h-48" />
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto flex items-center justify-center text-gray-500 text-sm">
                  QR Code will appear here
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2 font-mono break-all">
                Secret: {totpSetup.secret}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Enter 6-digit code to verify:</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 p-3 border rounded-lg text-center text-2xl tracking-widest font-mono outline-brand-green"
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
            <div className="text-4xl mb-2">🔐</div>
            <p className="font-bold text-green-700">2FA is enabled and verified!</p>
            <p className="text-sm text-green-600 mt-1">Your account is now protected with TOTP two-factor authentication.</p>
          </div>
        )}
      </div>
    </div>
  );
}
