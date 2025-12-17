import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#0B0B0F] text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black border-r border-white/10 p-5">
        <h2 className="text-xl font-bold mb-6 text-pink-500">Panel Admin</h2>

        <nav className="space-y-3">
          <NavLink
            to="dashboard"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg transition ${
                isActive ? "bg-pink-600" : "text-gray-300 hover:bg-white/10"
              }`
            }
          >
            📊 Dashboard
          </NavLink>

          <NavLink
            to="pedidos"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg transition ${
                isActive ? "bg-pink-600" : "text-gray-300 hover:bg-white/10"
              }`
            }
          >
            📦 Pedidos
          </NavLink>

          <NavLink
            to="contacto"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg transition ${
                isActive ? "bg-pink-600" : "text-gray-300 hover:bg-white/10"
              }`
            }
          >
            📋 Conctactos
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
