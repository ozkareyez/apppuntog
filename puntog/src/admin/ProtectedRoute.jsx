import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";

// 🔐 Configuración
const SECRET_KEY =
  import.meta.env.VITE_APP_SECRET_KEY || "clave-temporal-segura-2024";
const ENCRYPTION_KEY =
  import.meta.env.VITE_APP_ENCRYPTION_KEY || "clave-encripcion-32-caracteres";
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://gleaming-motivation-production-4018.up.railway.app/";
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000;

// 🔓 Función para descifrar
const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
};

// 🔐 Verificar token con API
const verifyTokenWithAPI = async (token) => {
  try {
    const response = await fetch(`${API_URL}auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
};

export default function ProtectedRoute({ children, requiredRole = null }) {
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsChecking(true);

        // 🔐 Obtener sesión encriptada
        const encryptedSession = localStorage.getItem("admin_session");

        if (!encryptedSession) {
          setIsValid(false);
          setIsChecking(false);
          return;
        }

        // 🔓 Descifrar sesión
        const sessionData = decryptData(encryptedSession);

        if (!sessionData) {
          console.warn("Sesión inválida o corrupta");
          logout();
          setIsValid(false);
          setIsChecking(false);
          return;
        }

        // ⏳ Verificar expiración
        if (Date.now() > sessionData.expiresAt) {
          console.log("Sesión expirada");
          logout();
          setIsValid(false);
          setIsChecking(false);
          return;
        }

        // 🌐 Si hay token de API, verificarlo
        if (sessionData.apiToken && sessionData.apiMode) {
          const apiValid = await verifyTokenWithAPI(sessionData.apiToken);
          if (!apiValid) {
            console.warn("Token API inválido");
            logout();
            setIsValid(false);
            setIsChecking(false);
            return;
          }
        }

        // 👮 Verificar rol si es requerido
        if (requiredRole && sessionData.role !== requiredRole) {
          console.warn(
            `Acceso denegado: ${sessionData.role} no puede acceder a ${requiredRole}`,
          );
          setIsValid(false);
          setIsChecking(false);
          return;
        }

        // ✅ Todas las verificaciones pasaron
        setSessionInfo(sessionData);
        setIsValid(true);
        setIsChecking(false);

        // 🔄 Renovar sesión si queda menos de 1 hora
        const timeLeft = sessionData.expiresAt - Date.now();
        if (timeLeft < 60 * 60 * 1000) {
          renewSession(sessionData);
        }
      } catch (error) {
        console.error("Error en verificación:", error);
        logout();
        setIsValid(false);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [requiredRole, location.pathname]);

  // 🔄 Renovar sesión
  const renewSession = async (sessionData) => {
    try {
      const newSessionData = {
        ...sessionData,
        expiresAt: Date.now() + SESSION_TIMEOUT,
        renewedAt: Date.now(),
      };

      const encryptedSession = CryptoJS.AES.encrypt(
        JSON.stringify(newSessionData),
        ENCRYPTION_KEY,
      ).toString();

      localStorage.setItem("admin_session", encryptedSession);
      console.log("✅ Sesión renovada");
    } catch (error) {
      console.error("Error renovando sesión:", error);
    }
  };

  // 🚪 Logout seguro
  const logout = () => {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("session_start");
    sessionStorage.clear();
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="relative mx-auto mb-6">
            <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-red-600/20 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="text-gray-300 mb-2">Verificando seguridad...</p>
          <p className="text-gray-500 text-sm">
            {sessionInfo?.apiMode
              ? "Validando con API remota"
              : "Modo local seguro"}
          </p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    const redirectPath = `/admin/login?redirect=${encodeURIComponent(location.pathname)}&reason=session_expired`;
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return children;
}

// // ProtectedRoute.jsx mejorado
// import { useEffect, useState } from "react";
// import { Navigate, useLocation } from "react-router-dom";

// export default function ProtectedRoute({ children, requiredRole = null }) {
//   const [isValid, setIsValid] = useState(false);
//   const [isChecking, setIsChecking] = useState(true);
//   const location = useLocation();

//   useEffect(() => {
//     const checkAuth = () => {
//       try {
//         // Verificar autenticación básica
//         const isAuth = localStorage.getItem("admin_auth") === "yes";

//         if (!isAuth) {
//           setIsValid(false);
//           setIsChecking(false);
//           return;
//         }

//         // Verificar tiempo de sesión (opcional)
//         const lastLogin = localStorage.getItem("last_login");
//         if (lastLogin) {
//           const timeDiff = Date.now() - parseInt(lastLogin);
//           // Si han pasado más de 8 horas, cerrar sesión automáticamente
//           if (timeDiff > 8 * 60 * 60 * 1000) {
//             localStorage.removeItem("admin_auth");
//             localStorage.removeItem("admin_user");
//             localStorage.removeItem("last_login");
//             setIsValid(false);
//             setIsChecking(false);
//             return;
//           }
//         }

//         // Verificar rol si se requiere
//         if (requiredRole) {
//           const userData = localStorage.getItem("admin_user");
//           if (userData) {
//             try {
//               const user = JSON.parse(userData);
//               if (user.role !== requiredRole) {
//                 setIsValid(false);
//                 setIsChecking(false);
//                 return;
//               }
//             } catch {
//               // Si hay error parseando, no es válido
//               setIsValid(false);
//               setIsChecking(false);
//               return;
//             }
//           }
//         }

//         setIsValid(true);
//         setIsChecking(false);
//       } catch (error) {
//         console.error("Error verificando autenticación:", error);
//         setIsValid(false);
//         setIsChecking(false);
//       }
//     };

//     checkAuth();
//   }, [requiredRole, location.pathname]);

//   if (isChecking) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
//           <p className="text-gray-300">Verificando acceso...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isValid) {
//     // Redirigir al login guardando la ruta a la que intentaba acceder
//     const redirectPath =
//       location.pathname !== "/admin/login"
//         ? `/admin/login?redirect=${encodeURIComponent(location.pathname + location.search)}`
//         : "/admin/login";

//     return <Navigate to={redirectPath} replace />;
//   }

//   return children;
// }

// // import { Navigate } from "react-router-dom";

// // export default function ProtectedRoute({ children }) {
// //   const isAuth = localStorage.getItem("admin_auth") === "yes";

// //   if (!isAuth) {
// //     return <Navigate to="/admin/login" replace />;
// //   }

// //   return children;
// // }
