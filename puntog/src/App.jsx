import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "./componentes/PublicLayout";
import Home from "./componentes/Home";
import Login from "./admin/Login";
import AdminLayout from "./admin/dashboard/AdminLayout";
import Dashboard from "./admin/dashboard/Dashboard";
import PedidosAdmin from "./admin/PedidosAdmin";
import ContactosAdmin from "./admin/ContactosAdmin";
import ProtectedRoute from "./admin/ProtectedRoute";
import Footer from "./componentes/Foter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          {/* otras rutas públicas */}
        </Route>

        {/* LOGIN ADMIN */}
        <Route path="/admin/login" element={<Login />} />

        {/* RUTAS ADMIN PROTEGIDAS */}
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
      <Foter />
    </BrowserRouter>
  );
}

export default App;
