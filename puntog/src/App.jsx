import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./componentes/Home";
import Cards from "./componentes/Navbar/header/Cards";
import Login from "./admin/Login";
import Dashboard from "./admin/dashboard/Dashboard";
import ContactosAdmin from "./admin/ContactosAdmin";
import PedidosAdmin from "./admin/PedidosAdmin";

import AdminLayout from "./admin/AdminLayout";
import PublicLayout from "./componentes/PublicLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Público */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Cards />} />
        </Route>

        {/* 🔐 Login */}
        <Route path="admin" element={<Login />}>
          {/* <Route path="/admin/Login" element={<Login />} /> */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pedidos" element={<PedidosAdmin />} />
          <Route path="contactos" element={<ContactosAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
