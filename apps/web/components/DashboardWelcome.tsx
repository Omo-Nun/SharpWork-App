'use client';

import { getUserDisplayName, useAuth } from '../context/AuthContext';

export function DashboardWelcome({ subtitle }: { subtitle: string }) {
  const { user } = useAuth();
  const firstName = getUserDisplayName(user);

  return (
    <div className="mb-10">
      <h1 className="text-3xl md:text-4xl font-black text-brand-navy mb-2">
        Welcome back, {firstName}!
      </h1>
      <p className="text-gray-500 text-lg">{subtitle}</p>
    </div>
  );
}
