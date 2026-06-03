export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-brand-green">
          <h3 className="text-gray-500 font-medium mb-1">Total Users</h3>
          <p className="text-4xl font-black">1,247</p>
          <p className="text-sm text-brand-green mt-1">+12% this week</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 font-medium mb-1">Active Bookings</h3>
          <p className="text-4xl font-black">89</p>
          <p className="text-sm text-gray-500 mt-1">23 pending review</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 font-medium mb-1">Open Disputes</h3>
          <p className="text-4xl font-black text-red-600">7</p>
          <p className="text-sm text-red-500 mt-1">3 escalated</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 font-medium mb-1">Escrow Held</h3>
          <p className="text-4xl font-black">₦ 2.1M</p>
          <p className="text-sm text-gray-500 mt-1">Across 89 bookings</p>
        </div>
      </div>

      {/* Recent Activity */}
      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <p className="font-bold">Dispute #D-0041 raised</p>
            <p className="text-sm text-gray-500">Customer reported incomplete plumbing job</p>
          </div>
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">OPEN</span>
        </div>
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <p className="font-bold">Artisan Jane Smith verified</p>
            <p className="text-sm text-gray-500">NIN + Face match passed (confidence: 94%)</p>
          </div>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">VERIFIED</span>
        </div>
        <div className="p-4 flex justify-between items-center">
          <div>
            <p className="font-bold">Escrow released for Booking #B-1087</p>
            <p className="text-sm text-gray-500">₦ 25,000 released to artisan</p>
          </div>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">RELEASED</span>
        </div>
      </div>
    </div>
  );
}
