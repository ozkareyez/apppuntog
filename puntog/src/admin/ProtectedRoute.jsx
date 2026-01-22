import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const tokenData = localStorage.getItem("admin_token");

        if (!tokenData) {
          setIsValid(false);
          setIsChecking(false);
          return;
        }

        const parsedToken = JSON.parse(tokenData);
        const now = Date.now();

        // Verificar expiración
        if (now > parsedToken.expires) {
          localStorage.removeItem("admin_token");
          setIsValid(false);
          setIsChecking(false);
          return;
        }

        // Verificar rol si se requiere
        if (requiredRole && parsedToken.role !== requiredRole) {
          setIsValid(false);
          setIsChecking(false);
          return;
        }

        setIsValid(true);
        setIsChecking(false);
      } catch (error) {
        localStorage.removeItem("admin_token");
        setIsValid(false);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [requiredRole, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    // Redirigir al login con la ruta original
    const redirectTo =
      location.pathname !== "/admin/login"
        ? `/admin/login?redirect=${encodeURIComponent(location.pathname)}`
        : "/admin/login";

    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

// import { Navigate } from "react-router-dom";

// export default function ProtectedRoute({ children }) {
//   const isAuth = localStorage.getItem("admin_auth") === "yes";

//   if (!isAuth) {
//     return <Navigate to="/admin/login" replace />;
//   }

//   return children;
// }
