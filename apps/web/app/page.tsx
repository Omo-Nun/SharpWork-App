import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '../components/Logo';

export default function LandingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Navbar with Glassmorphism */}
      <header className="fixed w-full top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
          <Link href="/">
            <Logo height={32} />
          </Link>

          {/* Search Bar */}
          <form action="/search" method="GET" className="hidden md:flex items-center flex-1 max-w-2xl mx-4 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex items-center pl-4 pr-3 py-2 bg-gray-50/80 border-r border-gray-200 text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <span className="font-semibold text-sm whitespace-nowrap">I need a &ndash;</span>
            </div>
            <input 
              type="text" 
              name="q"
              placeholder="Enter a service (e.g., Plumber, Carpenter)" 
              className="flex-1 px-4 py-2.5 text-sm text-gray-800 bg-transparent focus:outline-none w-full"
            />
            <button type="submit" className="bg-brand-green hover:bg-emerald-500 text-white px-6 py-2.5 font-bold text-sm transition-colors h-full whitespace-nowrap">
              Search
            </button>
          </form>

          <nav className="space-x-4 lg:space-x-6 flex items-center whitespace-nowrap">
            <Link href="/services" className="font-medium text-gray-600 hover:text-brand-green transition-colors hidden lg:block">Services</Link>
            <Link href="/search" className="font-medium text-gray-600 hover:text-brand-green transition-colors hidden lg:block">Find Artisans</Link>
            <div className="h-6 w-px bg-gray-200 hidden lg:block mx-1" />
            <Link href="/auth/login" className="font-medium text-gray-700 hover:text-brand-green transition-colors hidden sm:block">Log In</Link>
            <Link href="/auth/register" className="bg-brand-navy text-white px-5 lg:px-6 py-2 lg:py-2.5 rounded-full font-bold hover:bg-gray-800 transition-all hover:shadow-lg transform hover:-translate-y-0.5 text-sm lg:text-base">Sign Up</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Premium Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-20">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-[0.03] grayscale mix-blend-multiply"
            poster="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop"
          >
            <source src="https://cdn.pixabay.com/video/2021/08/17/85265-589578619_large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/90 to-gray-50/90" />
        </div>

        {/* Background decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 mix-blend-multiply">
          <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#1ECE25]/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#0D2B5E]/5 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
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
            
            <h1 className="text-5xl sm:text-6xl lg:text-[5rem] font-black text-brand-navy leading-[1.05] tracking-tight">
              Expert Artisans,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1ECE25] to-brand-green">Zero Hassle.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Connect with verified local professionals for plumbing, electrical, carpentry, and home repairs. Fast matching, secure escrow payments, and guaranteed quality.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6">
              <Link
                href="/search"
                className="w-full sm:w-auto bg-[#1ECE25] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#1bb822] transition-all hover:shadow-[0_8px_30px_rgb(30,206,37,0.3)] transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
              >
                Find an Artisan <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/auth/register"
                className="w-full sm:w-auto bg-white/50 backdrop-blur-sm text-brand-navy border border-gray-200 px-8 py-4 rounded-full font-bold text-lg hover:border-gray-300 hover:bg-white hover:shadow-lg transition-all flex items-center justify-center"
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

          <div className="relative hidden lg:block h-[600px] w-full z-10 perspective-[2000px]">
            {/* Hero Image / Mockup Composition */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[90%] h-[95%] bg-gradient-to-br from-[#1ECE25]/20 to-brand-navy/5 rounded-[2.5rem] border border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] backdrop-blur-3xl overflow-hidden p-6 transform rotate-[4deg] hover:rotate-[2deg] hover:scale-[1.02] transition-all duration-700 ease-out">
              <div className="bg-white/90 backdrop-blur-xl w-full h-full rounded-[1.5rem] border border-white/80 p-8 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-black text-2xl text-brand-navy tracking-tight">Nearby Artisans</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Available right now</p>
                  </div>
                  <div className="h-12 w-12 bg-[#1ECE25]/10 rounded-full flex items-center justify-center text-[#1ECE25] shadow-inner shadow-white/50 text-xl">📍</div>
                </div>

                <div className="space-y-4 flex-1">
                  {[
                    { name: 'Oluwaseun A.', skill: 'Expert Plumber', rating: 4.9, jobs: 124, distance: 2.1 },
                    { name: 'Chinedu O.', skill: 'Master Electrician', rating: 4.8, jobs: 89, distance: 3.4 },
                    { name: 'Aisha I.', skill: 'Home Cleaning', rating: 5.0, jobs: 210, distance: 1.2 },
                  ].map((mock, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                      <div className="h-12 w-12 rounded-full bg-brand-navy/5 flex items-center justify-center font-bold text-brand-navy text-lg border border-brand-navy/10">
                        {mock.name[0]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 tracking-tight">{mock.name}</h4>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{mock.skill} • {mock.distance}km away</p>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-500 text-sm font-black tracking-tighter">★ {mock.rating}</div>
                        <div className="text-xs text-gray-400 font-medium mt-0.5">{mock.jobs} jobs</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -left-8 top-1/4 bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white flex items-center gap-4 animate-bounce hover:scale-105 transition-transform" style={{ animationDuration: '4s' }}>
              <div className="bg-[#1ECE25]/10 p-3 rounded-full text-[#1ECE25] text-xl">🛡️</div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escrow Protected</p>
                <p className="font-bold text-brand-navy mt-0.5">100% Safe Payments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-32 relative z-20 shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.03)] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-brand-navy tracking-tight mb-6">How SharpWork Protects You</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl font-medium">We've built trust into every step of the process so you can hire with absolute confidence.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-[2rem] p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-500 border border-gray-100 hover:border-gray-200 group transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-brand-navy text-white rounded-[1rem] flex items-center justify-center mb-8 text-2xl font-black shadow-[0_10px_20px_-10px_rgba(13,43,94,0.5)] transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                1
              </div>
              <h3 className="text-2xl font-black tracking-tight text-brand-navy mb-4">Verified Artisans</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Every professional undergoes a strict identity check (NIN/BVN), background screening, and skills assessment before joining.</p>
            </div>
            
            <div className="bg-gradient-to-br from-white to-[#1ECE25]/5 rounded-[2rem] p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(30,206,37,0.15)] transition-all duration-500 border border-gray-100 hover:border-[#1ECE25]/30 group transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-[#1ECE25] text-white rounded-[1rem] flex items-center justify-center mb-8 text-2xl font-black shadow-[0_10px_20px_-10px_rgba(30,206,37,0.6)] transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                2
              </div>
              <h3 className="text-2xl font-black tracking-tight text-brand-navy mb-4">Secure Escrow</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Your payment is held safely by Paystack. The artisan only gets paid after you confirm the job is completed to your satisfaction.</p>
            </div>
            
            <div className="bg-white rounded-[2rem] p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-500 border border-gray-100 hover:border-gray-200 group transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-brand-navy text-white rounded-[1rem] flex items-center justify-center mb-8 text-2xl font-black shadow-[0_10px_20px_-10px_rgba(13,43,94,0.5)] transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                3
              </div>
              <h3 className="text-2xl font-black tracking-tight text-brand-navy mb-4">Instant Location Matches</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Our advanced spatial algorithm finds the best verified artisans closest to you, reducing wait times and travel costs.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer CTA */}
      <section className="bg-brand-navy py-32 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#1ECE25]/20 blur-[120px]" />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">Ready to get that fixed?</h2>
          <p className="text-xl text-blue-200 mb-12 font-medium">Join thousands of satisfied customers who found their trusted artisans on SharpWork.</p>
          <Link
            href="/search"
            className="inline-block bg-[#1ECE25] text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-[#1bb822] transition-all shadow-[0_8px_30px_rgb(30,206,37,0.3)] hover:shadow-[0_15px_40px_rgb(30,206,37,0.4)] transform hover:-translate-y-1"
          >
            Start Browsing Now
          </Link>
        </div>
      </section>
    </main>
  );
}
