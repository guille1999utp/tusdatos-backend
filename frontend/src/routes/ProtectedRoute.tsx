import { Navigate, Outlet } from "react-router-dom";
import { useAuth, useSession } from "@clerk/clerk-react";
import { useEffect } from "react";
import Cookies from "js-cookie";

const ProtectedRoute = () => {
  const { session } = useSession();
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {

    const fetchToken = async () => {
      if (session) {
        Cookies.remove("token_access");
        try {
          const fetchedToken = await getToken();
          if (fetchedToken) {
            Cookies.set("token_access", fetchedToken);
          }
        } catch (error) {
          console.error("Error fetching token:", error);
        }
      }
    };

    if (isSignedIn) {
      fetchToken(); // Llamar inmediatamente al cargar
      setInterval(fetchToken, 4900); // Actualizar cada 5 segundos
    }

  }, [session, isSignedIn, getToken]);

  if (isSignedIn === undefined) {
    return <Outlet />;
  }

  return isSignedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
