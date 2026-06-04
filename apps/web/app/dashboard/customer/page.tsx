import { DashboardNav } from '../../../components/DashboardNav';
import { DashboardWelcome } from '../../../components/DashboardWelcome';
import { CustomerBookingsPanel } from '../../../components/BookingsPanel';

export default function CustomerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-[80px] pointer-events-none"></div>

      <DashboardNav variant="customer" />

      <div className="max-w-6xl mx-auto p-6 md:p-10 relative z-10">
        <DashboardWelcome subtitle="Here is an overview of your active projects and history." />
        <CustomerBookingsPanel />
      </div>
    </div>
  );
}
