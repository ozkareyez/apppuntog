import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const token = localStorage.getItem("admin_token");
  const navigate = useNavigate();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const linkBase =
    "flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium";

  const linkActive = "bg-pink-500 text-white shadow-md shadow-pink-500/30";

  const linkInactive = "text-gray-300 hover:bg-white/10 hover:text-white";

  return (
    <div className="min-h-screen flex bg-[#0B0B0F] text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0E0E14] border-r border-white/10 flex flex-col">
        {/* LOGO / TITLE */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-pink-500">Punto G</h2>
          <p className="text-xs text-gray-400">Panel Administrador</p>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="dashboard"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            📊 Dashboard
          </NavLink>

          <NavLink
            to="pedidos"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            📦 Pedidos
          </NavLink>

          <NavLink
            to="contacto"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            📋 Contactos
          </NavLink>
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              localStorage.removeItem("admin_token");
              navigate("/admin/login");
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                       text-red-400 hover:text-white hover:bg-red-500/20 transition"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="h-14 bg-[#0E0E14] border-b border-white/10 flex items-center px-6">
          <h1 className="text-lg font-semibold">Panel Administrativo</h1>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 bg-[#0B0B0F]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
