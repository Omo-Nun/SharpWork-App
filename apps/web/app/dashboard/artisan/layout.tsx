import { RequireAuth } from '../../../components/RequireAuth';

export default function ArtisanDashboardLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={['ARTISAN']}>{children}</RequireAuth>;
}
