import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";
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
  Clock,
  Ban,
  CheckCircle,
  Fingerprint,
  ShieldCheck,
  Network,
  Globe,
  Server,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 🔐 Configuración de seguridad
const SECRET_KEY =
  import.meta.env.VITE_APP_SECRET_KEY || "clave-temporal-segura-2024";
const ENCRYPTION_KEY =
  import.meta.env.VITE_APP_ENCRYPTION_KEY || "clave-encripcion-32-caracteres";
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://gleaming-motivation-production-4018.up.railway.app/";
const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 15 * 60 * 1000;

// 🔒 Función para cifrar datos
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

// 🔓 Función para descifrar datos
const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
};

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
  const [blockedTime, setBlockedTime] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [apiStatus, setApiStatus] = useState("checking");
  const [connectionTested, setConnectionTested] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 🌐 Verificar estado de la API al cargar
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch(`${API_URL}health`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          timeout: 5000,
        });

        if (response.ok) {
          setApiStatus("online");
        } else {
          setApiStatus("offline");
        }
      } catch (error) {
        console.warn("API no disponible, usando modo local");
        setApiStatus("offline");
      } finally {
        setConnectionTested(true);
      }
    };

    checkApiStatus();
  }, []);

  // 🕒 Verificar bloqueos
  useEffect(() => {
    if (!user) return;

    const checkBlock = () => {
      const blockKey = `block_${CryptoJS.SHA256(user).toString()}`;
      const attemptsKey = `attempts_${CryptoJS.SHA256(user).toString()}`;
      const now = Date.now();

      const blockUntil = localStorage.getItem(blockKey);
      const attempts = parseInt(localStorage.getItem(attemptsKey) || "0");

      setFailedAttempts(attempts);

      if (blockUntil && now < parseInt(blockUntil)) {
        const minutesLeft = Math.ceil((parseInt(blockUntil) - now) / 60000);
        setBlockedTime(parseInt(blockUntil));
        setError(
          `⏳ Usuario bloqueado por seguridad. Espera ${minutesLeft} minuto${minutesLeft > 1 ? "s" : ""}.`,
        );
      } else if (blockUntil) {
        localStorage.removeItem(blockKey);
        localStorage.removeItem(attemptsKey);
        setBlockedTime(0);
        setFailedAttempts(0);
        setError("");
      }
    };

    checkBlock();
  }, [user]);

  // 📊 Nivel de seguridad de contraseña
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

  // 👤 Seleccionar usuario
  const handleUserSelect = (username, role) => {
    if (blockedTime && Date.now() < blockedTime) {
      setError("Este usuario está temporalmente bloqueado");
      return;
    }

    setSelectedUser({ username, role });
    setUser(username);
    setPassword("");
    setError("");
  };

  // 🔐 FUNCIÓN PRINCIPAL DE LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setShake(false);

    // 🔒 Validar entrada
    const sanitizedUser = user.replace(/[^a-zA-Z0-9]/g, "");
    const sanitizedPass = password.replace(/[^\x20-\x7E]/g, "");

    if (sanitizedUser !== user || sanitizedPass !== password) {
      setError("Caracteres no permitidos detectados");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (blockedTime && Date.now() < blockedTime) {
      const minutesLeft = Math.ceil((blockedTime - Date.now()) / 60000);
      setError(`⏳ Usuario bloqueado. Espera ${minutesLeft} minutos.`);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (!user.trim() || !password.trim()) {
      setError("Completa todos los campos");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // 🔍 Rate limiting
    const requestKey = `req_${CryptoJS.SHA256(user + Date.now().toString()).toString()}`;
    const lastRequest = localStorage.getItem(requestKey);
    if (lastRequest && Date.now() - parseInt(lastRequest) < 1000) {
      setError("Demasiadas solicitudes. Espera un momento.");
      return;
    }
    localStorage.setItem(requestKey, Date.now().toString());

    setLoading(true);

    try {
      let loginSuccessful = false;
      let userData = null;

      // 🔄 Intentar conectar a la API primero
      if (apiStatus === "online") {
        try {
          const encryptedCredentials = encryptData({
            username: user,
            password: password,
            timestamp: Date.now(),
          });

          const response = await fetch(`${API_URL}auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ credentials: encryptedCredentials }),
          });

          if (response.ok) {
            const data = await response.json();

            if (data.success && data.token) {
              loginSuccessful = true;
              userData = {
                username: data.user.username || user,
                role: data.user.role || "Usuario",
                token: data.token,
                expiresAt: data.expiresAt || Date.now() + 8 * 60 * 60 * 1000,
              };

              console.log("✅ Login exitoso via API");
            }
          }
        } catch (apiError) {
          console.warn("Error en API, usando modo local:", apiError);
        }
      }

      // 🔄 Si la API falla, usar autenticación local
      if (!loginSuccessful) {
        // 🔐 Credenciales locales encriptadas
        const LOCAL_USERS = [
          {
            username: "admin",
            passwordHash: CryptoJS.SHA256(
              "admin123" + "salt_admin_2024",
            ).toString(),
            role: "Supervisor",
            salt: "salt_admin_2024",
          },
          {
            username: "ventas",
            passwordHash: CryptoJS.SHA256(
              "ventas123" + "salt_ventas_2024",
            ).toString(),
            role: "Ventas",
            salt: "salt_ventas_2024",
          },
          {
            username: "oscar",
            passwordHash: CryptoJS.SHA256(
              "811012" + "salt_oscar_2024",
            ).toString(),
            role: "Desarrollador",
            salt: "salt_oscar_2024",
          },
        ];

        const userObj = LOCAL_USERS.find((u) => u.username === user);

        if (userObj) {
          const inputHash = CryptoJS.SHA256(password + userObj.salt).toString();

          if (inputHash === userObj.passwordHash) {
            loginSuccessful = true;
            userData = {
              username: userObj.username,
              role: userObj.role,
              token: null,
              expiresAt: Date.now() + 8 * 60 * 60 * 1000,
            };

            console.log("✅ Login exitoso local");
          }
        }
      }

      if (loginSuccessful && userData) {
        // ✅ LOGIN EXITOSO
        const hashedUser = CryptoJS.SHA256(user).toString();
        localStorage.removeItem(`attempts_${hashedUser}`);
        localStorage.removeItem(`block_${hashedUser}`);

        // 🎫 Guardar datos de sesión segura
        const sessionData = {
          user: userData.username,
          role: userData.role,
          loginTime: Date.now(),
          expiresAt: userData.expiresAt,
          apiToken: userData.token,
          apiMode: apiStatus === "online",
          sessionId: CryptoJS.lib.WordArray.random(32).toString(),
        };

        // 🔐 Encriptar datos sensibles
        const encryptedSession = encryptData(sessionData);
        localStorage.setItem("admin_session", encryptedSession);
        localStorage.setItem("session_start", Date.now().toString());

        // 📝 Auditoría
        console.log("🎉 Sesión iniciada:", {
          usuario: userData.username,
          rol: userData.role,
          modo: apiStatus === "online" ? "API" : "Local",
          expira: new Date(userData.expiresAt).toLocaleString(),
        });

        // 🚀 Redirigir al dashboard
        setTimeout(() => {
          const redirectTo =
            new URLSearchParams(location.search).get("redirect") ||
            "/admin/dashboard";
          navigate(redirectTo, {
            replace: true,
            state: {
              from: "login",
              timestamp: Date.now(),
              user: userData.username,
              role: userData.role,
              apiMode: apiStatus === "online",
            },
          });
        }, 300);
      } else {
        // ❌ LOGIN FALLIDO
        handleFailedAttempt(user);
      }
    } catch (err) {
      console.error("🔥 Error crítico en login:", err);
      setError("⚠️ Error en el sistema. Intenta más tarde.");
      setShake(true);
    } finally {
      setLoading(false);
    }
  };

  // ❌ Manejar intento fallido
  const handleFailedAttempt = (username) => {
    const hashedUser = CryptoJS.SHA256(username).toString();
    const attemptsKey = `attempts_${hashedUser}`;
    const currentAttempts =
      parseInt(localStorage.getItem(attemptsKey) || "0") + 1;

    localStorage.setItem(attemptsKey, currentAttempts.toString());
    setFailedAttempts(currentAttempts);

    if (currentAttempts >= MAX_ATTEMPTS) {
      const blockUntil = Date.now() + BLOCK_TIME;
      localStorage.setItem(`block_${hashedUser}`, blockUntil.toString());
      setBlockedTime(blockUntil);
      setError(`🔒 Demasiados intentos. Usuario bloqueado por 15 minutos.`);

      console.warn(
        `🚫 BLOQUEO: ${username} - ${new Date(blockUntil).toLocaleString()}`,
      );
    } else {
      setError(
        `❌ Credenciales incorrectas. Intentos: ${currentAttempts}/${MAX_ATTEMPTS}`,
      );
    }

    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // 🔧 Probar conexión manualmente
  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}health`);
      if (response.ok) {
        setApiStatus("online");
        setError("✅ Conexión exitosa con la API");
      } else {
        setApiStatus("offline");
        setError("❌ API no responde correctamente");
      }
    } catch {
      setApiStatus("offline");
      setError("❌ No se pudo conectar a la API");
    } finally {
      setLoading(false);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-gray-900 via-gray-950 to-black overflow-hidden">
      {/* 🌌 Fondo con efectos */}
      <div className="absolute inset-0">
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

      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-red-800/5" />

      {/* 🎴 Tarjeta de Login */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-6xl mx-4"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 👈 Panel Izquierdo */}
          <div className="w-full lg:w-2/5">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-2xl blur opacity-30" />

              <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden h-full">
                {/* 📋 Header del Panel */}
                <div className="relative p-6 border-b border-gray-800">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-red-800/5" />
                  <div className="relative flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                        apiStatus === "online"
                          ? "bg-gradient-to-br from-green-600 to-green-800 shadow-green-900/50"
                          : apiStatus === "offline"
                            ? "bg-gradient-to-br from-red-600 to-red-800 shadow-red-900/50"
                            : "bg-gradient-to-br from-amber-600 to-amber-800 shadow-amber-900/50"
                      }`}
                    >
                      <Server className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-white">
                        Estado del Sistema
                      </h2>
                      <p className="text-gray-400 text-sm">
                        {apiStatus === "online"
                          ? "Conectado a la API"
                          : apiStatus === "offline"
                            ? "Modo local activado"
                            : "Verificando conexión..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 📊 Información de Conexión */}
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Servidor:</span>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            apiStatus === "online"
                              ? "bg-green-500 animate-pulse"
                              : apiStatus === "offline"
                                ? "bg-red-500"
                                : "bg-amber-500"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            apiStatus === "online"
                              ? "text-green-400"
                              : apiStatus === "offline"
                                ? "text-red-400"
                                : "text-amber-400"
                          }`}
                        >
                          {apiStatus === "online"
                            ? "En línea"
                            : apiStatus === "offline"
                              ? "Sin conexión"
                              : "Verificando"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Endpoint:</span>
                      <span className="text-gray-300 text-sm font-mono truncate ml-2">
                        {API_URL.replace("https://", "")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Modo:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          apiStatus === "online"
                            ? "bg-green-900/30 text-green-400 border border-green-800/50"
                            : "bg-red-900/30 text-red-400 border border-red-800/50"
                        }`}
                      >
                        {apiStatus === "online" ? "API Remota" : "Local"}
                      </span>
                    </div>
                  </div>

                  {/* 🔧 Botón de prueba de conexión */}
                  <button
                    onClick={testConnection}
                    disabled={loading || !connectionTested}
                    className="w-full py-2 px-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Probando...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        <span className="text-sm">Probar conexión</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 👥 Usuarios Disponibles */}
                <div className="p-6 border-t border-gray-800">
                  <h3 className="text-white font-semibold mb-3">
                    Usuarios Disponibles
                  </h3>
                  <div className="space-y-2">
                    {[
                      { username: "admin", role: "Supervisor", icon: "👔" },
                      { username: "ventas", role: "Ventas", icon: "📊" },
                      { username: "oscar", role: "Desarrollador", icon: "👨‍💻" },
                    ].map((userObj) => (
                      <button
                        key={userObj.username}
                        onClick={() =>
                          handleUserSelect(userObj.username, userObj.role)
                        }
                        className={`w-full p-3 rounded-lg text-left transition ${
                          selectedUser?.username === userObj.username
                            ? "bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-700/50"
                            : "bg-gray-900/30 border border-gray-800 hover:bg-gray-800/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{userObj.icon}</span>
                          <div>
                            <p className="text-white font-medium">
                              {userObj.username}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {userObj.role}
                            </p>
                          </div>
                          {selectedUser?.username === userObj.username && (
                            <CheckCircle className="ml-auto w-4 h-4 text-green-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 📊 Información de Seguridad */}
                <div className="p-6 border-t border-gray-800">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Sesión máxima:</span>
                      <span className="text-amber-400">8 horas</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Encriptación:</span>
                      <span className="text-green-400">AES-256</span>
                    </div>
                    {failedAttempts > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          Intentos fallidos:
                        </span>
                        <span
                          className={`font-semibold ${failedAttempts >= 3 ? "text-red-400" : "text-amber-400"}`}
                        >
                          {failedAttempts}/3
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 👉 Panel Derecho - Formulario */}
          <div className="w-full lg:w-3/5">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-2xl blur opacity-30" />

              <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
                {/* 🏢 Header */}
                <div className="relative p-8 border-b border-gray-800">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-red-800/5" />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/50">
                          <Shield className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white mb-1">
                          Panel Administrativo PuntoG
                        </h1>
                        <p className="text-gray-400 text-sm">
                          Sistema de autenticación seguro{" "}
                          {apiStatus === "online"
                            ? "con API remota"
                            : "en modo local"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 📝 Formulario */}
                <form onSubmit={handleLogin} className="p-8 space-y-6">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-xl border flex items-start gap-3 ${
                          error.includes("bloqueado") ||
                          error.includes("Demasiados")
                            ? "bg-red-900/30 border-red-700/50"
                            : error.includes("incorrectas")
                              ? "bg-amber-900/20 border-amber-700/50"
                              : error.includes("✅") ||
                                  error.includes("exitosa")
                                ? "bg-green-900/20 border-green-700/50"
                                : "bg-red-900/20 border-red-800"
                        } ${shake ? "animate-shake" : ""}`}
                      >
                        {error.includes("✅") || error.includes("exitosa") ? (
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : error.includes("bloqueado") ? (
                          <Ban className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              error.includes("✅") || error.includes("exitosa")
                                ? "text-green-300"
                                : error.includes("bloqueado") ||
                                    error.includes("Demasiados")
                                  ? "text-red-300"
                                  : error.includes("incorrectas")
                                    ? "text-amber-300"
                                    : "text-red-300"
                            }`}
                          >
                            {error}
                          </p>
                          {failedAttempts > 0 &&
                            !error.includes("bloqueado") &&
                            !error.includes("Demasiados") && (
                              <p className="text-gray-400 text-xs mt-1">
                                {3 - failedAttempts > 0
                                  ? `Te quedan ${3 - failedAttempts} intento${failedAttempts === 2 ? "" : "s"} antes del bloqueo`
                                  : "Último intento antes del bloqueo"}
                              </p>
                            )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ✍️ Campos de Credenciales */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 👤 Usuario */}
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
                          onChange={(e) => setUser(e.target.value)}
                          className="relative w-full px-4 py-3 pl-12 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                          placeholder="Ingresa tu usuario"
                          disabled={loading || blockedTime}
                          autoComplete="username"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                    </div>

                    {/* 🔐 Contraseña */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Key className="w-4 h-4 text-gray-400" />
                        Contraseña
                        {password.length > 0 && (
                          <span className="text-xs text-gray-500 ml-auto">
                            {securityLevel <= 1
                              ? "Débil"
                              : securityLevel <= 2
                                ? "Regular"
                                : securityLevel <= 3
                                  ? "Buena"
                                  : "Excelente"}
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
                          disabled={loading || blockedTime}
                          autoComplete="current-password"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <Lock className="w-5 h-5 text-gray-500" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                          disabled={loading || blockedTime}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* 📊 Barra de Seguridad */}
                      {password.length > 0 && (
                        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(securityLevel / 4) * 100}%` }}
                            className={`h-full rounded-full transition-colors ${
                              securityLevel <= 1
                                ? "bg-red-500"
                                : securityLevel <= 2
                                  ? "bg-amber-500"
                                  : securityLevel <= 3
                                    ? "bg-green-500"
                                    : "bg-emerald-500"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 🚀 Botón de Login */}
                  <motion.button
                    type="submit"
                    disabled={loading || blockedTime}
                    whileHover={{ scale: blockedTime ? 1 : 1.02 }}
                    whileTap={{ scale: blockedTime ? 1 : 0.98 }}
                    className={`w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all ${
                      loading || blockedTime
                        ? "bg-gray-800 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-800 shadow-lg hover:shadow-red-900/50"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-white">
                          {apiStatus === "online"
                            ? "Conectando a API..."
                            : "Verificando..."}
                        </span>
                      </>
                    ) : blockedTime ? (
                      <>
                        <Clock className="w-5 h-5" />
                        <span className="text-white">Usuario Bloqueado</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span className="text-white">
                          Iniciar Sesión Segura
                        </span>
                      </>
                    )}
                  </motion.button>

                  {/* 🛡️ Información de Seguridad */}
                  <div className="pt-6 border-t border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Encriptación AES-256</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3 h-3" />
                        <span>
                          {apiStatus === "online" ? "API Remota" : "Modo Local"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        <span>3 intentos máx.</span>
                      </div>
                    </div>
                  </div>
                </form>

                {/* 📄 Footer */}
                <div className="px-8 py-4 bg-gradient-to-r from-gray-900/50 to-gray-950/50 border-t border-gray-800">
                  <p className="text-center text-xs text-gray-500">
                    🔐 Sistema seguro •{" "}
                    {apiStatus === "online" ? "API Conectada" : "Modo Local"} •
                    Bloqueo anti-intentos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🎬 CSS para animación shake */}
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
//   Clock,
//   Ban,
//   CheckCircle,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// // 🔒 USUARIOS OFUSCADOS EN BASE64
// const AUTHORIZED_USERS = (() => {
//   const encodedUsers = [
//     "YWRtaW46YWRtaW4xMjM6U3VwZXJ2aXNvcg==", // admin:admin123:Supervisor
//     "dmVudGFzOnZlbnRhczEyMzpWZW50YXM=", // ventas:ventas123:Ventas
//     "b3NjYXI6ODExMDEyOkRlc2Fycm9sbGFkb3I=", // oscar:811012:Desarrollador
//   ];

//   return encodedUsers.map((encoded) => {
//     const decoded = atob(encoded);
//     const [username, password, role] = decoded.split(":");

//     return {
//       username,
//       password,
//       role,
//       icon: username === "admin" ? "👔" : username === "ventas" ? "📊" : "👨‍💻",
//       visible: username !== "oscar",
//     };
//   });
// })();

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
//   const [blockedTime, setBlockedTime] = useState(0);
//   const [failedAttempts, setFailedAttempts] = useState(0);
//   const navigate = useNavigate();

//   // 🕒 VERIFICAR BLOQUEOS AL CAMBIAR USUARIO
//   useEffect(() => {
//     if (!user) return;

//     const checkBlock = () => {
//       const blockKey = `block_${user}`;
//       const attemptsKey = `attempts_${user}`;
//       const now = Date.now();

//       const blockUntil = localStorage.getItem(blockKey);
//       const attempts = parseInt(localStorage.getItem(attemptsKey) || "0");

//       setFailedAttempts(attempts);

//       if (blockUntil && now < parseInt(blockUntil)) {
//         const minutesLeft = Math.ceil((parseInt(blockUntil) - now) / 60000);
//         setBlockedTime(parseInt(blockUntil));
//         setError(
//           `⏳ Usuario bloqueado. Espera ${minutesLeft} minuto${minutesLeft > 1 ? "s" : ""}.`,
//         );
//       } else if (blockUntil) {
//         // Bloqueo expirado, limpiar
//         localStorage.removeItem(blockKey);
//         localStorage.removeItem(attemptsKey);
//         setBlockedTime(0);
//         setFailedAttempts(0);
//         setError("");
//       }
//     };

//     checkBlock();
//   }, [user]);

//   // 🕒 CONTADOR DE BLOQUEO
//   useEffect(() => {
//     if (!blockedTime) return;

//     const timer = setInterval(() => {
//       const now = Date.now();
//       if (now >= blockedTime) {
//         setBlockedTime(0);
//         setError("");
//         localStorage.removeItem(`block_${user}`);
//         localStorage.removeItem(`attempts_${user}`);
//         clearInterval(timer);
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [blockedTime, user]);

//   // 🧹 LIMPIAR SESIONES VIEJAS AL ENTRAR
//   useEffect(() => {
//     const cleanOldSessions = () => {
//       const authData = localStorage.getItem("admin_auth");
//       if (authData) {
//         try {
//           const parsed = JSON.parse(authData);
//           if (Date.now() > parsed.expiresAt) {
//             localStorage.removeItem("admin_auth");
//             console.log("🔄 Sesión expirada removida");
//           }
//         } catch (e) {
//           localStorage.removeItem("admin_auth");
//         }
//       }
//     };

//     cleanOldSessions();
//     document.title = "Panel Admin | PuntoG";

//     // Verificar modo desarrollador
//     const isDeveloper =
//       localStorage.getItem("developer_mode") === "true" ||
//       window.location.search.includes("dev=true");
//     setDeveloperMode(isDeveloper);
//   }, []);

//   // 📊 NIVEL DE SEGURIDAD DE CONTRASEÑA
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

//   // 👤 AUTO-COMPLETAR CREDENCIALES
//   const handleUserSelect = (userObj) => {
//     if (blockedTime && Date.now() < blockedTime) {
//       setError("Este usuario está temporalmente bloqueado");
//       return;
//     }

//     setSelectedUser(userObj);
//     setUser(userObj.username);
//     setPassword(""); // 🔒 NO autocompletar contraseña por seguridad
//     setError("");
//   };

//   // ⌨️ ACCESO DIRECTO DESARROLLADOR (Ctrl+Shift+O)
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.ctrlKey && e.shiftKey && e.key === "O") {
//         e.preventDefault();
//         setDeveloperMode(true);
//         localStorage.setItem("developer_mode", "true");
//         setUser("oscar");
//         setPassword("");
//         setSelectedUser({
//           username: "oscar",
//           role: "Desarrollador",
//           icon: "👨‍💻",
//         });
//         setError("Modo desarrollador activado");
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   // 🔐 FUNCIÓN PRINCIPAL DE LOGIN
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setShake(false);

//     // 🔒 VERIFICAR BLOQUEO
//     if (blockedTime && Date.now() < blockedTime) {
//       const minutesLeft = Math.ceil((blockedTime - Date.now()) / 60000);
//       setError(
//         `⏳ Usuario bloqueado. Espera ${minutesLeft} minuto${minutesLeft > 1 ? "s" : ""}.`,
//       );
//       setShake(true);
//       setTimeout(() => setShake(false), 500);
//       return;
//     }

//     // ✅ VALIDACIÓN BÁSICA
//     if (!user.trim() || !password.trim()) {
//       setError("Completa todos los campos");
//       setShake(true);
//       setTimeout(() => setShake(false), 500);
//       return;
//     }

//     setLoading(true);

//     // ⏳ DELAY PARA MEJOR UX Y SEGURIDAD
//     await new Promise((resolve) => setTimeout(resolve, 800));

//     try {
//       // 🔍 VERIFICAR CREDENCIALES
//       const validUser = AUTHORIZED_USERS.find(
//         (u) => u.username === user && u.password === password,
//       );

//       if (validUser) {
//         // 🎉 LOGIN EXITOSO
//         // Limpiar intentos fallidos
//         localStorage.removeItem(`attempts_${user}`);
//         localStorage.removeItem(`block_${user}`);

//         // 📝 GUARDAR AUTENTICACIÓN SEGURA
//         const authData = {
//           user: validUser.username,
//           role: validUser.role,
//           icon: validUser.icon,
//           loginTime: Date.now(),
//           expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 horas
//           sessionId:
//             Math.random().toString(36).substring(2) + Date.now().toString(36),
//         };

//         localStorage.setItem("admin_auth", JSON.stringify(authData));

//         // 📊 REGISTRO DE ACCESO
//         console.log("✅ Login exitoso:", {
//           usuario: validUser.username,
//           rol: validUser.role,
//           hora: new Date().toLocaleTimeString(),
//           sesión: authData.sessionId,
//           expira: new Date(authData.expiresAt).toLocaleString(),
//         });

//         // 🚀 REDIRIGIR AL DASHBOARD
//         setTimeout(() => {
//           navigate("/admin/dashboard", {
//             replace: true,
//             state: {
//               from: "login",
//               timestamp: Date.now(),
//               user: validUser.username,
//               role: validUser.role,
//               sessionId: authData.sessionId,
//             },
//           });
//         }, 300);
//       } else {
//         // ❌ LOGIN FALLIDO
//         const attemptsKey = `attempts_${user}`;
//         const currentAttempts =
//           parseInt(localStorage.getItem(attemptsKey) || "0") + 1;
//         localStorage.setItem(attemptsKey, currentAttempts.toString());
//         setFailedAttempts(currentAttempts);

//         if (currentAttempts >= 3) {
//           // 🔒 BLOQUEAR POR 15 MINUTOS
//           const blockUntil = Date.now() + 15 * 60 * 1000;
//           localStorage.setItem(`block_${user}`, blockUntil.toString());
//           setBlockedTime(blockUntil);
//           setError(
//             `🔒 Demasiados intentos fallidos. Usuario bloqueado por 15 minutos.`,
//           );
//           console.warn(
//             `🚫 Usuario ${user} bloqueado hasta: ${new Date(blockUntil).toLocaleString()}`,
//           );
//         } else {
//           setError(
//             `❌ Credenciales incorrectas. Intentos: ${currentAttempts}/3`,
//           );
//         }

//         setShake(true);
//         setTimeout(() => setShake(false), 500);
//       }
//     } catch (err) {
//       console.error("🔥 Error crítico en login:", err);
//       setError("⚠️ Error en el sistema. Intenta más tarde.");
//       setShake(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✨ COMPONENTE DE PARTÍCULAS DE FONDO
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

//   // 👥 FILTRAR USUARIOS VISIBLES
//   const visibleUsers = AUTHORIZED_USERS.filter((user) => user.visible);

//   return (
//     <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-gray-900 via-gray-950 to-black overflow-hidden">
//       {/* 🌌 FONDO CON EFECTOS */}
//       <BackgroundParticles />

//       <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-red-800/5" />
//       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
//       <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />

//       {/* 🎴 TARJETA DE LOGIN */}
//       <motion.div
//         initial={{ opacity: 0, y: 20, scale: 0.95 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.5 }}
//         className="relative z-10 w-full max-w-4xl mx-4 flex flex-col lg:flex-row gap-8"
//       >
//         {/* 👈 PANEL IZQUIERDO: SELECCIÓN DE USUARIO */}
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//           className="w-full lg:w-1/3"
//         >
//           <div className="relative">
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-2xl blur opacity-30" />

//             <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden h-full">
//               {/* 📋 HEADER DEL PANEL */}
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
//               </div>

//               {/* 📝 LISTA DE USUARIOS VISIBLES */}
//               <div className="p-6 space-y-3">
//                 {visibleUsers.map((userObj) => (
//                   <motion.button
//                     key={userObj.username}
//                     type="button"
//                     onClick={() => handleUserSelect(userObj)}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     className={`w-full p-4 rounded-xl transition-all border ${
//                       selectedUser?.username === userObj.username
//                         ? "bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-700"
//                         : "bg-gray-900/50 border-gray-800 hover:bg-gray-800/50"
//                     } ${blockedTime && user === userObj.username ? "opacity-50 cursor-not-allowed" : ""}`}
//                     disabled={blockedTime && user === userObj.username}
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
//                       <div className="text-left flex-1">
//                         <p className="text-white font-medium">
//                           {userObj.username}
//                         </p>
//                         <p className="text-gray-400 text-sm">{userObj.role}</p>
//                       </div>

//                       {/* 🔴 INDICADOR DE BLOQUEO */}
//                       {blockedTime && user === userObj.username && (
//                         <div className="flex items-center gap-2">
//                           <Ban className="w-4 h-4 text-red-400" />
//                           <span className="text-xs text-red-400">
//                             Bloqueado
//                           </span>
//                         </div>
//                       )}

//                       {/* 🟢 INDICADOR DE SELECCIÓN */}
//                       {selectedUser?.username === userObj.username &&
//                         !blockedTime && (
//                           <div className="ml-auto">
//                             <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
//                           </div>
//                         )}
//                     </div>
//                   </motion.button>
//                 ))}

//                 {/* 👨‍💻 ACCESO DESARROLLADOR (OCULTO POR DEFECTO) */}
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
//                       onClick={() => {
//                         setUser("oscar");
//                         setPassword("");
//                         setSelectedUser({
//                           username: "oscar",
//                           role: "Desarrollador",
//                           icon: "👨‍💻",
//                         });
//                       }}
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       className="w-full p-4 rounded-xl transition-all border border-blue-700/30 bg-gradient-to-r from-blue-900/20 to-blue-800/10 hover:from-blue-800/30 hover:to-blue-700/20"
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

//               {/* 📊 INFORMACIÓN DE USUARIOS */}
//               <div className="p-6 border-t border-gray-800">
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-400">Usuarios activos:</span>
//                     <span className="text-green-400 font-semibold">
//                       {visibleUsers.length}
//                     </span>
//                   </div>

//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-400">Sesión máxima:</span>
//                     <span className="text-amber-400">8 horas</span>
//                   </div>

//                   {failedAttempts > 0 && (
//                     <div className="flex items-center justify-between text-sm">
//                       <span className="text-gray-400">Intentos fallidos:</span>
//                       <span
//                         className={`font-semibold ${failedAttempts >= 3 ? "text-red-400" : "text-amber-400"}`}
//                       >
//                         {failedAttempts}/3
//                       </span>
//                     </div>
//                   )}
//                 </div>

//                 {/* 🔵 INDICADOR MODO DESARROLLADOR */}
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

//         {/* 👉 PANEL DERECHO: FORMULARIO */}
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5, delay: 0.3 }}
//           className="w-full lg:w-2/3"
//         >
//           <div className="relative">
//             {/* 🌈 EFECTO DE BORDE ANIMADO */}
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-700 rounded-2xl blur opacity-30" />

//             <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
//               {/* 🏢 HEADER */}
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
//                         Panel Administrativo
//                       </h1>
//                       <p className="text-gray-400 text-sm">
//                         {selectedUser
//                           ? `Acceso como: ${selectedUser.role}`
//                           : developerMode
//                             ? "Modo desarrollador activo"
//                             : "Selecciona un usuario o ingresa manualmente"}
//                       </p>
//                     </div>
//                   </div>

//                   {/* 👤 INFO USUARIO SELECCIONADO */}
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
//                           </p>
//                         </div>
//                         {blockedTime && (
//                           <Clock className="w-4 h-4 text-red-400 ml-2" />
//                         )}
//                       </div>
//                     </motion.div>
//                   )}
//                 </div>
//               </div>

//               {/* 📝 FORMULARIO */}
//               <form onSubmit={handleLogin} className="p-8 space-y-6">
//                 <AnimatePresence>
//                   {error && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       className={`p-4 rounded-xl border flex items-start gap-3 ${
//                         error.includes("bloqueado")
//                           ? "bg-red-900/30 border-red-700/50"
//                           : error.includes("incorrectas")
//                             ? "bg-amber-900/20 border-amber-700/50"
//                             : "bg-red-900/20 border-red-800"
//                       } ${shake ? "animate-shake" : ""}`}
//                     >
//                       {error.includes("bloqueado") ? (
//                         <Ban className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
//                       ) : (
//                         <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
//                       )}
//                       <div className="flex-1">
//                         <p
//                           className={`text-sm font-medium ${
//                             error.includes("bloqueado")
//                               ? "text-red-300"
//                               : error.includes("incorrectas")
//                                 ? "text-amber-300"
//                                 : "text-red-300"
//                           }`}
//                         >
//                           {error}
//                         </p>
//                         {failedAttempts > 0 && !error.includes("bloqueado") && (
//                           <p className="text-gray-400 text-xs mt-1">
//                             {3 - failedAttempts > 0
//                               ? `Te quedan ${3 - failedAttempts} intento${failedAttempts === 2 ? "" : "s"} antes del bloqueo`
//                               : "Último intento antes del bloqueo"}
//                           </p>
//                         )}
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* 👨‍💻 INFO MODO DESARROLLADOR */}
//                 {developerMode && selectedUser?.username === "oscar" && (
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="p-3 bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-800/30 rounded-xl"
//                   >
//                     <div className="flex items-center gap-2 text-blue-300 text-sm">
//                       <Code className="w-4 h-4" />
//                       <span>Acceso de desarrollador activado</span>
//                     </div>
//                   </motion.div>
//                 )}

//                 {/* ✍️ CAMPOS DE CREDENCIALES */}
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   {/* 👤 USUARIO */}
//                   <div className="space-y-2">
//                     <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
//                       <User className="w-4 h-4 text-gray-400" />
//                       Usuario
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
//                           }
//                         }}
//                         className={`relative w-full px-4 py-3 pl-12 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all ${
//                           blockedTime
//                             ? "border-red-700/50 cursor-not-allowed"
//                             : "border-gray-800"
//                         }`}
//                         placeholder={
//                           blockedTime
//                             ? "Usuario bloqueado"
//                             : "Ingresa tu usuario"
//                         }
//                         disabled={
//                           loading || (blockedTime && Date.now() < blockedTime)
//                         }
//                         autoComplete="username"
//                       />
//                       <div className="absolute left-4 top-1/2 -translate-y-1/2">
//                         {blockedTime ? (
//                           <Ban className="w-5 h-5 text-red-500" />
//                         ) : (
//                           <User className="w-5 h-5 text-gray-500" />
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* 🔐 CONTRASEÑA */}
//                   <div className="space-y-2">
//                     <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
//                       <Key className="w-4 h-4 text-gray-400" />
//                       Contraseña
//                       {password.length > 0 && (
//                         <span className="text-xs text-gray-500 ml-auto">
//                           {securityLevel <= 1
//                             ? "Débil"
//                             : securityLevel <= 2
//                               ? "Regular"
//                               : securityLevel <= 3
//                                 ? "Buena"
//                                 : "Excelente"}
//                         </span>
//                       )}
//                     </label>
//                     <div className="relative group">
//                       <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
//                       <input
//                         type={showPassword ? "text" : "password"}
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className={`relative w-full px-4 py-3 pl-12 pr-12 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all ${
//                           blockedTime
//                             ? "border-red-700/50 cursor-not-allowed"
//                             : "border-gray-800"
//                         }`}
//                         placeholder={blockedTime ? "••••••••" : "••••••••"}
//                         disabled={
//                           loading || (blockedTime && Date.now() < blockedTime)
//                         }
//                         autoComplete="current-password"
//                       />
//                       <div className="absolute left-4 top-1/2 -translate-y-1/2">
//                         {blockedTime ? (
//                           <Ban className="w-5 h-5 text-red-500" />
//                         ) : (
//                           <Lock className="w-5 h-5 text-gray-500" />
//                         )}
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
//                         disabled={loading || blockedTime}
//                       >
//                         {showPassword ? (
//                           <EyeOff className="w-5 h-5" />
//                         ) : (
//                           <Eye className="w-5 h-5" />
//                         )}
//                       </button>
//                     </div>

//                     {/* 📊 BARRA DE SEGURIDAD */}
//                     {password.length > 0 && (
//                       <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
//                         <motion.div
//                           initial={{ width: 0 }}
//                           animate={{ width: `${(securityLevel / 4) * 100}%` }}
//                           className={`h-full rounded-full transition-colors ${
//                             securityLevel <= 1
//                               ? "bg-red-500"
//                               : securityLevel <= 2
//                                 ? "bg-amber-500"
//                                 : securityLevel <= 3
//                                   ? "bg-green-500"
//                                   : "bg-emerald-500"
//                           }`}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* 🚀 BOTÓN DE LOGIN */}
//                 <motion.button
//                   type="submit"
//                   disabled={
//                     loading || (blockedTime && Date.now() < blockedTime)
//                   }
//                   whileHover={{ scale: blockedTime ? 1 : 1.02 }}
//                   whileTap={{ scale: blockedTime ? 1 : 0.98 }}
//                   className={`w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all ${
//                     loading || blockedTime
//                       ? "bg-gray-800 cursor-not-allowed"
//                       : user === "oscar"
//                         ? "bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg hover:shadow-blue-900/50"
//                         : "bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-800 shadow-lg hover:shadow-red-900/50"
//                   }`}
//                 >
//                   {loading ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       <span className="text-white">Verificando...</span>
//                     </>
//                   ) : blockedTime ? (
//                     <>
//                       <Clock className="w-5 h-5" />
//                       <span className="text-white">Usuario Bloqueado</span>
//                     </>
//                   ) : user === "oscar" ? (
//                     <>
//                       <Code className="w-5 h-5" />
//                       <span className="text-white">Acceso Desarrollador</span>
//                     </>
//                   ) : (
//                     <>
//                       <LogIn className="w-5 h-5" />
//                       <span className="text-white">
//                         {selectedUser
//                           ? `Acceder como ${selectedUser.username}`
//                           : "Iniciar Sesión"}
//                       </span>
//                     </>
//                   )}
//                 </motion.button>

//                 {/* ⌨️ ATAJO DE TECLADO */}
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

//                 {/* 🛡️ INFORMACIÓN DE SEGURIDAD */}
//                 <div className="pt-6 border-t border-gray-800">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
//                     <div className="flex items-center gap-2">
//                       <Building2 className="w-3 h-3" />
//                       <span>PuntoG Admin v2.0</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Cpu className="w-3 h-3" />
//                       <span>Sesión: 8 horas</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Users className="w-3 h-3" />
//                       <span>Protección activa</span>
//                     </div>
//                   </div>
//                 </div>
//               </form>

//               {/* 📄 FOOTER */}
//               <div className="px-8 py-4 bg-gradient-to-r from-gray-900/50 to-gray-950/50 border-t border-gray-800">
//                 <p className="text-center text-xs text-gray-500">
//                   🔐 Sistema de autenticación seguro • Bloqueo anti-intentos •
//                   Sesión limitada
//                 </p>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </motion.div>

//       {/* 🎬 CSS PARA ANIMACIÓN SHAKE */}
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
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// // Usuarios autorizados - Oscar es oculto pero tiene acceso
// const AUTHORIZED_USERS = [
//   {
//     username: "admin",
//     password: "admin123",
//     role: "Supervisor",
//     icon: "👔",
//     visible: true,
//   },
//   {
//     username: "ventas",
//     password: "ventas123",
//     role: "Ventas",
//     icon: "📊",
//     visible: true,
//   },
//   // Oscar es oculto pero tiene acceso directo
//   {
//     username: "oscar",
//     password: "811012",
//     role: "Desarrollador",
//     icon: "👨‍💻",
//     visible: false,
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
//   const navigate = useNavigate();

//   // Forzar cierre de sesión al entrar
//   useEffect(() => {
//     localStorage.removeItem("admin_token");
//     document.title = "Panel Admin | PuntoG";

//     // Verificar si es el programador por IP o userAgent (opcional)
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
//     } else {
//       setSecurityLevel(3);
//     }
//   }, [password]);

//   // Auto-completar credenciales al seleccionar usuario visible
//   const handleUserSelect = (userObj) => {
//     setSelectedUser(userObj);
//     setUser(userObj.username);
//     setPassword(userObj.password);
//     setError("");
//   };

//   // Acceso directo para desarrollador (Ctrl+Shift+O)
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.ctrlKey && e.shiftKey && e.key === "O") {
//         e.preventDefault();
//         setDeveloperMode(true);
//         setUser("oscar");
//         setPassword("811012");
//         setSelectedUser({
//           username: "oscar",
//           role: "Desarrollador",
//           icon: "👨‍💻",
//         });
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

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

//     setLoading(true);

//     // Simular un pequeño delay para mejor UX
//     await new Promise((resolve) => setTimeout(resolve, 800));

//     try {
//       // Verificar credenciales con todos los usuarios (incluyendo Oscar)
//       const validUser = AUTHORIZED_USERS.find(
//         (u) => u.username === user && u.password === password,
//       );

//       if (validUser) {
//         // Generar token seguro con información del usuario
//         const tokenData = {
//           value: btoa(`${validUser.username}:${Date.now()}`),
//           expires: Date.now() + 1000 * 60 * 60, // 1 hora
//           issued: Date.now(),
//           user: validUser.username,
//           role: validUser.role,
//           icon: validUser.icon,
//         };

//         localStorage.setItem("admin_token", JSON.stringify(tokenData));

//         // Registro de acceso
//         const accessLog = {
//           user: validUser.username,
//           role: validUser.role,
//           timestamp: new Date().toISOString(),
//           ip: "127.0.0.1",
//           userAgent: navigator.userAgent,
//         };

//         console.log("Acceso registrado:", accessLog);

//         // Animación de éxito antes de redirigir
//         setTimeout(() => {
//           navigate("/admin/dashboard", {
//             replace: true,
//             state: {
//               from: "login",
//               timestamp: Date.now(),
//               user: validUser.username,
//               role: validUser.role,
//             },
//           });
//         }, 300);
//       } else {
//         setError("Credenciales incorrectas. Intenta nuevamente.");
//         setShake(true);
//         setTimeout(() => setShake(false), 500);
//       }
//     } catch (err) {
//       setError("Error en el sistema. Intenta más tarde.");
//       setShake(true);
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
//   const visibleUsers = AUTHORIZED_USERS.filter((user) => user.visible);

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
//                     className={`w-full p-4 rounded-xl transition-all border ${
//                       selectedUser?.username === userObj.username
//                         ? "bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-700"
//                         : "bg-gray-900/50 border-gray-800 hover:bg-gray-800/50"
//                     }`}
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

//                 {/* Espacio para acceso de desarrollador (solo visible si activado) */}
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
//                       onClick={() => {
//                         setUser("oscar");
//                         setPassword("811012");
//                         setSelectedUser({
//                           username: "oscar",
//                           role: "Desarrollador",
//                           icon: "👨‍💻",
//                         });
//                       }}
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       className="w-full p-4 rounded-xl transition-all border border-blue-700/30 bg-gradient-to-r from-blue-900/20 to-blue-800/10"
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

//               {/* Información de usuarios */}
//               <div className="p-6 border-t border-gray-800">
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-400">Usuarios activos:</span>
//                     <span className="text-green-400 font-semibold">
//                       {visibleUsers.length}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-gray-400">Tiempo de sesión:</span>
//                     <span className="text-amber-400">60 min</span>
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
//                         Panel Administrativo
//                       </h1>
//                       <p className="text-gray-400 text-sm">
//                         {selectedUser
//                           ? `Acceso como: ${selectedUser.role}`
//                           : developerMode
//                             ? "Modo desarrollador activo"
//                             : "Selecciona un usuario o ingresa manualmente"}
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
//                         error.includes("correctas")
//                           ? "bg-red-900/20 border-red-800"
//                           : "bg-amber-900/20 border-amber-800"
//                       } flex items-start gap-3 ${shake ? "animate-shake" : ""}`}
//                     >
//                       <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
//                       <div>
//                         <p className="text-red-300 text-sm font-medium">
//                           {error}
//                         </p>
//                         {error.includes("correctas") && (
//                           <p className="text-red-400/70 text-xs mt-1">
//                             Verifica las credenciales e intenta nuevamente
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
//                       <span>Acceso de desarrollador activado</span>
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
//                     </label>
//                     <div className="relative group">
//                       <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
//                       <input
//                         type="text"
//                         value={user}
//                         onChange={(e) => {
//                           setUser(e.target.value);
//                           // Si el usuario es "oscar", activar modo desarrollador
//                           if (e.target.value === "oscar") {
//                             setDeveloperMode(true);
//                           }
//                         }}
//                         className="relative w-full px-4 py-3 pl-12 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
//                         placeholder="Ingresa tu usuario"
//                         disabled={loading}
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
//                           Nivel de seguridad:{" "}
//                           {securityLevel === 0
//                             ? "❌"
//                             : securityLevel === 1
//                               ? "⚠️"
//                               : securityLevel === 2
//                                 ? "✅"
//                                 : "🔒"}
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
//                         disabled={loading}
//                         autoComplete="current-password"
//                       />
//                       <div className="absolute left-4 top-1/2 -translate-y-1/2">
//                         <Lock className="w-5 h-5 text-gray-500" />
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
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
//                       <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
//                         <motion.div
//                           initial={{ width: 0 }}
//                           animate={{ width: `${(securityLevel / 3) * 100}%` }}
//                           className={`h-full rounded-full ${
//                             securityLevel === 1
//                               ? "bg-red-500"
//                               : securityLevel === 2
//                                 ? "bg-amber-500"
//                                 : securityLevel === 3
//                                   ? "bg-green-500"
//                                   : ""
//                           }`}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Botón de Login */}
//                 <motion.button
//                   type="submit"
//                   disabled={loading}
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   className={`w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all ${
//                     loading
//                       ? "bg-gray-800 cursor-not-allowed"
//                       : user === "oscar"
//                         ? "bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg hover:shadow-blue-900/50"
//                         : "bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-600 hover:to-red-800 shadow-lg hover:shadow-red-900/50"
//                   }`}
//                 >
//                   {loading ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       <span className="text-white">Verificando...</span>
//                     </>
//                   ) : user === "oscar" ? (
//                     <>
//                       <Code className="w-5 h-5" />
//                       <span className="text-white">Acceso Desarrollador</span>
//                     </>
//                   ) : (
//                     <>
//                       <LogIn className="w-5 h-5" />
//                       <span className="text-white">
//                         {selectedUser
//                           ? `Acceder como ${selectedUser.username}`
//                           : "Iniciar Sesión"}
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
//                       <span>PuntoG Admin v1.0</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Cpu className="w-3 h-3" />
//                       <span>Sesión: 60 min</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Users className="w-3 h-3" />
//                       <span>{visibleUsers.length} usuarios activos</span>
//                     </div>
//                   </div>
//                 </div>
//               </form>

//               {/* Footer del card */}
//               <div className="px-8 py-4 bg-gradient-to-r from-gray-900/50 to-gray-950/50 border-t border-gray-800">
//                 <p className="text-center text-xs text-gray-500">
//                   🔐 Acceso restringido • Todos los intentos son registrados
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
