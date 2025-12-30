import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const tokenData = JSON.parse(localStorage.getItem("admin_token"));

  const token =
    tokenData && tokenData.expires > Date.now() ? tokenData.value : null;

  if (!token) {
    localStorage.removeItem("admin_token");
    return <Navigate to="/admin/login" replace />;
  }

  const navigate = useNavigate();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const linkBase =
    "flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium";

  const linkActive = "bg-red-600 text-white shadow-md shadow-red-500/30";

  const linkInactive = "text-gray-700 hover:bg-red-50 hover:text-red-600";

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* LOGO / TITLE */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-red-600">Punto G</h2>
          <p className="text-xs text-gray-500">Panel Administrador</p>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="pedidos"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            📦 Pedidos
          </NavLink>

          <NavLink
            to="dashboard"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            📊 Dashboard
          </NavLink>

          <NavLink
            to="contacto"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            📋 Contactos
          </NavLink>

          <NavLink
            to="nuevo_producto"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            ➕ Nuevo producto
          </NavLink>
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              localStorage.removeItem("admin_token");
              navigate("/admin/login");
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                       text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
          <h1 className="text-lg font-semibold text-gray-800">
            Panel Administrativo
          </h1>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";

// export default function AdminLayout() {
//   const token = localStorage.getItem("admin_token");
//   const navigate = useNavigate();

//   if (!token) {
//     return <Navigate to="/admin/login" replace />;
//   }

//   const linkBase =
//     "flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium";

//   const linkActive = "bg-red-600 text-white shadow-md shadow-red-500/30";

//   const linkInactive = "text-gray-300 hover:bg-white/10 hover:text-white";

//   return (
//     <div className="min-h-screen flex bg-[#0B0B0F] text-white">
//       {/* SIDEBAR */}
//       <aside className="w-64 bg-[#0E0E14] border-r border-white/10 flex flex-col">
//         {/* LOGO / TITLE */}
//         <div className="p-6 border-b border-white/10">
//           <h2 className="text-2xl font-bold text-red-600">Punto G</h2>
//           <p className="text-xs text-white">Panel Administrador</p>
//         </div>

//         {/* NAV */}
//         <nav className="flex-1 p-4 space-y-2">
//           <NavLink
//             to="dashboard"
//             className={({ isActive }) =>
//               `${linkBase} ${isActive ? linkActive : linkInactive}`
//             }
//           >
//             📊 Dashboard
//           </NavLink>

//           <NavLink
//             to="pedidos"
//             className={({ isActive }) =>
//               `${linkBase} ${isActive ? linkActive : linkInactive}`
//             }
//           >
//             📦 Pedidos
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
//             📊 Nuevo-producto
//           </NavLink>
//         </nav>

//         {/* LOGOUT */}
//         <div className="p-4 border-t border-white/10">
//           <button
//             onClick={() => {
//               localStorage.removeItem("admin_token");
//               navigate("/admin/login");
//             }}
//             className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
//                        text-white hover:text-white hover:bg-red-500/20 transition"
//           >
//             🚪 Cerrar sesión
//           </button>
//         </div>
//       </aside>

//       {/* CONTENT */}
//       <div className="flex-1 flex flex-col">
//         {/* TOP BAR */}
//         <header className="h-14 bg-[#0E0E14] border-b border-white/10 flex items-center px-6">
//           <h1 className="text-lg font-semibold">Panel Administrativo</h1>
//         </header>

//         {/* PAGE CONTENT */}
//         <main className="flex-1 p-6 bg-[#0B0B0F]">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }
