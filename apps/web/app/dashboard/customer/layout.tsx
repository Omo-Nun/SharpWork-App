import { RequireAuth } from '../../../components/RequireAuth';

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={['CUSTOMER']}>{children}</RequireAuth>;
}
