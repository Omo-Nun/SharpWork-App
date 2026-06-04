import { RequireAuth } from '../../components/RequireAuth';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={['CUSTOMER', 'ARTISAN']}>{children}</RequireAuth>;
}
