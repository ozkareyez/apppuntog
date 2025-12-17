import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./componentes/Home";
import Login from "./admin/Login";
import Dashboard from "./admin/dashboard/Dashboard";
import ContactosAdmin from "./admin/ContactosAdmin";

import AdminLayout from "./admin/dashboard/AdminLayout";
import ProtectedRoute from "./admin/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🏠 HOME */}
        <Route path="/" element={<Home />} />

        {/* 🔓 LOGIN */}
        <Route path="/admin/login" element={<Login />} />

        {/* 🔒 ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="contacto" element={<ContactosAdmin />} />
        </Route>

        {/* ❌ CUALQUIER OTRA RUTA */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
