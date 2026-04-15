import { createContext, useEffect, useState, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

type AuthUser = {
  sub: string;
  role: string;
  exp: number;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (token: string, navigateTo?: string) => void;
  logout: () => void;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      const userData = parseJwt(token);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = (token: string, navigateTo?: string) => {
    Cookies.set('token', token);
    const userData = parseJwt(token);
    setUser(userData);
    const dest =
      navigateTo && navigateTo.startsWith('/') && !navigateTo.startsWith('//')
        ? navigateTo
        : '/dashboard';
    navigate(dest);
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

function parseJwt(token: string): AuthUser {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));
  return JSON.parse(jsonPayload) as AuthUser;
}
