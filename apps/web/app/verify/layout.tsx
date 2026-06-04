import { RequireAuth } from '../../components/RequireAuth';

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={['ARTISAN']}>{children}</RequireAuth>;
}
