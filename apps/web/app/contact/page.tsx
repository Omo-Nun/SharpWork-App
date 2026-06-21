import { Mail, MapPin } from 'lucide-react';

const FacebookIcon = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            We'd love to hear from you. Get in touch with the SharpWork team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Contact Information */}
          <div className="bg-[#007A52] p-10 md:p-12 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
              <p className="text-[#007A52] text-green-100 mb-12">
                Fill up the form and our team will get back to you within 24 hours.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Mail className="text-green-200" size={24} />
                  <span>sharpwork82@gmail.com</span>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="text-green-200" size={24} />
                  <span>Lagos, Nigeria</span>
                </div>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <a href="https://web.facebook.com/profile.php?id=61590657631058" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <FacebookIcon size={24} />
              </a>
              <a href="https://instagram.com/sharpwork.ng" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <InstagramIcon size={24} />
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-10 md:p-12">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" id="firstName" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#007A52] focus:border-transparent outline-none transition-all" placeholder="John" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" id="lastName" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#007A52] focus:border-transparent outline-none transition-all" placeholder="Doe" />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="email" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#007A52] focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea id="message" rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#007A52] focus:border-transparent outline-none transition-all" placeholder="How can we help you?"></textarea>
              </div>

              <button type="button" className="w-full bg-[#007A52] hover:bg-[#006342] text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-md">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
