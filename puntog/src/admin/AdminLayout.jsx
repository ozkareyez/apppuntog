import { NavLink, Outlet } from "react-router-dom";

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
