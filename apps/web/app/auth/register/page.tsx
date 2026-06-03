import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6 py-12">
      <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 rounded-bl-full -z-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-orange/10 rounded-tr-full -z-10 blur-xl"></div>

        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-brand-green tracking-tighter hover:opacity-80 transition-opacity">
            SharpWork
          </Link>
          <h1 className="text-2xl font-bold mt-6 text-brand-navy">Create an Account</h1>
          <p className="text-gray-500 mt-2">Join the ultimate artisan marketplace</p>
        </div>

        <div className="flex gap-4 mb-8">
          <button className="flex-1 py-3 px-4 rounded-xl border-2 border-brand-green bg-brand-green/5 text-brand-green font-bold transition-all">
            I am a Customer
          </button>
          <button className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-gray-300 font-bold transition-all">
            I am an Artisan
          </button>
        </div>

        <form className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                type="text" 
                placeholder="John"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                type="text" 
                placeholder="Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              placeholder="+234 800 000 0000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-brand-green text-white py-3.5 rounded-xl font-bold text-lg hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 mt-4"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-green font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}
