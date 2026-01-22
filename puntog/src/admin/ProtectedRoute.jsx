// ProtectedRoute.jsx mejorado
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Verificar autenticación básica
        const isAuth = localStorage.getItem("admin_auth") === "yes";

        if (!isAuth) {
          setIsValid(false);
          setIsChecking(false);
          return;
        }

        // Verificar tiempo de sesión (opcional)
        const lastLogin = localStorage.getItem("last_login");
        if (lastLogin) {
          const timeDiff = Date.now() - parseInt(lastLogin);
          // Si han pasado más de 8 horas, cerrar sesión automáticamente
          if (timeDiff > 8 * 60 * 60 * 1000) {
            localStorage.removeItem("admin_auth");
            localStorage.removeItem("admin_user");
            localStorage.removeItem("last_login");
            setIsValid(false);
            setIsChecking(false);
            return;
          }
        }

        // Verificar rol si se requiere
        if (requiredRole) {
          const userData = localStorage.getItem("admin_user");
          if (userData) {
            try {
              const user = JSON.parse(userData);
              if (user.role !== requiredRole) {
                setIsValid(false);
                setIsChecking(false);
                return;
              }
            } catch {
              // Si hay error parseando, no es válido
              setIsValid(false);
              setIsChecking(false);
              return;
            }
          }
        }

        setIsValid(true);
        setIsChecking(false);
      } catch (error) {
        console.error("Error verificando autenticación:", error);
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
    // Redirigir al login guardando la ruta a la que intentaba acceder
    const redirectPath =
      location.pathname !== "/admin/login"
        ? `/admin/login?redirect=${encodeURIComponent(location.pathname + location.search)}`
        : "/admin/login";

    return <Navigate to={redirectPath} replace />;
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
