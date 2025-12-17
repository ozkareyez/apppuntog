import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./componentes/Home";
import Cards from "./componentes/Navbar/header/Cards";
import Login from "./admin/Login";
import Dashboard from "./admin/dashboard/Dashboard";
import ContactosAdmin from "./admin/ContactosAdmin";
import PedidosAdmin from "./admin/PedidosAdmin";
import AdminLayout from "./admin/dashboard/AdminLayout";
import PublicLayout from "./componentes/PublicLayout";
import ProtectedRoute from "./admin/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Cards />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pedidos" element={<PedidosAdmin />} />
            <Route path="contacto" element={<ContactosAdmin />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
