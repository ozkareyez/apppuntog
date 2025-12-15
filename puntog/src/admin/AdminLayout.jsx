// import { NavLink, Outlet } from "react-router-dom";

// export default function AdminLayout() {
//   return (
//     <div className="flex min-h-screen bg-gray-900 text-white">
//       {/* SIDEBAR */}
//       <aside className="w-64 bg-black border-r border-white/10 p-5">
//         <h2 className="text-xl font-bold mb-6 text-pink-500">Panel Admin</h2>

//         <nav className="space-y-3">
//           <NavLink
//             to="/admin/pedidos"
//             className={({ isActive }) =>
//               isActive ? "text-pink-400" : "text-gray-300"
//             }
//           >
//             📦 Pedidos
//           </NavLink>

//           <NavLink
//             to="/admin/contactos"
//             className={({ isActive }) =>
//               isActive ? "text-pink-400" : "text-gray-300"
//             }
//           >
//             📩 Contactos
//           </NavLink>
//         </nav>
//       </aside>

//       {/* CONTENIDO */}
//       <main className="flex-1 p-6">
//         <Outlet />
//       </main>
//     </div>
//   );
// }

import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Mail, LogOut } from "lucide-react";

export default function AdminLayout({ children }) {
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("admin_auth");
    window.location.href = "/admin";
  };

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      location.pathname === path
        ? "bg-pink-600 text-white"
        : "text-gray-300 hover:bg-white/10"
    }`;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black border-r border-white/10 p-5 flex flex-col">
        <h2 className="text-2xl font-bold text-pink-500 mb-8">PuntoG Admin</h2>

        <nav className="space-y-2 flex-1">
          <Link to="/Dashboard" className={linkClass("/Dashboard")}>
            <LayoutDashboard size={18} />
            Pedidos
          </Link>

          <Link to="/admin/contactos" className={linkClass("/admin/contactos")}>
            <Mail size={18} />
            Contactos
          </Link>
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-3 text-red-400 hover:text-red-500 mt-auto"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-6 bg-gradient-to-br from-black via-[#111] to-black">
        {children}
      </main>
    </div>
  );
}
