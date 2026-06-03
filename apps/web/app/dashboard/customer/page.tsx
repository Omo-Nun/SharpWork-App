import Link from 'next/link';

export default function CustomerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black text-brand-navy tracking-tighter">
            Sharp<span className="text-brand-green">Work</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/settings" className="text-gray-500 hover:text-brand-navy transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </Link>
            <button className="text-gray-500 hover:text-brand-navy transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-navy to-brand-green p-0.5">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-sm font-bold text-brand-navy border-2 border-white">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 md:p-10 relative z-10">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-brand-navy mb-2">Welcome back, John!</h1>
          <p className="text-gray-500 text-lg">Here is an overview of your active projects and history.</p>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-transform group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 text-brand-green rounded-2xl flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              </div>
              <span className="text-sm font-bold text-brand-green bg-green-50 px-3 py-1 rounded-full">+1 new</span>
            </div>
            <h3 className="text-gray-500 font-medium mb-1">Active Bookings</h3>
            <p className="text-4xl font-black text-brand-navy">2</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-transform group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
            </div>
            <h3 className="text-gray-500 font-medium mb-1">Completed Jobs</h3>
            <p className="text-4xl font-black text-brand-navy">14</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-transform group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 text-brand-orange rounded-2xl flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            <h3 className="text-gray-500 font-medium mb-1">Total Spent</h3>
            <p className="text-4xl font-black text-brand-navy">₦ 150,000</p>
          </div>
        </div>

        {/* Active Jobs Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brand-navy">Active Jobs</h2>
          <Link href="/search" className="text-brand-green font-bold hover:underline">Find new artisan &rarr;</Link>
        </div>

        <div className="space-y-4 mb-12">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-brand-green/30 transition-colors">
            <div className="flex items-center space-x-5 mb-4 md:mb-0">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Artisan" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-brand-navy group-hover:text-brand-green transition-colors">Plumbing Repair</h3>
                <p className="text-gray-500">Felix The Plumber • Scheduled for Tomorrow, 10:00 AM</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">Accepted</span>
              <button className="p-2 text-gray-400 hover:text-brand-navy transition-colors bg-gray-50 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-brand-green/30 transition-colors">
            <div className="flex items-center space-x-5 mb-4 md:mb-0">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Electrical" alt="Artisan" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-brand-navy group-hover:text-brand-green transition-colors">Electrical Rewiring</h3>
                <p className="text-gray-500">Jane Doe • Today, 2:00 PM</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
              <span className="bg-orange-50 text-brand-orange px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
                <span>In Progress</span>
              </span>
              <Link href="/job/job-002/tracking" className="p-2 text-white bg-brand-green hover:bg-green-700 transition-colors rounded-full" title="Track Artisan Live">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Bookings History */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-brand-navy mb-6">Recent Bookings</h2>
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Artisan</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <span className="font-bold text-brand-navy">AC Installation</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">Uche Okoro</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">May 25, 2026</td>
                    <td className="px-6 py-4 font-bold text-brand-navy">₦ 35,000</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-50 text-brand-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Completed</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        </div>
                        <span className="font-bold text-brand-navy">Painting (3 rooms)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">Chidi Nwosu</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">May 18, 2026</td>
                    <td className="px-6 py-4 font-bold text-brand-navy">₦ 45,000</td>
                    <td className="px-6 py-4">
                      <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Reviewed</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 text-brand-green flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                        </div>
                        <span className="font-bold text-brand-navy">Deep Cleaning</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">Amina Bello</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">May 10, 2026</td>
                    <td className="px-6 py-4 font-bold text-brand-navy">₦ 20,000</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-50 text-brand-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Completed</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <span className="font-bold text-brand-navy">Generator Repair</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">Eze Kingsley</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">May 2, 2026</td>
                    <td className="px-6 py-4 font-bold text-brand-navy">₦ 50,000</td>
                    <td className="px-6 py-4">
                      <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Reviewed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
