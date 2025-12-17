import { BrowserRouter, Routes, Route } from "react-router-dom";

// LAYOUTS
import PublicLayout from "./componentes/PublicLayout";
import AdminLayout from "./admin/dashboard/AdminLayout";

// COMPONENTES PÚBLICOS
import HomeCategorias from "./componentes/HomeCategorias";
import ProductosPorCategoria from "./componentes/ProductosPorCategoria";
import Foter from "./componentes/Foter";

// COMPONENTES ADMIN
import Login from "./admin/Login";
import Dashboard from "./admin/dashboard/Dashboard";
import PedidosAdmin from "./admin/PedidosAdmin";
import ContactosAdmin from "./admin/ContactosAdmin";
import ProtectedRoute from "./admin/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================== RUTAS PÚBLICAS ================== */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomeCategorias />} />
          <Route path="/categoria/:id" element={<ProductosPorCategoria />} />
        </Route>

        {/* ================== LOGIN ADMIN ================== */}
        <Route path="/admin/login" element={<Login />} />

        {/* ================== RUTAS ADMIN PROTEGIDAS ================== */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} /> {/* /admin */}
          <Route path="pedidos" element={<PedidosAdmin />} />{" "}
          {/* /admin/pedidos */}
          <Route path="contacto" element={<ContactosAdmin />} />{" "}
          {/* /admin/contacto */}
        </Route>
      </Routes>

      {/* FOOTER SOLO PARA PÚBLICO */}
      <Foter />
    </BrowserRouter>
  );
}

export default App;
