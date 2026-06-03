import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-brand-white">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-gray-200">
        <div className="text-2xl font-black text-brand-green tracking-tighter">SharpWork</div>
        <nav className="space-x-4">
          <Link href="/auth/login" className="font-medium hover:text-brand-green transition-colors">Log In</Link>
          <Link href="/auth/register" className="bg-brand-black text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-colors">Sign Up</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center pt-24 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
          Find Reliable Artisans <span className="text-brand-green">Fast.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl">
          Connect with verified professionals in your area for home repairs, plumbing, electrical work, and more. 
          Your payment is held securely in escrow until the job is done right.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-2xl bg-white p-3 rounded-full shadow-lg border border-gray-100 flex shadow-brand-green/10">
          <input 
            type="text" 
            placeholder="What service do you need? (e.g. Plumber, Electrician)" 
            className="flex-1 outline-none px-6 text-lg bg-transparent"
          />
          <button className="bg-brand-green text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-green-600 transition-transform hover:scale-105 active:scale-95 shadow-md">
            Search
          </button>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-gray-50 py-16 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-green font-bold text-2xl">1</div>
            <h3 className="text-xl font-bold mb-2">Verified Professionals</h3>
            <p className="text-gray-600">Every artisan passes a strict 4-step identity and background verification.</p>
          </div>
          <div>
            <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-green font-bold text-2xl">2</div>
            <h3 className="text-xl font-bold mb-2">Secure Escrow</h3>
            <p className="text-gray-600">Your money is held safely and only released when you approve the completed work.</p>
          </div>
          <div>
            <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-green font-bold text-2xl">3</div>
            <h3 className="text-xl font-bold mb-2">Instant Location Matching</h3>
            <p className="text-gray-600">Find help nearby instantly using our optimized spatial search radius.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
