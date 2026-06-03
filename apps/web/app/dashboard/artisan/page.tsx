'use client';

import { useState } from 'react';
import Link from 'next/link';

// Inline mini bar chart component (no external dependency)
function EarningsChart() {
  const data = [
    { month: 'Jan', amount: 60000 },
    { month: 'Feb', amount: 85000 },
    { month: 'Mar', amount: 45000 },
    { month: 'Apr', amount: 110000 },
    { month: 'May', amount: 95000 },
    { month: 'Jun', amount: 150000 },
  ];
  const max = Math.max(...data.map(d => d.amount));

  return (
    <div className="flex items-end justify-between gap-3 h-40 px-2">
      {data.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400">₦{(d.amount / 1000).toFixed(0)}k</span>
          <div className="w-full rounded-t-xl bg-brand-green/15 relative overflow-hidden" style={{ height: `${(d.amount / max) * 100}%` }}>
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-green to-brand-green/70 rounded-t-xl transition-all duration-700"
              style={{ height: '100%' }}
            />
          </div>
          <span className="text-xs font-bold text-gray-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function ArtisanDashboard() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black text-brand-navy tracking-tighter">
            Sharp<span className="text-brand-green">Work</span> <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-2">Artisan</span>
          </Link>
          <div className="flex items-center space-x-6">
            {/* Availability Toggle — now functional */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className="flex items-center space-x-3 bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className={`text-sm font-bold ${isOnline ? 'text-brand-green' : 'text-gray-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOnline ? 'bg-brand-green' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isOnline ? 'translate-x-6' : 'translate-x-1'}`}></span>
              </div>
            </button>

            <Link href="/settings" className="text-gray-400 hover:text-brand-navy transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </Link>

            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Artisan" alt="Profile" />
            </div>
          </div>
        </div>
      </nav>

      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-gray-800 text-white text-center py-2 text-sm font-medium">
          You are currently <strong>offline</strong>. Toggle back online to receive new job requests.
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 md:p-10 relative z-10">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-brand-navy mb-2">Artisan Dashboard</h1>
          <p className="text-gray-500 text-lg">Manage your jobs, track earnings, and update your availability.</p>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-brand-navy text-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(13,43,94,0.2)] hover:-translate-y-1 transition-transform group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full blur-2xl"></div>
            <div className="mb-6">
              <h3 className="text-slate-300 font-medium mb-1">Total Earnings</h3>
              <p className="text-5xl font-black tracking-tight">₦ 450<span className="text-3xl text-slate-400">k</span></p>
            </div>
            <div className="flex items-center space-x-2 text-brand-green font-bold text-sm bg-brand-green/10 w-fit px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              <span>+12.5% this month</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <h3 className="text-gray-500 font-medium mb-1">Completed Jobs</h3>
            <p className="text-4xl font-black text-brand-navy">28</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-orange-50 text-brand-orange rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            </div>
            <h3 className="text-gray-500 font-medium mb-1">Rating</h3>
            <p className="text-4xl font-black text-brand-navy">4.9 <span className="text-lg text-gray-400 font-normal">/ 5.0</span></p>
          </div>
        </div>

        {/* Action Center */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Incoming Requests</h2>
            
            {isOnline ? (
              <>
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-brand-green/20 p-6 flex flex-col md:flex-row items-start md:items-center justify-between mb-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-green"></div>
                  <div className="flex items-center space-x-5 mb-4 md:mb-0 ml-2">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-brand-navy">
                      SK
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-brand-navy">Leaky Faucet Repair</h3>
                      <p className="text-gray-500 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        2.4 km away • 15,000 NGN
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors">Decline</button>
                    <button className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-brand-green text-white font-bold hover:bg-green-700 hover:shadow-lg transition-all">Accept Job</button>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-3xl p-8 text-center text-gray-500">
                  No more incoming requests. Keep your status online!
                </div>
              </>
            ) : (
              <div className="bg-gray-100 border border-gray-200 border-dashed rounded-3xl p-12 text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 010-5.656"></path></svg>
                <p className="font-bold text-lg">You are offline</p>
                <p className="text-sm mt-1">Toggle your status to Online to start receiving job requests.</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-brand-navy mb-6">Quick Actions</h2>
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-2">
              <button className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-left group">
                <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-brand-navy">Add Portfolio Item</h4>
                  <p className="text-xs text-gray-500">Upload recent work photos</p>
                </div>
              </button>
              <button className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors text-left group">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-brand-navy">Withdraw Funds</h4>
                  <p className="text-xs text-gray-500">Transfer wallet to bank</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Earnings Chart Section */}
        <div>
          <h2 className="text-2xl font-bold text-brand-navy mb-6">Earnings Overview</h2>
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-500 text-sm font-medium">Last 6 months</p>
                <p className="text-3xl font-black text-brand-navy">₦ 545,000</p>
              </div>
              <div className="flex items-center space-x-2 text-brand-green font-bold text-sm bg-green-50 px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                <span>+18.3%</span>
              </div>
            </div>
            <EarningsChart />
          </div>
        </div>

      </div>
    </div>
  );
}
