'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { getUserInitials, useAuth } from '../context/AuthContext';
import { Home, Settings, LogOut, MessageSquare, Menu, X, LayoutDashboard } from 'lucide-react';
import { Logo } from './Logo';

interface DashboardNavProps {
  variant: 'customer' | 'artisan';
}

export function DashboardNav({ variant }: DashboardNavProps) {
  const { user, logout } = useAuth();
  const initials = getUserInitials(user);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: `/dashboard/${variant}`, label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: `/dashboard/${variant}/messages`, label: 'Messages', icon: <MessageSquare className="w-5 h-5" /> },
    { href: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 h-16 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo height={24} />
          {variant === 'artisan' && (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-full">Artisan</span>
          )}
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-500 hover:text-brand-navy">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-40 p-4 flex flex-col gap-2 border-b border-gray-100 shadow-xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                  isActive ? 'bg-[#1ECE25]/10 text-[#1ECE25]' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-navy'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            );
          })}
          <hr className="my-2 border-gray-100" />
          <button
            onClick={() => { setMobileMenuOpen(false); logout(); }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all text-left"
          >
            <LogOut className="w-5 h-5" /> Log Out
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-slate-50 border-r border-gray-100 fixed inset-y-0 left-0 z-40">
        <div className="h-20 flex items-center px-8 border-b border-gray-100/50">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={28} />
          </Link>
        </div>
        
        <div className="px-8 py-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-navy/80 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-sm font-black text-brand-navy border-2 border-white">
              {initials}
            </div>
          </div>
          <div>
            <p className="text-sm font-black text-brand-navy tracking-tight">{user?.profile?.firstName || 'User'}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{variant}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all group ${
                  isActive 
                    ? 'bg-white text-brand-navy shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100' 
                    : 'text-gray-500 hover:bg-gray-100/50 hover:text-brand-navy border border-transparent'
                }`}
              >
                <div className={`${isActive ? 'text-[#1ECE25]' : 'text-gray-400 group-hover:text-brand-navy transition-colors'}`}>
                  {link.icon}
                </div>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100/50">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-bold text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" /> 
            Log Out
          </button>
        </div>
      </div>
    </>
  );
}
