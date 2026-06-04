import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { PortalShell } from '../components/PortalShell';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'SharpWork Admin',
  description: 'SharpWork Administration Portal — Manage users, disputes, and platform analytics.',
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <PortalShell>{children}</PortalShell>
      </body>
    </html>
  );
}
