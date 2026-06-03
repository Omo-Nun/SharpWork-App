import Link from 'next/link';

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 p-6 relative overflow-hidden">
      {/* Admin specific background styling */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-navy/50 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-orange/20 rounded-full blur-[100px] -z-10"></div>

      <div className="w-full max-w-md bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <div className="text-3xl font-black text-white tracking-tighter mb-2">
            SharpWork <span className="text-brand-orange">Admin</span>
          </div>
          <p className="text-slate-400">Secure Portal Login</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="admin@sharpwork.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all placeholder:text-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <label className="block text-sm font-bold text-brand-orange mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Google Authenticator TOTP
            </label>
            <input 
              type="text" 
              placeholder="000 000"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all placeholder:text-slate-600 text-center tracking-[0.5em] text-lg font-mono"
            />
            <p className="text-xs text-slate-500 mt-2 text-center">Required for all admin access.</p>
          </div>

          <button 
            type="submit" 
            className="w-full bg-brand-orange text-white py-3.5 rounded-xl font-bold text-lg hover:bg-orange-600 hover:shadow-lg hover:shadow-brand-orange/20 hover:-translate-y-0.5 transition-all active:scale-95 mt-4"
          >
            Authenticate
          </button>
        </form>
      </div>
    </main>
  );
}
