import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute = () => {
  const { user, loading } = useAuth();

  // Si aún estamos cargando el estado, no hacer nada (esperar)
  if (loading) {
    return <div>Loading...</div>; // O puedes poner un spinner o algo similar
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado, mostrar las rutas protegidas
  return <Outlet />;
};
