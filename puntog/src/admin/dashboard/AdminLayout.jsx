import {
  NavLink,
  Outlet,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  LogOut,
  Package,
  BarChart3,
  Mail,
  PlusCircle,
  Trash2,
  Settings,
  User,
  Bell,
  Search,
  Home,
  Users,
  ShoppingBag,
  Tag,
  Shield,
  Clock,
  Menu,
  X,
  ChevronDown,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState(60);
  const [notifications] = useState([
    { id: 1, message: "Nuevo pedido #1234", time: "2 min ago", read: false },
    {
      id: 2,
      message: "Producto agotado: Lencería Roja",
      time: "1 hora ago",
      read: true,
    },
    {
      id: 3,
      message: "Mensaje de contacto nuevo",
      time: "3 horas ago",
      read: false,
    },
  ]);

  // 🔐 VALIDACIÓN SEGURA DEL TOKEN
  let token = null;
  let userData = null;

  try {
    const stored = localStorage.getItem("admin_token");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.expires && parsed.expires > Date.now()) {
        token = parsed.value;
        userData = parsed.user || "Administrador";
      }
    }
  } catch (error) {
    token = null;
  }

  // Contador de sesión
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      setSessionTime((prev) => {
        if (prev <= 1) {
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Actualiza cada minuto

    return () => clearInterval(interval);
  }, [token]);

  // 🚫 SIN TOKEN → LOGIN
  if (!token) {
    localStorage.removeItem("admin_token");
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login", { replace: true });
  };

  const navItems = [
    {
      to: "dashboard",
      icon: <BarChart3 size={20} />,
      label: "Dashboard",
      badge: null,
    },
    {
      to: "pedidos",
      icon: <Package size={20} />,
      label: "Pedidos",
      badge: "12",
    },
    // {
    //   to: "productos",
    //   icon: <ShoppingBag size={20} />,
    //   label: "Productos",
    //   badge: null,
    // },
    {
      to: "nuevo_producto",
      icon: <PlusCircle size={20} />,
      label: "Nuevo Producto",
      badge: "new",
    },
    {
      to: "eliminar_producto",
      icon: <Trash2 size={20} />,
      label: "Gestionar Productos",
      badge: null,
    },
    { to: "contacto", icon: <Mail size={20} />, label: "Mensajes", badge: "3" },
    // {
    //   to: "usuarios",
    //   icon: <Users size={20} />,
    //   label: "Usuarios",
    //   badge: null,
    // },
    // {
    //   to: "categorias",
    //   icon: <Tag size={20} />,
    //   label: "Categorías",
    //   badge: null,
    // },
    // {
    //   to: "configuracion",
    //   icon: <Settings size={20} />,
    //   label: "Configuración",
    //   badge: null,
    // },
  ];

  const stats = [
    {
      label: "Ventas Hoy",
      value: "$1,240",
      icon: <DollarSign size={16} />,
      change: "+12%",
    },
    {
      label: "Pedidos Activos",
      value: "24",
      icon: <ShoppingCart size={16} />,
      change: "+5%",
    },
    {
      label: "Mensajes Nuevos",
      value: "8",
      icon: <MessageSquare size={16} />,
      change: "+18%",
    },
    {
      label: "Tasa Conversión",
      value: "3.2%",
      icon: <TrendingUp size={16} />,
      change: "+0.4%",
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-white text-gray-800">
      {/* MOBILE MENU TOGGLE */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* SIDEBAR */}
      <AnimatePresence>
        {(mobileMenuOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed md:relative z-40 w-72 h-screen bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col shadow-xl"
          >
            {/* LOGO */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 rounded-xl border-2 border-red-300/30"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Punto G Admin
                  </h2>
                  <p className="text-xs text-gray-600">
                    Panel Administrativo Premium
                  </p>
                </div>
              </div>
            </div>

            {/* USER INFO */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{userData}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={12} />
                    <span>Sesión: {sessionTime} min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* NAV */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    group relative flex items-center justify-between px-4 py-3 rounded-xl
                    transition-all duration-300 font-medium
                    ${
                      isActive
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
                        : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className={`${
                            isActive
                              ? "text-white"
                              : "text-gray-500 group-hover:text-red-600"
                          }`}
                        >
                          {item.icon}
                        </div>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`
                          px-2 py-1 text-xs font-bold rounded-full
                          ${
                            isActive
                              ? "bg-white text-red-600"
                              : "bg-red-100 text-red-600"
                          }
                        `}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute right-2 w-1 h-8 bg-white rounded-full"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* LOGOUT */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl
                         text-red-600 border-2 border-red-600 font-semibold
                         hover:bg-red-600 hover:text-white transition-all duration-300
                         hover:shadow-lg hover:shadow-red-600/30"
              >
                <LogOut size={20} />
                Cerrar sesión
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            {/* BREADCRUMB */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Panel Administrativo
              </h1>
              <nav className="flex items-center gap-2 text-sm text-gray-600">
                <button
                  onClick={() => navigate("/admin/dashboard")}
                  className="hover:text-red-600"
                >
                  <Home size={14} />
                </button>
                <span>/</span>
                <span className="font-medium text-gray-900">
                  {location.pathname.split("/").pop()?.replace("-", " ") ||
                    "Dashboard"}
                </span>
              </nav>
            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-4">
              {/* SEARCH */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en panel..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* NOTIFICATIONS */}
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100 transition">
                  <Bell size={20} />
                  {notifications.some((n) => !n.read) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                  )}
                </button>
              </div>

              {/* USER MENU */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                    <User size={20} className="text-red-600" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold">{userData}</p>
                    <p className="text-xs text-gray-600">Administrador</p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-2"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="font-semibold text-gray-900">
                          {userData}
                        </p>
                        <p className="text-sm text-gray-600">
                          admin@puntog.com
                        </p>
                      </div>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3">
                        <User size={16} />
                        Mi perfil
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3">
                        <Settings size={16} />
                        Configuración
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 border-t border-gray-200 mt-2"
                      >
                        <LogOut size={16} />
                        Cerrar sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* STATS BAR */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <div className="text-red-600">{stat.icon}</div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </span>
                    <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                      <TrendingUp size={12} />
                      {stat.change}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-6 bg-gradient-to-b from-gray-50 to-white">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <Outlet />
          </motion.div>

          {/* FOOTER */}
          <footer className="mt-6 text-center text-sm text-gray-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p>
                © {new Date().getFullYear()} Punto G Admin • v1.0.0 •
                <span className="ml-2 text-red-600">
                  Sesión activa: {sessionTime} minutos restantes
                </span>
              </p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <Shield size={12} className="text-green-600" />
                  Sistema seguro
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={12} />
                  Última actualización: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* OVERLAY PARA MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";

// export default function AdminLayout() {
//   const navigate = useNavigate();

//   // 🔐 VALIDACIÓN SEGURA DEL TOKEN
//   let token = null;

//   try {
//     const stored = localStorage.getItem("admin_token");

//     if (stored) {
//       const parsed = JSON.parse(stored);

//       if (parsed?.expires && parsed.expires > Date.now()) {
//         token = parsed.value;
//       }
//     }
//   } catch (error) {
//     // Token viejo tipo "yes" u otro formato inválido
//     token = null;
//   }

//   // 🚫 SIN TOKEN → LOGIN
//   if (!token) {
//     localStorage.removeItem("admin_token");
//     return <Navigate to="/admin/login" replace />;
//   }

//   const linkBase =
//     "flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium";

//   const linkActive = "bg-red-600 text-white shadow-md shadow-red-500/30";

//   const linkInactive = "text-gray-700 hover:bg-red-50 hover:text-red-600";

//   return (
//     <div className="min-h-screen flex bg-gray-100 text-gray-800">
//       {/* SIDEBAR */}
//       <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
//         {/* LOGO */}
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-2xl font-bold text-red-600">Punto G</h2>
//           <p className="text-xs text-gray-500">Panel Administrador</p>
//         </div>

//         {/* NAV */}
//         <nav className="flex-1 p-4 space-y-2">
//           <NavLink
//             to="pedidos"
//             className={({ isActive }) =>
//               `${linkBase} ${isActive ? linkActive : linkInactive}`
//             }
//           >
//             📦 Pedidos
//           </NavLink>

//           <NavLink
//             to="dashboard"
//             className={({ isActive }) =>
//               `${linkBase} ${isActive ? linkActive : linkInactive}`
//             }
//           >
//             📊 Dashboard
//           </NavLink>

//           <NavLink
//             to="contacto"
//             className={({ isActive }) =>
//               `${linkBase} ${isActive ? linkActive : linkInactive}`
//             }
//           >
//             📋 Contactos
//           </NavLink>

//           <NavLink
//             to="nuevo_producto"
//             className={({ isActive }) =>
//               `${linkBase} ${isActive ? linkActive : linkInactive}`
//             }
//           >
//             ➕ Nuevo producto
//           </NavLink>
//           <NavLink
//             to="eliminar_producto"
//             className={({ isActive }) =>
//               `${linkBase} ${isActive ? linkActive : linkInactive}`
//             }
//           >
//             🗑️ Eliminar producto
//           </NavLink>
//         </nav>

//         {/* LOGOUT */}
//         <div className="p-4 border-t border-gray-200">
//           <button
//             onClick={() => {
//               localStorage.removeItem("admin_token");
//               navigate("/admin/login");
//             }}
//             className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
//                        text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition"
//           >
//             🚪 Cerrar sesión
//           </button>
//         </div>
//       </aside>

//       {/* CONTENT */}
//       <div className="flex-1 flex flex-col">
//         <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
//           <h1 className="text-lg font-semibold text-gray-800">
//             Panel Administrativo
//           </h1>
//         </header>

//         <main className="flex-1 p-6 bg-gray-100">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }
