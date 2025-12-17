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
        {/* 🌐 Público */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Cards />} />
        </Route>
        {/* 🔁 /admin → login */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        🔐 Login
        <Route path="/admin/login" element={<Login />} />
        {/* 🔒 Admin protegido */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pedidos" element={<PedidosAdmin />} />
            <Route path="contactos" element={<ContactosAdmin />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
