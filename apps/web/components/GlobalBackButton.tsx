'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function GlobalBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on homepage where going back doesn't make sense (since it's the root)
  if (pathname === '/') return null;

  return (
    <button
      onClick={() => router.back()}
      className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] bg-white text-brand-navy border border-gray-100 p-3.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:scale-105 transition-all group flex items-center justify-center"
      aria-label="Go back"
      title="Go back"
    >
      <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
    </button>
  );
}
