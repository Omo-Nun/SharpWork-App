import Link from 'next/link';
import { DashboardNav } from '../../../../components/DashboardNav';

export default function CustomerMessagesPage() {
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <DashboardNav variant="customer" />

      <div className="max-w-4xl mx-auto p-6 md:p-10 relative z-10">
        <h1 className="text-3xl font-black text-brand-navy mb-2">Your Messages</h1>
        <p className="text-gray-500 mb-8">View and manage your conversations with artisans.</p>

        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-brand-green" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-brand-navy mb-2">No active conversations</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            When you book a service or contact an artisan, your conversations will appear here.
          </p>
          <Link 
            href="/services" 
            className="inline-flex items-center justify-center bg-brand-green text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-brand-green/30"
          >
            Find an Artisan
          </Link>
        </div>
      </div>
    </div>
  );
}
