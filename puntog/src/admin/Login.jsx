import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  //   Key,
  AlertCircle,
  LogIn,
  Building2,
  Cpu,
  Users,
  Code,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Usuarios autorizados - Oscar es oculto pero tiene acceso
const AUTHORIZED_USERS = [
  {
    username: "admin",
    password: "admin123",
    role: "Supervisor",
    icon: "👔",
    visible: true,
  },
  {
    username: "ventas",
    password: "ventas123",
    role: "Ventas",
    icon: "📊",
    visible: true,
  },
  // Oscar es oculto pero tiene acceso directo
  {
    username: "oscar",
    password: "811012",
    role: "Desarrollador",
    icon: "👨‍💻",
    visible: false,
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
  const navigate = useNavigate();

  // Forzar cierre de sesión al entrar
  useEffect(() => {
    localStorage.removeItem("admin_token");
    document.title = "Panel Admin | PuntoG";

    // Verificar si es el programador por IP o userAgent (opcional)
    const isDeveloper =
      localStorage.getItem("developer_mode") === "true" ||
      window.location.search.includes("dev=true");
    setDeveloperMode(isDeveloper);
  }, []);

  // Efecto para mostrar nivel de seguridad de contraseña
  useEffect(() => {
    if (password.length === 0) {
      setSecurityLevel(0);
    } else if (password.length < 4) {
      setSecurityLevel(1);
    } else if (password.length < 6) {
      setSecurityLevel(2);
    } else {
      setSecurityLevel(3);
    }
  }, [password]);

  // Auto-completar credenciales al seleccionar usuario visible
  const handleUserSelect = (userObj) => {
    setSelectedUser(userObj);
    setUser(userObj.username);
    setPassword(userObj.password);
    setError("");
  };

  // Acceso directo para desarrollador (Ctrl+Shift+O)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "O") {
        e.preventDefault();
        setDeveloperMode(true);
        setUser("oscar");
        setPassword("811012");
        setSelectedUser({
          username: "oscar",
          role: "Desarrollador",
          icon: "👨‍💻",
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

    setLoading(true);

    // Simular un pequeño delay para mejor UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Verificar credenciales con todos los usuarios (incluyendo Oscar)
      const validUser = AUTHORIZED_USERS.find(
        (u) => u.username === user && u.password === password,
      );

      if (validUser) {
        // Generar token seguro con información del usuario
        const tokenData = {
          value: btoa(`${validUser.username}:${Date.now()}`),
          expires: Date.now() + 1000 * 60 * 60, // 1 hora
          issued: Date.now(),
          user: validUser.username,
          role: validUser.role,
          icon: validUser.icon,
        };

        localStorage.setItem("admin_token", JSON.stringify(tokenData));

        // Registro de acceso
        const accessLog = {
          user: validUser.username,
          role: validUser.role,
          timestamp: new Date().toISOString(),
          ip: "127.0.0.1",
          userAgent: navigator.userAgent,
        };

        console.log("Acceso registrado:", accessLog);

        // Animación de éxito antes de redirigir
        setTimeout(() => {
          navigate("/admin/dashboard", {
            replace: true,
            state: {
              from: "login",
              timestamp: Date.now(),
              user: validUser.username,
              role: validUser.role,
            },
          });
        }, 300);
      } else {
        setError("Credenciales incorrectas. Intenta nuevamente.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err) {
      setError("Error en el sistema. Intenta más tarde.");
      setShake(true);
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
  const visibleUsers = AUTHORIZED_USERS.filter((user) => user.visible);

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
                      Selecciona un perfil
                    </p>
                  </div>
                </div>
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
                    className={`w-full p-4 rounded-xl transition-all border ${
                      selectedUser?.username === userObj.username
                        ? "bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-700"
                        : "bg-gray-900/50 border-gray-800 hover:bg-gray-800/50"
                    }`}
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

                {/* Espacio para acceso de desarrollador (solo visible si activado) */}
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
                      onClick={() => {
                        setUser("oscar");
                        setPassword("811012");
                        setSelectedUser({
                          username: "oscar",
                          role: "Desarrollador",
                          icon: "👨‍💻",
                        });
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-4 rounded-xl transition-all border border-blue-700/30 bg-gradient-to-r from-blue-900/20 to-blue-800/10"
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

              {/* Información de usuarios */}
              <div className="p-6 border-t border-gray-800">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Usuarios activos:</span>
                    <span className="text-green-400 font-semibold">
                      {visibleUsers.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Tiempo de sesión:</span>
                    <span className="text-amber-400">60 min</span>
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
                        Panel Administrativo
                      </h1>
                      <p className="text-gray-400 text-sm">
                        {selectedUser
                          ? `Acceso como: ${selectedUser.role}`
                          : developerMode
                            ? "Modo desarrollador activo"
                            : "Selecciona un usuario o ingresa manualmente"}
                      </p>
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
                        error.includes("correctas")
                          ? "bg-red-900/20 border-red-800"
                          : "bg-amber-900/20 border-amber-800"
                      } flex items-start gap-3 ${shake ? "animate-shake" : ""}`}
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-300 text-sm font-medium">
                          {error}
                        </p>
                        {error.includes("correctas") && (
                          <p className="text-red-400/70 text-xs mt-1">
                            Verifica las credenciales e intenta nuevamente
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
                      <span>Acceso de desarrollador activado</span>
                    </div>
                  </motion.div>
                )}

                {/* Campos de credenciales */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Campo Usuario */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <User className="w-4 h-4 text-gray-400" />
                      Usuario
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                      <input
                        type="text"
                        value={user}
                        onChange={(e) => {
                          setUser(e.target.value);
                          // Si el usuario es "oscar", activar modo desarrollador
                          if (e.target.value === "oscar") {
                            setDeveloperMode(true);
                          }
                        }}
                        className="relative w-full px-4 py-3 pl-12 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                        placeholder="Ingresa tu usuario"
                        disabled={loading}
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
                          Nivel de seguridad:{" "}
                          {securityLevel === 0
                            ? "❌"
                            : securityLevel === 1
                              ? "⚠️"
                              : securityLevel === 2
                                ? "✅"
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
                        disabled={loading}
                        autoComplete="current-password"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Lock className="w-5 h-5 text-gray-500" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
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
                      <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(securityLevel / 3) * 100}%` }}
                          className={`h-full rounded-full ${
                            securityLevel === 1
                              ? "bg-red-500"
                              : securityLevel === 2
                                ? "bg-amber-500"
                                : securityLevel === 3
                                  ? "bg-green-500"
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
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all ${
                    loading
                      ? "bg-gray-800 cursor-not-allowed"
                      : user === "oscar"
                        ? "bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg hover:shadow-blue-900/50"
                        : "bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-800 shadow-lg hover:shadow-red-900/50"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-white">Verificando...</span>
                    </>
                  ) : user === "oscar" ? (
                    <>
                      <Code className="w-5 h-5" />
                      <span className="text-white">Acceso Desarrollador</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span className="text-white">
                        {selectedUser
                          ? `Acceder como ${selectedUser.username}`
                          : "Iniciar Sesión"}
                      </span>
                    </>
                  )}
                </motion.button>

                {/* Atajo de teclado para desarrollador */}
                {!developerMode && (
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
                      <span>PuntoG Admin v1.0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3 h-3" />
                      <span>Sesión: 60 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <span>{visibleUsers.length} usuarios activos</span>
                    </div>
                  </div>
                </div>
              </form>

              {/* Footer del card */}
              <div className="px-8 py-4 bg-gradient-to-r from-gray-900/50 to-gray-950/50 border-t border-gray-800">
                <p className="text-center text-xs text-gray-500">
                  🔐 Acceso restringido • Todos los intentos son registrados
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
