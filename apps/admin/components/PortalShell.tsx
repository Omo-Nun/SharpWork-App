'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AdminAuthProvider, useAdminAuth } from '../context/AdminAuthContext';

function Sidebar() {
  const { logout, user } = useAdminAuth();
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `block px-4 py-2.5 rounded-lg font-medium transition-colors ${
      pathname === href ? 'bg-white/15 text-brand-green' : 'hover:bg-white/10'
    }`;

  return (
    <aside className="w-64 bg-brand-black text-white p-6 flex flex-col">
      <div className="text-2xl font-black text-brand-green mb-10 tracking-tighter">SharpWork</div>
      <nav className="space-y-2 flex-1">
        <Link href="/" className={linkClass('/')}>Dashboard</Link>
        <Link href="/categories" className={linkClass('/categories')}>Categories</Link>
        <Link href="/users" className={linkClass('/users')}>Users</Link>
        <Link href="/bookings" className={linkClass('/bookings')}>Escrow Releases</Link>
        <Link href="/audit" className={linkClass('/audit')}>Audit Log</Link>
        <Link href="/disputes" className={linkClass('/disputes')}>Dispute Centre</Link>
        <Link href="/verifications" className={linkClass('/verifications')}>Verification Centre</Link>
        <Link href="/settings" className={linkClass('/settings')}>Settings</Link>
      </nav>
      <div className="border-t border-white/20 pt-4 mt-4">
        <p className="text-sm text-gray-400 truncate">{user?.email}</p>
        <button onClick={logout} className="text-sm text-brand-orange mt-2 hover:underline">
          Sign out
        </button>
      </div>
    </aside>
  );
}

function PortalContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading } = useAdminAuth();

  if (pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading admin portal...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <PortalContent>{children}</PortalContent>
    </AdminAuthProvider>
  );
}
