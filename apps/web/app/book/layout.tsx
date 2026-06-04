import { RequireAuth } from '../../components/RequireAuth';

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={['CUSTOMER']}>{children}</RequireAuth>;
}
