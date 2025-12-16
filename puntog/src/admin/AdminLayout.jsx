import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Mail, LogOut } from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("admin_auth");
    window.location.href = "/admin";
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      isActive ? "bg-pink-600 text-white" : "text-gray-300 hover:bg-white/10"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black border-r border-white/10 p-5 flex flex-col">
        <h2 className="text-xl font-bold mb-6 text-pink-500">Panel Admin</h2>

        <nav className="space-y-2 flex-1">
          <NavLink to="/admin/pedidos" className={linkClass}>
            <LayoutDashboard size={18} />
            Pedidos
          </NavLink>

          <NavLink to="/admin/contactos" className={linkClass}>
            <Mail size={18} />
            Contactos
          </NavLink>
        </nav>

        <button
          onClick={logout}
          className="mt-6 flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
