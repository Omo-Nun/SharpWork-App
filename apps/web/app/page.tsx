import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Navbar with Glassmorphism */}
      <header className="fixed w-full top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-black text-brand-navy tracking-tighter flex items-center gap-2">
            <span className="bg-brand-green text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-brand-green/30">S</span>
            Sharp<span className="text-brand-green">Work</span>
          </div>
          <nav className="space-x-6 flex items-center">
            <Link href="/services" className="font-medium text-gray-600 hover:text-brand-green transition-colors hidden md:block">Services</Link>
            <Link href="/search" className="font-medium text-gray-600 hover:text-brand-green transition-colors hidden md:block">Find Artisans</Link>
            <div className="h-6 w-px bg-gray-200 hidden md:block mx-2" />
            <Link href="/auth/login" className="font-medium text-gray-700 hover:text-brand-green transition-colors">Log In</Link>
            <Link href="/auth/register" className="bg-brand-navy text-white px-6 py-2.5 rounded-full font-bold hover:bg-gray-800 transition-all hover:shadow-lg transform hover:-translate-y-0.5">Sign Up</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-brand-green/10 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[#0D2B5E]/5 blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green/10 text-brand-green font-bold text-sm mb-4 border border-brand-green/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
              </span>
              Trusted by 10,000+ users
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-brand-navy leading-[1.1] tracking-tight">
              Expert Artisans,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-400">Zero Hassle.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Connect with verified local professionals for plumbing, electrical, carpentry, and home repairs. Fast matching, secure escrow payments, and guaranteed quality.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/services"
                className="w-full sm:w-auto bg-brand-green text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-600 transition-all hover:shadow-xl hover:shadow-brand-green/30 transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Find an Artisan <span className="text-xl">→</span>
              </Link>
              <Link
                href="/auth/register"
                className="w-full sm:w-auto bg-white text-brand-navy border-2 border-gray-100 px-8 py-4 rounded-full font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center"
              >
                Become an Artisan
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-8 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-brand-green">✓</span> Verified IDs
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-green">✓</span> Secure Escrow
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-green">✓</span> Quality Guarantee
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block h-[600px] w-full z-10">
            {/* Hero Image / Mockup Composition */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-br from-brand-green/20 to-brand-navy/5 rounded-[3rem] border border-white/50 shadow-2xl backdrop-blur-3xl overflow-hidden p-6 transform rotate-3 hover:rotate-0 transition-transform duration-700">
              <div className="bg-white/80 backdrop-blur-md w-full h-full rounded-2xl border border-white p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-black text-2xl text-brand-navy">Nearby Artisans</h3>
                    <p className="text-sm text-gray-500">Available right now</p>
                  </div>
                  <div className="h-10 w-10 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green">📍</div>
                </div>

                <div className="space-y-4 flex-1">
                  {[
                    { name: 'Oluwaseun A.', skill: 'Expert Plumber', rating: 4.9, jobs: 124, distance: 2.1 },
                    { name: 'Chinedu O.', skill: 'Master Electrician', rating: 4.8, jobs: 89, distance: 3.4 },
                    { name: 'Aisha I.', skill: 'Home Cleaning', rating: 5.0, jobs: 210, distance: 1.2 },
                  ].map((mock, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                      <div className="h-12 w-12 rounded-full bg-brand-navy/10 flex items-center justify-center font-bold text-brand-navy text-lg">
                        {mock.name[0]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{mock.name}</h4>
                        <p className="text-xs text-gray-500">{mock.skill} • {mock.distance}km away</p>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-500 text-sm font-bold">★ {mock.rating}</div>
                        <div className="text-xs text-gray-400">{mock.jobs} jobs</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -left-8 top-1/4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-4 animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="bg-green-100 p-2 rounded-full text-green-600 text-xl">🛡️</div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Escrow Protected</p>
                <p className="font-bold text-brand-navy">100% Safe Payments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-24 relative z-20 shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-brand-navy mb-4">How SharpWork Protects You</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">We've built trust into every step of the process so you can hire with confidence.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group">
              <div className="w-16 h-16 bg-brand-navy text-white rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                1
              </div>
              <h3 className="text-2xl font-bold text-brand-navy mb-3">Verified Artisans</h3>
              <p className="text-gray-600 leading-relaxed">Every professional undergoes a strict identity check (NIN/BVN), background screening, and skills assessment before joining.</p>
            </div>
            
            <div className="bg-brand-green/5 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-brand-green/20 group">
              <div className="w-16 h-16 bg-brand-green text-white rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold shadow-lg shadow-brand-green/30 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                2
              </div>
              <h3 className="text-2xl font-bold text-brand-navy mb-3">Secure Escrow</h3>
              <p className="text-gray-600 leading-relaxed">Your payment is held safely by Paystack. The artisan only gets paid after you confirm the job is completed to your satisfaction.</p>
            </div>
            
            <div className="bg-gray-50 rounded-3xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group">
              <div className="w-16 h-16 bg-brand-navy text-white rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                3
              </div>
              <h3 className="text-2xl font-bold text-brand-navy mb-3">Instant Location Matches</h3>
              <p className="text-gray-600 leading-relaxed">Our advanced spatial algorithm finds the best verified artisans closest to you, reducing wait times and travel costs.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer CTA */}
      <section className="bg-brand-navy py-20 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to get that fixed?</h2>
          <p className="text-xl text-blue-200 mb-10">Join thousands of satisfied customers who found their trusted artisans on SharpWork.</p>
          <Link
            href="/services"
            className="inline-block bg-brand-green text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-emerald-400 transition-all hover:shadow-xl hover:shadow-brand-green/20 transform hover:-translate-y-1"
          >
            Start Browsing Now
          </Link>
        </div>
      </section>
    </main>
  );
}
