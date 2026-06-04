import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { ConditionalAuth } from "../components/ConditionalAuth";
import { QueryProvider } from "../providers/QueryProvider";
import "./globals.css";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'SharpWork — Find Reliable Artisans Fast',
    template: '%s | SharpWork',
  },
  description:
    'Connect with verified artisans in Nigeria for plumbing, electrical, cleaning, and home repairs. Secure escrow payments until the job is done right.',
  keywords: ['artisans', 'home repair', 'plumbing', 'Nigeria', 'escrow', 'SharpWork'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3002'),
  openGraph: {
    title: 'SharpWork — Find Reliable Artisans Fast',
    description: 'Verified professionals near you with secure escrow payments.',
    type: 'website',
    locale: 'en_NG',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#007A52',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow">
          Skip to main content
        </a>
        <QueryProvider>
          <ConditionalAuth>{children}</ConditionalAuth>
        </QueryProvider>
      </body>
    </html>
  );
}
