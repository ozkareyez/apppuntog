import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  Key,
  AlertCircle,
  LogIn,
  Building2,
  Cpu,
  Users,
  Code,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ===== CONFIGURACIÓN PARA PRODUCCIÓN =====
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://gleaming-motivation-production-4018.up.railway.app";

// Usuarios visibles (sin contraseñas, solo para mostrar en UI)
const VISIBLE_USERS = [
  {
    username: "admin",
    role: "Supervisor",
    icon: "👔",
    visible: true,
  },
  {
    username: "ventas",
    role: "Ventas",
    icon: "📊",
    visible: true,
  },
];

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [developerMode, setDeveloperMode] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState({});
  const [backendAvailable, setBackendAvailable] = useState(true);
  const navigate = useNavigate();

  // Verificar si el backend está disponible
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_URL}/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          setBackendAvailable(true);
          console.log("✅ Backend disponible");
        } else {
          setBackendAvailable(false);
          console.warn("⚠️ Backend no responde correctamente");
        }
      } catch {
        setBackendAvailable(false);
        console.error("❌ Error conectando al backend");
      }
    };

    checkBackend();
  }, []);

  // Forzar cierre de sesión al entrar
  useEffect(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("user_session");
    document.title = "Panel Admin | PuntoG";

    // Cargar intentos fallidos del localStorage
    const savedAttempts = localStorage.getItem("login_failed_attempts");
    if (savedAttempts) {
      setFailedAttempts(JSON.parse(savedAttempts));
    }

    // Verificar modo desarrollador
    const isDeveloper =
      localStorage.getItem("developer_mode") === "true" ||
      window.location.search.includes("dev=true");
    setDeveloperMode(isDeveloper);

    // Limpiar timers de bloqueo expirados
    const now = Date.now();
    const newAttempts = { ...failedAttempts };
    let changed = false;

    Object.keys(newAttempts).forEach((username) => {
      const lockKey = `lockout_${username}`;
      const lockTime = localStorage.getItem(lockKey);

      if (lockTime && now > parseInt(lockTime)) {
        delete newAttempts[username];
        localStorage.removeItem(lockKey);
        changed = true;
      }
    });

    if (changed) {
      setFailedAttempts(newAttempts);
      localStorage.setItem(
        "login_failed_attempts",
        JSON.stringify(newAttempts),
      );
    }
  }, []);

  // Efecto para mostrar nivel de seguridad de contraseña
  useEffect(() => {
    if (password.length === 0) {
      setSecurityLevel(0);
    } else if (password.length < 4) {
      setSecurityLevel(1);
    } else if (password.length < 6) {
      setSecurityLevel(2);
    } else if (password.length < 8) {
      setSecurityLevel(3);
    } else {
      setSecurityLevel(4);
    }
  }, [password]);

  // Auto-completar solo usuario al seleccionar (NO la contraseña)
  const handleUserSelect = (userObj) => {
    setSelectedUser(userObj);
    setUser(userObj.username);
    setPassword(""); // Importante: NO auto-completar contraseña
    setError("");
  };

  // Acceso directo para desarrollador (Ctrl+Shift+O)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "O") {
        e.preventDefault();
        setDeveloperMode(true);
        setUser("oscar");
        setPassword(""); // El usuario debe ingresar la contraseña manualmente
        setSelectedUser({
          username: "oscar",
          role: "Desarrollador",
          icon: "👨‍💻",
        });
        localStorage.setItem("developer_mode", "true");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ===== FUNCIÓN DE LOGIN SEGURO =====
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setShake(false);

    // Validación básica
    if (!user.trim() || !password.trim()) {
      setError("Completa todos los campos");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // Verificar intentos fallidos recientes
    const userAttempts = failedAttempts[user] || 0;
    if (userAttempts >= 5) {
      const lockTime = localStorage.getItem(`lockout_${user}`);

      if (lockTime && Date.now() < parseInt(lockTime)) {
        const minutesLeft = Math.ceil(
          (parseInt(lockTime) - Date.now()) / (1000 * 60),
        );
        setError(
          `Cuenta bloqueada. Intenta nuevamente en ${minutesLeft} minuto(s)`,
        );
        setShake(true);
        return;
      } else {
        // Resetear intentos después del tiempo de bloqueo
        const newAttempts = { ...failedAttempts };
        delete newAttempts[user];
        setFailedAttempts(newAttempts);
        localStorage.setItem(
          "login_failed_attempts",
          JSON.stringify(newAttempts),
        );
        localStorage.removeItem(`lockout_${user}`);
      }
    }

    setLoading(true);

    try {
      // === LLAMADA AL BACKEND SEGURO EN PRODUCCIÓN ===
      console.log(`🔐 Conectando a: ${API_URL}/api/auth/login`);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en la autenticación");
      }

      // === LOGIN EXITOSO ===
      if (data.success && data.token) {
        // Guardar token seguro del backend
        const tokenData = {
          token: data.token,
          expires: Date.now() + (data.expiresIn || 3600) * 1000,
          issued: Date.now(),
          user: data.user?.username || user,
          role: data.user?.role || "Usuario",
          icon: data.user?.icon || "👤",
          permissions: data.user?.permissions || [],
        };

        localStorage.setItem("admin_token", JSON.stringify(tokenData));

        // Guardar sesión mínima en sessionStorage
        sessionStorage.setItem(
          "user_session",
          JSON.stringify({
            username: tokenData.user,
            role: tokenData.role,
            loggedInAt: Date.now(),
          }),
        );

        // Limpiar intentos fallidos para este usuario
        const newAttempts = { ...failedAttempts };
        delete newAttempts[user];
        setFailedAttempts(newAttempts);
        localStorage.setItem(
          "login_failed_attempts",
          JSON.stringify(newAttempts),
        );
        localStorage.removeItem(`lockout_${user}`);

        // Registro de acceso
        console.log("✅ Acceso seguro registrado:", {
          user: tokenData.user,
          role: tokenData.role,
          backend: API_URL,
          timestamp: new Date().toISOString(),
        });

        // Animación de éxito antes de redirigir
        setTimeout(() => {
          navigate("/admin/dashboard", {
            replace: true,
            state: {
              from: "secure_login",
              timestamp: Date.now(),
              user: tokenData.user,
              role: tokenData.role,
            },
          });
        }, 300);
      } else {
        throw new Error("Credenciales incorrectas");
      }
    } catch (err) {
      // === MANEJO DE ERRORES ===
      let errorMessage =
        err.message || "Error en el sistema. Intenta más tarde.";

      // Si es error de conexión
      if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("Network")
      ) {
        errorMessage =
          "No se puede conectar al servidor. Verifica tu conexión.";
        setBackendAvailable(false);
      }

      // Registrar intento fallido (solo si no es error de conexión)
      if (!errorMessage.includes("conectar al servidor")) {
        const newAttempts = {
          ...failedAttempts,
          [user]: (failedAttempts[user] || 0) + 1,
        };

        setFailedAttempts(newAttempts);
        localStorage.setItem(
          "login_failed_attempts",
          JSON.stringify(newAttempts),
        );

        // Bloquear después de 5 intentos
        if (newAttempts[user] >= 5) {
          const lockoutTime = Date.now() + 15 * 60 * 1000; // 15 minutos
          localStorage.setItem(`lockout_${user}`, lockoutTime.toString());
          errorMessage =
            "Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.";
        } else if (newAttempts[user] >= 3) {
          errorMessage = `Credenciales incorrectas. ${5 - newAttempts[user]} intento(s) restantes antes de bloqueo.`;
        }
      }

      setError(errorMessage);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  // Efecto de partículas de fondo
  const BackgroundParticles = () => (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-red-500/20 rounded-full"
          initial={{
            x: Math.random() * 100 + "vw",
            y: Math.random() * 100 + "vh",
          }}
          animate={{
            x: Math.random() * 100 + "vw",
            y: Math.random() * 100 + "vh",
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );

  // Filtrar solo usuarios visibles para mostrar
  const visibleUsers = VISIBLE_USERS.filter((user) => user.visible);

  // Información de seguridad
  const userAttempts = failedAttempts[user] || 0;
  const isLocked = userAttempts >= 5;

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-gray-900 via-gray-950 to-black overflow-hidden">
      {/* Fondo con gradiente y efectos */}
      <BackgroundParticles />

      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-red-800/5" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />

      {/* Tarjeta de Login */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-4xl mx-4 flex flex-col lg:flex-row gap-8"
      >
        {/* Panel izquierdo: Selección de usuario */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full lg:w-1/3"
        >
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-2xl blur opacity-30" />

            <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden h-full">
              {/* Header del panel de usuarios */}
              <div className="relative p-6 border-b border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-red-800/5" />
                <div className="relative flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/50">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Usuarios Autorizados
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {backendAvailable
                        ? "Backend disponible"
                        : "⚠️ Verificando conexión..."}
                    </p>
                  </div>
                </div>

                {/* Indicador de seguridad */}
                {user && (
                  <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Intentos fallidos:</span>
                      <span
                        className={`font-semibold ${
                          userAttempts === 0
                            ? "text-green-400"
                            : userAttempts < 3
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {userAttempts} / 5
                      </span>
                    </div>
                    {isLocked && (
                      <p className="text-red-400 text-xs mt-2">
                        ⚠️ Cuenta temporalmente bloqueada
                      </p>
                    )}
                    {!backendAvailable && (
                      <p className="text-amber-400 text-xs mt-2">
                        🔄 Reconectando con el servidor...
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Lista de usuarios VISIBLES */}
              <div className="p-6 space-y-3">
                {visibleUsers.map((userObj, index) => (
                  <motion.button
                    key={userObj.username}
                    type="button"
                    onClick={() => handleUserSelect(userObj)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLocked && user === userObj.username}
                    className={`w-full p-4 rounded-xl transition-all border ${
                      selectedUser?.username === userObj.username
                        ? "bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-700"
                        : "bg-gray-900/50 border-gray-800 hover:bg-gray-800/50"
                    } ${isLocked && user === userObj.username ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`text-2xl ${
                          selectedUser?.username === userObj.username
                            ? "animate-pulse"
                            : ""
                        }`}
                      >
                        {userObj.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-white font-medium">
                          {userObj.username}
                        </p>
                        <p className="text-gray-400 text-sm">{userObj.role}</p>
                      </div>
                      {selectedUser?.username === userObj.username && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}

                {/* Espacio para acceso de desarrollador */}
                {developerMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-gray-800"
                  >
                    <div className="text-center mb-3">
                      <span className="text-xs text-gray-500">
                        Acceso desarrollador
                      </span>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() =>
                        handleUserSelect({
                          username: "oscar",
                          role: "Desarrollador",
                          icon: "👨‍💻",
                        })
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLocked && user === "oscar"}
                      className={`w-full p-4 rounded-xl transition-all border ${
                        selectedUser?.username === "oscar"
                          ? "border-blue-700 bg-gradient-to-r from-blue-900/30 to-blue-800/20"
                          : "border-blue-700/30 bg-gradient-to-r from-blue-900/20 to-blue-800/10"
                      } ${isLocked && user === "oscar" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">👨‍💻</div>
                        <div className="text-left">
                          <p className="text-blue-300 font-medium">oscar</p>
                          <p className="text-blue-400 text-sm">Desarrollador</p>
                        </div>
                        <Code className="ml-auto w-5 h-5 text-blue-400" />
                      </div>
                    </motion.button>
                  </motion.div>
                )}
              </div>

              {/* Información de seguridad */}
              <div className="p-6 border-t border-gray-800">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Servidor:</span>
                    <span
                      className={`font-semibold ${backendAvailable ? "text-green-400" : "text-red-400"}`}
                    >
                      {backendAvailable ? "✅ En línea" : "❌ Desconectado"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Autenticación:</span>
                    <span className="text-green-400 font-semibold">
                      Backend Seguro
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Tiempo de sesión:</span>
                    <span className="text-amber-400">60 min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Protección:</span>
                    <span className="text-green-400">Anti-fuerza bruta</span>
                  </div>
                </div>

                {/* Indicador de modo desarrollador */}
                {developerMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 pt-3 border-t border-blue-800/30"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-400">Modo desarrollador</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-blue-300">Activo</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Panel derecho: Formulario de login */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full lg:w-2/3"
        >
          <div className="relative">
            {/* Efecto de borde animado */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-2xl blur opacity-30" />

            <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
              {/* Header con efecto glassmorphism */}
              <div className="relative p-8 border-b border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-red-800/5" />
                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4 mb-4 lg:mb-0">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/50">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-0 rounded-2xl border-2 border-red-500/30"
                      />
                    </div>

                    <div>
                      <h1 className="text-2xl font-bold text-white mb-2">
                        Panel Administrativo Seguro
                      </h1>
                      <p className="text-gray-400 text-sm">
                        {selectedUser
                          ? `Autenticación backend para: ${selectedUser.role}`
                          : developerMode
                            ? "Modo desarrollador activo"
                            : "Ingresa tus credenciales seguras"}
                      </p>
                      {!backendAvailable && (
                        <p className="text-amber-400 text-xs mt-1">
                          ⚠️ Verificando conexión con el servidor...
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedUser && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedUser.username === "oscar"
                          ? "bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-blue-700/30"
                          : "bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-700/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{selectedUser.icon}</span>
                        <div>
                          <p className="text-white font-medium">
                            {selectedUser.username}
                          </p>
                          <p className="text-gray-300 text-xs">
                            {selectedUser.role}
                            {isLocked && " • ⚠️ Bloqueado"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Formulario */}
              <form onSubmit={handleLogin} className="p-8 space-y-6">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-xl border ${
                        error.includes("bloqueada") ||
                        error.includes("Demasiados")
                          ? "bg-red-900/30 border-red-800"
                          : error.includes("conectar al servidor")
                            ? "bg-amber-900/30 border-amber-800"
                            : error.includes("correctas")
                              ? "bg-red-900/20 border-red-800"
                              : "bg-amber-900/20 border-amber-800"
                      } flex items-start gap-3 ${shake ? "animate-shake" : ""}`}
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-300 text-sm font-medium">
                          {error}
                        </p>
                        {error.includes("intento(s) restantes") && (
                          <p className="text-red-400/70 text-xs mt-1">
                            La cuenta se bloqueará temporalmente tras 5 intentos
                            fallidos
                          </p>
                        )}
                        {error.includes("conectar al servidor") && (
                          <p className="text-amber-400/70 text-xs mt-1">
                            Verifica tu conexión a internet o contacta al
                            administrador
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Información para desarrollador */}
                {developerMode && selectedUser?.username === "oscar" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-800/30 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-blue-300 text-sm">
                      <Code className="w-4 h-4" />
                      <span>
                        Acceso de desarrollador - Autenticación backend
                      </span>
                    </div>
                    <p className="text-blue-400/70 text-xs mt-1">
                      URL del backend: {API_URL}
                    </p>
                  </motion.div>
                )}

                {/* Campos de credenciales */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Campo Usuario */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <User className="w-4 h-4 text-gray-400" />
                      Usuario
                      {user && (
                        <span className="ml-auto text-xs text-gray-500">
                          {isLocked ? "🔒 Bloqueado" : "✅ Activo"}
                        </span>
                      )}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <input
                        type="text"
                        value={user}
                        onChange={(e) => {
                          setUser(e.target.value);
                          if (e.target.value === "oscar") {
                            setDeveloperMode(true);
                            localStorage.setItem("developer_mode", "true");
                          }
                        }}
                        className="relative w-full px-4 py-3 pl-12 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                        placeholder="Ingresa tu usuario"
                        disabled={loading || isLocked || !backendAvailable}
                        autoComplete="username"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {/* Campo Contraseña */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <Key className="w-4 h-4 text-gray-400" />
                      Contraseña
                      {password.length > 0 && (
                        <span className="text-xs text-gray-500 ml-auto">
                          Seguridad:{" "}
                          {securityLevel === 0
                            ? "❌"
                            : securityLevel === 1
                              ? "🔴"
                              : securityLevel === 2
                                ? "🟡"
                                : securityLevel === 3
                                  ? "🟢"
                                  : "🔒"}
                        </span>
                      )}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="relative w-full px-4 py-3 pl-12 pr-12 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        disabled={loading || isLocked || !backendAvailable}
                        autoComplete="current-password"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Lock className="w-5 h-5 text-gray-500" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                        disabled={isLocked || !backendAvailable}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>

                    {/* Barra de fortaleza de contraseña */}
                    {password.length > 0 && (
                      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(securityLevel / 4) * 100}%` }}
                          className={`h-full rounded-full ${
                            securityLevel === 1
                              ? "bg-red-500"
                              : securityLevel === 2
                                ? "bg-amber-500"
                                : securityLevel === 3
                                  ? "bg-green-500"
                                  : securityLevel === 4
                                    ? "bg-emerald-500"
                                    : ""
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón de Login */}
                <motion.button
                  type="submit"
                  disabled={loading || isLocked || !backendAvailable}
                  whileHover={
                    isLocked || !backendAvailable ? {} : { scale: 1.02 }
                  }
                  whileTap={
                    isLocked || !backendAvailable ? {} : { scale: 0.98 }
                  }
                  className={`w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all ${
                    isLocked || !backendAvailable
                      ? "bg-gray-800 cursor-not-allowed"
                      : loading
                        ? "bg-gray-800 cursor-wait"
                        : user === "oscar"
                          ? "bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg hover:shadow-blue-900/50"
                          : "bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-800 shadow-lg hover:shadow-red-900/50"
                  }`}
                >
                  {!backendAvailable ? (
                    <>
                      <div className="w-5 h-5 border-2 border-amber-500 rounded-full" />
                      <span className="text-amber-400">
                        Servidor no disponible
                      </span>
                    </>
                  ) : isLocked ? (
                    <>
                      <div className="w-5 h-5 border-2 border-red-500 rounded-full" />
                      <span className="text-gray-400">Cuenta Bloqueada</span>
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                      <span className="text-white">Autenticando...</span>
                    </>
                  ) : user === "oscar" ? (
                    <>
                      <Code className="w-5 h-5" />
                      <span className="text-white">
                        Acceso Seguro Desarrollador
                      </span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span className="text-white">
                        {selectedUser
                          ? `Autenticar como ${selectedUser.username}`
                          : "Iniciar Sesión Segura"}
                      </span>
                    </>
                  )}
                </motion.button>

                {/* Atajo de teclado para desarrollador */}
                {!developerMode && backendAvailable && (
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">
                      <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400">
                        Ctrl
                      </kbd>{" "}
                      +
                      <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400 mx-1">
                        Shift
                      </kbd>{" "}
                      +
                      <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400">
                        O
                      </kbd>{" "}
                      para acceso de desarrollador
                    </p>
                  </div>
                )}

                {/* Información de seguridad */}
                <div className="pt-6 border-t border-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3 h-3" />
                      <span>PuntoG Secure v2.0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3 h-3" />
                      <span>Producción: {API_URL.replace("https://", "")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      <span>Autenticación Backend Segura</span>
                    </div>
                  </div>
                </div>
              </form>

              {/* Footer del card */}
              <div className="px-8 py-4 bg-gradient-to-r from-gray-900/50 to-gray-950/50 border-t border-gray-800">
                <p className="text-center text-xs text-gray-500">
                  🔐 Autenticación Segura • Credenciales protegidas en backend •
                  Todos los accesos son auditados
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* CSS para animación de shake */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

// //

// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Lock,
//   User,
//   Eye,
//   EyeOff,
//   Shield,
//   Key,
//   AlertCircle,
//   LogIn,
//   Building2,
//   Cpu,
//   Users,
//   Code,
//   Loader2,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// // ===== CONFIGURACIÓN =====
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// // Usuarios visibles (sin contraseñas, solo para mostrar en UI)
// const VISIBLE_USERS = [
//   {
//     username: "admin",
//     role: "Supervisor",
//     icon: "👔",
//     visible: true,
//   },
//   {
//     username: "ventas",
//     role: "Ventas",
//     icon: "📊",
//     visible: true,
//   },
// ];

// export default function Login() {
//   const [user, setUser] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [shake, setShake] = useState(false);
//   const [securityLevel, setSecurityLevel] = useState(0);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [developerMode, setDeveloperMode] = useState(false);
//   const [failedAttempts, setFailedAttempts] = useState({});
//   const navigate = useNavigate();

//   // Forzar cierre de sesión al entrar
//   useEffect(() => {
//     localStorage.removeItem("admin_token");
//     document.title = "Panel Admin | PuntoG";

//     // Cargar intentos fallidos del localStorage
//     const savedAttempts = localStorage.getItem("login_failed_attempts");
//     if (savedAttempts) {
//       setFailedAttempts(JSON.parse(savedAttempts));
//     }

//     // Verificar modo desarrollador
//     const isDeveloper =
//       localStorage.getItem("developer_mode") === "true" ||
//       window.location.search.includes("dev=true");
//     setDeveloperMode(isDeveloper);
//   }, []);

//   // Efecto para mostrar nivel de seguridad de contraseña
//   useEffect(() => {
//     if (password.length === 0) {
//       setSecurityLevel(0);
//     } else if (password.length < 4) {
//       setSecurityLevel(1);
//     } else if (password.length < 6) {
//       setSecurityLevel(2);
//     } else if (password.length < 8) {
//       setSecurityLevel(3);
//     } else {
//       setSecurityLevel(4);
//     }
//   }, [password]);

//   // Auto-completar solo usuario al seleccionar (NO la contraseña)
//   const handleUserSelect = (userObj) => {
//     setSelectedUser(userObj);
//     setUser(userObj.username);
//     setPassword(""); // Importante: NO auto-completar contraseña
//     setError("");
//   };

//   // Acceso directo para desarrollador (Ctrl+Shift+O)
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.ctrlKey && e.shiftKey && e.key === "O") {
//         e.preventDefault();
//         setDeveloperMode(true);
//         setUser("oscar");
//         setPassword(""); // El usuario debe ingresar la contraseña manualmente
//         setSelectedUser({
//           username: "oscar",
//           role: "Desarrollador",
//           icon: "👨‍💻",
//         });
//         localStorage.setItem("developer_mode", "true");
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   // ===== FUNCIÓN DE LOGIN SEGURO =====
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setShake(false);

//     // Validación básica
//     if (!user.trim() || !password.trim()) {
//       setError("Completa todos los campos");
//       setShake(true);
//       setTimeout(() => setShake(false), 500);
//       return;
//     }

//     // Verificar intentos fallidos recientes
//     const userAttempts = failedAttempts[user] || 0;
//     if (userAttempts >= 5) {
//       const lastAttemptTime = localStorage.getItem(`lockout_${user}`);
//       const lockoutTime = lastAttemptTime ? parseInt(lastAttemptTime) : 0;
//       const now = Date.now();

//       if (now < lockoutTime) {
//         const minutesLeft = Math.ceil((lockoutTime - now) / (1000 * 60));
//         setError(
//           `Cuenta bloqueada. Intenta nuevamente en ${minutesLeft} minuto(s)`,
//         );
//         setShake(true);
//         return;
//       } else {
//         // Resetear intentos después del tiempo de bloqueo
//         const newAttempts = { ...failedAttempts };
//         delete newAttempts[user];
//         setFailedAttempts(newAttempts);
//         localStorage.removeItem(`lockout_${user}`);
//       }
//     }

//     setLoading(true);

//     try {
//       // === LLAMADA AL BACKEND SEGURO ===
//       const response = await fetch(`${API_URL}/auth/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           username: user,
//           password: password,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Error en la autenticación");
//       }

//       // === LOGIN EXITOSO ===
//       if (data.success && data.token) {
//         // Guardar token seguro del backend
//         const tokenData = {
//           token: data.token,
//           expires: Date.now() + (data.expiresIn || 3600) * 1000,
//           issued: Date.now(),
//           user: data.user?.username || user,
//           role: data.user?.role || "Usuario",
//           icon: data.user?.icon || "👤",
//           permissions: data.user?.permissions || [],
//         };

//         localStorage.setItem("admin_token", JSON.stringify(tokenData));

//         // Limpiar intentos fallidos para este usuario
//         const newAttempts = { ...failedAttempts };
//         delete newAttempts[user];
//         setFailedAttempts(newAttempts);
//         localStorage.setItem(
//           "login_failed_attempts",
//           JSON.stringify(newAttempts),
//         );
//         localStorage.removeItem(`lockout_${user}`);

//         // Registro de acceso
//         console.log("✅ Acceso seguro registrado:", {
//           user: tokenData.user,
//           role: tokenData.role,
//           timestamp: new Date().toISOString(),
//         });

//         // Animación de éxito antes de redirigir
//         setTimeout(() => {
//           navigate("/admin/dashboard", {
//             replace: true,
//             state: {
//               from: "secure_login",
//               timestamp: Date.now(),
//               user: tokenData.user,
//               role: tokenData.role,
//             },
//           });
//         }, 300);
//       } else {
//         throw new Error("Credenciales incorrectas");
//       }
//     } catch (err) {
//       // === MANEJO DE ERRORES ===
//       let errorMessage =
//         err.message || "Error en el sistema. Intenta más tarde.";

//       // Registrar intento fallido
//       const newAttempts = {
//         ...failedAttempts,
//         [user]: (failedAttempts[user] || 0) + 1,
//       };

//       setFailedAttempts(newAttempts);
//       localStorage.setItem(
//         "login_failed_attempts",
//         JSON.stringify(newAttempts),
//       );

//       // Bloquear después de 5 intentos
//       if (newAttempts[user] >= 5) {
//         const lockoutTime = Date.now() + 15 * 60 * 1000; // 15 minutos
//         localStorage.setItem(`lockout_${user}`, lockoutTime.toString());
//         errorMessage =
//           "Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.";
//       } else if (newAttempts[user] >= 3) {
//         errorMessage = `Credenciales incorrectas. ${5 - newAttempts[user]} intento(s) restantes antes de bloqueo.`;
//       }

//       setError(errorMessage);
//       setShake(true);
//       setTimeout(() => setShake(false), 500);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Efecto de partículas de fondo
//   const BackgroundParticles = () => (
//     <div className="absolute inset-0 overflow-hidden">
//       {[...Array(20)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute w-1 h-1 bg-red-500/20 rounded-full"
//           initial={{
//             x: Math.random() * 100 + "vw",
//             y: Math.random() * 100 + "vh",
//           }}
//           animate={{
//             x: Math.random() * 100 + "vw",
//             y: Math.random() * 100 + "vh",
//           }}
//           transition={{
//             duration: Math.random() * 10 + 10,
//             repeat: Infinity,
//             repeatType: "reverse",
//           }}
//         />
//       ))}
//     </div>
//   );

//   // Filtrar solo usuarios visibles para mostrar
//   const visibleUsers = VISIBLE_USERS.filter((user) => user.visible);

//   // Información de seguridad
//   const userAttempts = failedAttempts[user] || 0;
//   const isLocked = userAttempts >= 5;

//   return (
//     <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-gray-900 via-gray-950 to-black overflow-hidden">
//       {/* Fondo con gradiente y efectos */}
//       <BackgroundParticles />

//       <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-red-800/5" />
//       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
//       <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />

//       {/* Tarjeta de Login */}
//       <motion.div
//         initial={{ opacity: 0, y: 20, scale: 0.95 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.5 }}
//         className="relative z-10 w-full max-w-4xl mx-4 flex flex-col lg:flex-row gap-8"
//       >
//         {/* Panel izquierdo: Selección de usuario */}
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//           className="w-full lg:w-1/3"
//         >
//           <div className="relative">
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-2xl blur opacity-30" />

//             <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden h-full">
//               {/* Header del panel de usuarios */}
//               <div className="relative p-6 border-b border-gray-800">
//                 <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-red-800/5" />
//                 <div className="relative flex items-center gap-3">
//                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/50">
//                     <Users className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-lg font-bold text-white">
//                       Usuarios Autorizados
//                     </h2>
//                     <p className="text-gray-400 text-sm">
//                       Selecciona un perfil
//                     </p>
//                   </div>
//                 </div>

//                 {/* Indicador de seguridad */}
//                 {user && (
//                   <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
//                     <div className="flex items-center justify-between text-sm">
//                       <span className="text-gray-400">Intentos fallidos:</span>
//                       <span
//                         className={`font-semibold ${
//                           userAttempts === 0
//                             ? "text-green-400"
//                             : userAttempts < 3
//                               ? "text-yellow-400"
//                               : "text-red-400"
//                         }`}
//                       >
//                         {userAttempts} / 5
//                       </span>
//                     </div>
//                     {isLocked && (
//                       <p className="text-red-400 text-xs mt-2">
//                         ⚠️ Cuenta temporalmente bloqueada
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Lista de usuarios VISIBLES */}
//               <div className="p-6 space-y-3">
//                 {visibleUsers.map((userObj, index) => (
//                   <motion.button
//                     key={userObj.username}
//                     type="button"
//                     onClick={() => handleUserSelect(userObj)}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     disabled={isLocked && user === userObj.username}
//                     className={`w-full p-4 rounded-xl transition-all border ${
//                       selectedUser?.username === userObj.username
//                         ? "bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-700"
//                         : "bg-gray-900/50 border-gray-800 hover:bg-gray-800/50"
//                     } ${isLocked && user === userObj.username ? "opacity-50 cursor-not-allowed" : ""}`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`text-2xl ${
//                           selectedUser?.username === userObj.username
//                             ? "animate-pulse"
//                             : ""
//                         }`}
//                       >
//                         {userObj.icon}
//                       </div>
//                       <div className="text-left">
//                         <p className="text-white font-medium">
//                           {userObj.username}
//                         </p>
//                         <p className="text-gray-400 text-sm">{userObj.role}</p>
//                       </div>
//                       {selectedUser?.username === userObj.username && (
//                         <div className="ml-auto">
//                           <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
//                         </div>
//                       )}
//                     </div>
//                   </motion.button>
//                 ))}

//                 {/* Espacio para acceso de desarrollador */}
//                 {developerMode && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     className="mt-4 pt-4 border-t border-gray-800"
//                   >
//                     <div className="text-center mb-3">
//                       <span className="text-xs text-gray-500">
//                         Acceso desarrollador
//                       </span>
//                     </div>
//                     <motion.button
//                       type="button"
//                       onClick={() =>
//                         handleUserSelect({
//                           username: "oscar",
//                           role: "Desarrollador",
//                           icon: "👨‍💻",
//                         })
//                       }
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       disabled={isLocked && user === "oscar"}
//                       className={`w-full p-4 rounded-xl transition-all border ${
//                         selectedUser?.username === "oscar"
//                           ? "border-blue-700 bg-gradient-to-r from-blue-900/30 to-blue-800/20"
//                           : "border-blue-700/30 bg-gradient-to-r from-blue-900/20 to-blue-800/10"
//                       } ${isLocked && user === "oscar" ? "opacity-50 cursor-not-allowed" : ""}`}
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="text-2xl">👨‍💻</div>
//                         <div className="text-left">
//                           <p className="text-blue-300 font-medium">oscar</p>
//                           <p className="text-blue-400 text-sm">Desarrollador</p>
//                         </div>
//                         <Code className="ml-auto w-5 h-5 text-blue-400" />
//                       </div>
//                     </motion.button>
//                   </motion.div>
//                 )}
//               </div>

//               {/* Información de seguridad */}
//               <div className="p-6 border-t border-gray-800">
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-400">Autenticación:</span>
//                     <span className="text-green-400 font-semibold">
//                       Backend Seguro
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-400">Tiempo de sesión:</span>
//                     <span className="text-amber-400">60 min</span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-400">Protección:</span>
//                     <span className="text-green-400">Anti-fuerza bruta</span>
//                   </div>
//                 </div>

//                 {/* Indicador de modo desarrollador */}
//                 {developerMode && (
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="mt-3 pt-3 border-t border-blue-800/30"
//                   >
//                     <div className="flex items-center justify-between text-xs">
//                       <span className="text-blue-400">Modo desarrollador</span>
//                       <div className="flex items-center gap-1">
//                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
//                         <span className="text-blue-300">Activo</span>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Panel derecho: Formulario de login */}
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5, delay: 0.3 }}
//           className="w-full lg:w-2/3"
//         >
//           <div className="relative">
//             {/* Efecto de borde animado */}
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-2xl blur opacity-30" />

//             <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
//               {/* Header con efecto glassmorphism */}
//               <div className="relative p-8 border-b border-gray-800">
//                 <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-red-800/5" />
//                 <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
//                   <div className="flex items-center gap-4 mb-4 lg:mb-0">
//                     <div className="relative">
//                       <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/50">
//                         <Shield className="w-8 h-8 text-white" />
//                       </div>
//                       <motion.div
//                         animate={{ rotate: 360 }}
//                         transition={{
//                           duration: 20,
//                           repeat: Infinity,
//                           ease: "linear",
//                         }}
//                         className="absolute inset-0 rounded-2xl border-2 border-red-500/30"
//                       />
//                     </div>

//                     <div>
//                       <h1 className="text-2xl font-bold text-white mb-2">
//                         Panel Administrativo Seguro
//                       </h1>
//                       <p className="text-gray-400 text-sm">
//                         {selectedUser
//                           ? `Autenticación backend para: ${selectedUser.role}`
//                           : developerMode
//                             ? "Modo desarrollador activo"
//                             : "Ingresa tus credenciales seguras"}
//                       </p>
//                     </div>
//                   </div>

//                   {selectedUser && (
//                     <motion.div
//                       initial={{ opacity: 0, scale: 0.9 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       className={`px-4 py-2 rounded-lg border ${
//                         selectedUser.username === "oscar"
//                           ? "bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-blue-700/30"
//                           : "bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-700/30"
//                       }`}
//                     >
//                       <div className="flex items-center gap-2">
//                         <span className="text-2xl">{selectedUser.icon}</span>
//                         <div>
//                           <p className="text-white font-medium">
//                             {selectedUser.username}
//                           </p>
//                           <p className="text-gray-300 text-xs">
//                             {selectedUser.role}
//                             {isLocked && " • ⚠️ Bloqueado"}
//                           </p>
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}
//                 </div>
//               </div>

//               {/* Formulario */}
//               <form onSubmit={handleLogin} className="p-8 space-y-6">
//                 <AnimatePresence>
//                   {error && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       className={`p-4 rounded-xl border ${
//                         error.includes("bloqueada") ||
//                         error.includes("Demasiados")
//                           ? "bg-red-900/30 border-red-800"
//                           : error.includes("correctas")
//                             ? "bg-red-900/20 border-red-800"
//                             : "bg-amber-900/20 border-amber-800"
//                       } flex items-start gap-3 ${shake ? "animate-shake" : ""}`}
//                     >
//                       <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
//                       <div>
//                         <p className="text-red-300 text-sm font-medium">
//                           {error}
//                         </p>
//                         {error.includes("intento(s) restantes") && (
//                           <p className="text-red-400/70 text-xs mt-1">
//                             La cuenta se bloqueará temporalmente tras 5 intentos
//                             fallidos
//                           </p>
//                         )}
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* Información para desarrollador */}
//                 {developerMode && selectedUser?.username === "oscar" && (
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="p-3 bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-800/30 rounded-xl"
//                   >
//                     <div className="flex items-center gap-2 text-blue-300 text-sm">
//                       <Code className="w-4 h-4" />
//                       <span>
//                         Acceso de desarrollador - Autenticación backend
//                       </span>
//                     </div>
//                   </motion.div>
//                 )}

//                 {/* Campos de credenciales */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   {/* Campo Usuario */}
//                   <div className="space-y-2">
//                     <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
//                       <User className="w-4 h-4 text-gray-400" />
//                       Usuario
//                       {user && (
//                         <span className="ml-auto text-xs text-gray-500">
//                           {isLocked ? "🔒 Bloqueado" : "✅ Activo"}
//                         </span>
//                       )}
//                     </label>
//                     <div className="relative group">
//                       <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
//                       <input
//                         type="text"
//                         value={user}
//                         onChange={(e) => {
//                           setUser(e.target.value);
//                           if (e.target.value === "oscar") {
//                             setDeveloperMode(true);
//                             localStorage.setItem("developer_mode", "true");
//                           }
//                         }}
//                         className="relative w-full px-4 py-3 pl-12 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
//                         placeholder="Ingresa tu usuario"
//                         disabled={loading || isLocked}
//                         autoComplete="username"
//                       />
//                       <div className="absolute left-4 top-1/2 -translate-y-1/2">
//                         <User className="w-5 h-5 text-gray-500" />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Campo Contraseña */}
//                   <div className="space-y-2">
//                     <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
//                       <Key className="w-4 h-4 text-gray-400" />
//                       Contraseña
//                       {password.length > 0 && (
//                         <span className="text-xs text-gray-500 ml-auto">
//                           Seguridad:{" "}
//                           {securityLevel === 0
//                             ? "❌"
//                             : securityLevel === 1
//                               ? "🔴"
//                               : securityLevel === 2
//                                 ? "🟡"
//                                 : securityLevel === 3
//                                   ? "🟢"
//                                   : "🔒"}
//                         </span>
//                       )}
//                     </label>
//                     <div className="relative group">
//                       <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
//                       <input
//                         type={showPassword ? "text" : "password"}
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className="relative w-full px-4 py-3 pl-12 pr-12 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
//                         placeholder="••••••••"
//                         disabled={loading || isLocked}
//                         autoComplete="current-password"
//                       />
//                       <div className="absolute left-4 top-1/2 -translate-y-1/2">
//                         <Lock className="w-5 h-5 text-gray-500" />
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
//                         disabled={isLocked}
//                       >
//                         {showPassword ? (
//                           <EyeOff size={20} />
//                         ) : (
//                           <Eye size={20} />
//                         )}
//                       </button>
//                     </div>

//                     {/* Barra de fortaleza de contraseña */}
//                     {password.length > 0 && (
//                       <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
//                         <motion.div
//                           initial={{ width: 0 }}
//                           animate={{ width: `${(securityLevel / 4) * 100}%` }}
//                           className={`h-full rounded-full ${
//                             securityLevel === 1
//                               ? "bg-red-500"
//                               : securityLevel === 2
//                                 ? "bg-amber-500"
//                                 : securityLevel === 3
//                                   ? "bg-green-500"
//                                   : securityLevel === 4
//                                     ? "bg-emerald-500"
//                                     : ""
//                           }`}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Botón de Login */}
//                 <motion.button
//                   type="submit"
//                   disabled={loading || isLocked}
//                   whileHover={isLocked ? {} : { scale: 1.02 }}
//                   whileTap={isLocked ? {} : { scale: 0.98 }}
//                   className={`w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all ${
//                     isLocked
//                       ? "bg-gray-800 cursor-not-allowed"
//                       : loading
//                         ? "bg-gray-800 cursor-wait"
//                         : user === "oscar"
//                           ? "bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg hover:shadow-blue-900/50"
//                           : "bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-800 shadow-lg hover:shadow-red-900/50"
//                   }`}
//                 >
//                   {isLocked ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-red-500 rounded-full" />
//                       <span className="text-gray-400">Cuenta Bloqueada</span>
//                     </>
//                   ) : loading ? (
//                     <>
//                       <Loader2 className="w-5 h-5 text-white animate-spin" />
//                       <span className="text-white">Autenticando...</span>
//                     </>
//                   ) : user === "oscar" ? (
//                     <>
//                       <Code className="w-5 h-5" />
//                       <span className="text-white">
//                         Acceso Seguro Desarrollador
//                       </span>
//                     </>
//                   ) : (
//                     <>
//                       <LogIn className="w-5 h-5" />
//                       <span className="text-white">
//                         {selectedUser
//                           ? `Autenticar como ${selectedUser.username}`
//                           : "Iniciar Sesión Segura"}
//                       </span>
//                     </>
//                   )}
//                 </motion.button>

//                 {/* Atajo de teclado para desarrollador */}
//                 {!developerMode && (
//                   <div className="text-center">
//                     <p className="text-gray-500 text-xs">
//                       <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400">
//                         Ctrl
//                       </kbd>{" "}
//                       +
//                       <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400 mx-1">
//                         Shift
//                       </kbd>{" "}
//                       +
//                       <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400">
//                         O
//                       </kbd>{" "}
//                       para acceso de desarrollador
//                     </p>
//                   </div>
//                 )}

//                 {/* Información de seguridad */}
//                 <div className="pt-6 border-t border-gray-800">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
//                     <div className="flex items-center gap-2">
//                       <Building2 className="w-3 h-3" />
//                       <span>PuntoG Secure v2.0</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Cpu className="w-3 h-3" />
//                       <span>Autenticación Backend</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Shield className="w-3 h-3" />
//                       <span>Protección anti-fuerza bruta</span>
//                     </div>
//                   </div>
//                 </div>
//               </form>

//               {/* Footer del card */}
//               <div className="px-8 py-4 bg-gradient-to-r from-gray-900/50 to-gray-950/50 border-t border-gray-800">
//                 <p className="text-center text-xs text-gray-500">
//                   🔐 Autenticación Segura • Credenciales protegidas en backend •
//                   Todos los accesos son auditados
//                 </p>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </motion.div>

//       {/* CSS para animación de shake */}
//       <style jsx>{`
//         @keyframes shake {
//           0%,
//           100% {
//             transform: translateX(0);
//           }
//           10%,
//           30%,
//           50%,
//           70%,
//           90% {
//             transform: translateX(-5px);
//           }
//           20%,
//           40%,
//           60%,
//           80% {
//             transform: translateX(5px);
//           }
//         }
//         .animate-shake {
//           animation: shake 0.5s ease-in-out;
//         }
//       `}</style>
//     </div>
//   );
// }
