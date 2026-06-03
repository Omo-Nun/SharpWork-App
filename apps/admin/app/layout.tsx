import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "SharpWork Admin",
  description: "SharpWork Administration Portal — Manage users, disputes, and platform analytics.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-brand-black text-white p-6 flex flex-col">
            <div className="text-2xl font-black text-brand-green mb-10 tracking-tighter">SharpWork</div>
            <nav className="space-y-2 flex-1">
              <a href="/admin" className="block px-4 py-2.5 rounded-lg hover:bg-white/10 font-medium transition-colors">Dashboard</a>
              <a href="/admin/disputes" className="block px-4 py-2.5 rounded-lg hover:bg-white/10 font-medium transition-colors">Dispute Centre</a>
              <a href="/admin/users" className="block px-4 py-2.5 rounded-lg hover:bg-white/10 font-medium transition-colors">Users</a>
              <a href="/admin/bookings" className="block px-4 py-2.5 rounded-lg hover:bg-white/10 font-medium transition-colors">Bookings</a>
              <a href="/admin/settings" className="block px-4 py-2.5 rounded-lg hover:bg-white/10 font-medium transition-colors">Settings</a>
            </nav>
            <div className="border-t border-white/20 pt-4 mt-4">
              <p className="text-sm text-gray-400">Admin Panel v1.0</p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
