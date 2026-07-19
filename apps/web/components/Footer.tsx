import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Logo } from './Logo';

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

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 md:py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Brand & Intro */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-block"><Logo height={28} textClassName="text-white" /></Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Connect with verified artisans in Nigeria for plumbing, electrical, cleaning, and home repairs. Secure escrow payments until the job is done right.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/about" className="hover:text-white transition-colors duration-200">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors duration-200">Blog</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors duration-200">FAQs</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors duration-200">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors duration-200">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-white">Connect With Us</h3>
            <div className="flex flex-col gap-3">
              <a href="mailto:sharpwork82@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors duration-200">
                <Mail size={18} />
                <span>sharpwork82@gmail.com</span>
              </a>
              <a href="https://web.facebook.com/profile.php?id=61590657631058" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors duration-200">
                <FacebookIcon size={18} />
                <span>Facebook</span>
              </a>
              <a href="https://instagram.com/sharpwork.ng" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors duration-200">
                <InstagramIcon size={18} />
                <span>@sharpwork.ng</span>
              </a>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} SharpWork. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>Made with ❤️ for Nigeria</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
