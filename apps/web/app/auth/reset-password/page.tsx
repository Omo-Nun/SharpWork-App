'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend API to trigger Termii SMS OTP
    console.log('Requesting OTP for', phone);
    setStep(2);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend API to verify OTP and reset password
    console.log('Resetting password with OTP:', otp);
    alert('Password reset successful! You can now login.');
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1 ? "We'll send an OTP to your registered phone number." : "Enter the 6-digit OTP sent to your phone."}
          </p>
        </div>

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequestOTP}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="phone" className="sr-only">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-[#0D2B5E] focus:outline-none focus:ring-[#0D2B5E] sm:text-sm"
                  placeholder="Phone Number (e.g., +2348012345678)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-[#0D2B5E] py-2 px-4 text-sm font-medium text-white hover:bg-[#0D2B5E]/90 focus:outline-none focus:ring-2 focus:ring-[#0D2B5E] focus:ring-offset-2"
              >
                Send OTP
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="otp" className="sr-only">OTP</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-[#0D2B5E] focus:outline-none focus:ring-[#0D2B5E] sm:text-sm text-center tracking-widest text-lg font-mono"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="new-password" className="sr-only">New Password</label>
                <input
                  id="new-password"
                  name="password"
                  type="password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-[#0D2B5E] focus:outline-none focus:ring-[#0D2B5E] sm:text-sm"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-[#F56500] py-2 px-4 text-sm font-medium text-white hover:bg-[#F56500]/90 focus:outline-none focus:ring-2 focus:ring-[#F56500] focus:ring-offset-2"
              >
                Confirm Reset
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-[#0D2B5E] hover:underline"
              >
                Didn't receive code? Try again
              </button>
            </div>
          </form>
        )}
        
        <div className="text-center mt-4">
          <Link href="/auth/login" className="font-medium text-sm text-[#0D2B5E] hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
