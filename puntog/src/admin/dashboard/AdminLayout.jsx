import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const token = localStorage.getItem("admin_token");
  const navigate = useNavigate();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#0B0B0F] text-white">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black border-r border-white/10 p-5 flex flex-col">
        <h2 className="text-xl font-bold mb-6 text-pink-500">Panel Admin</h2>

        <nav className="space-y-3 flex-1">
          <NavLink to="dashboard">📊 Dashboard</NavLink>
          <NavLink to="pedidos">📦 Pedidos</NavLink>
          <NavLink to="contacto">📋 Contactos</NavLink>
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("admin_token");
            navigate("/admin/login");
          }}
          className="mt-6 text-red-400 hover:text-red-500"
        >
          🚪 Cerrar sesión
        </button>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
