import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';

function safeInternalPath(redirect: string | null): string | null {
  if (!redirect) return null;
  const t = redirect.trim();
  if (!t.startsWith('/') || t.startsWith('//')) return null;
  return t;
}

export const PublicRoute = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = safeInternalPath(searchParams.get('redirect'));

  if (user) {
    return <Navigate to={redirect ?? '/dashboard'} replace />;
  }
  return <Outlet />;
};
