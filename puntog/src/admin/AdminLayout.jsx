<<<<<<< HEAD
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
=======
import { NavLink, Outlet } from "react-router-dom";
>>>>>>> parent of babb917 (estilos despues del cambio que se daño)

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black border-r border-white/10 p-5">
        <h2 className="text-xl font-bold mb-6 text-pink-500">Panel Admin</h2>

        <nav className="space-y-3">
          <NavLink
            to="/admin/pedidos"
            className={({ isActive }) =>
              isActive ? "text-pink-400" : "text-gray-300"
            }
          >
            📦 Pedidos
          </NavLink>

          <NavLink
            to="/admin/contactos"
            className={({ isActive }) =>
              isActive ? "text-pink-400" : "text-gray-300"
            }
          >
            📩 Contactos
          </NavLink>
        </nav>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
