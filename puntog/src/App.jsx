import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "./componentes/PublicLayout";

// 👇 NUEVOS COMPONENTES
import HomeCategorias from "./componentes/HomeCategorias";
import ProductosPorCategoria from "./componentes/ProductosPorCategoria";

// ADMIN
import Login from "./admin/Login";
import AdminLayout from "./admin/dashboard/AdminLayout";
import Dashboard from "./admin/dashboard/Dashboard";
import PedidosAdmin from "./admin/PedidosAdmin";
import ContactosAdmin from "./admin/ContactosAdmin";
import ProtectedRoute from "./admin/ProtectedRoute";

// FOOTER
import Foter from "./componentes/Foter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLICO ================= */}
        <Route element={<PublicLayout />}>
          {/* HOME = CATEGORIAS */}
          <Route path="/" element={<HomeCategorias />} />

          {/* PRODUCTOS POR CATEGORIA */}
          <Route path="/categoria/:id" element={<ProductosPorCategoria />} />
        </Route>

        {/* ================= LOGIN ADMIN ================= */}
        <Route path="/admin/login" element={<Login />} />

        {/* ================= ADMIN PROTEGIDO ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pedidos" element={<PedidosAdmin />} />
          <Route path="contacto" element={<ContactosAdmin />} />
        </Route>
      </Routes>

      {/* FOOTER GLOBAL */}
      <Foter />
    </BrowserRouter>
  );
}

export default App;
