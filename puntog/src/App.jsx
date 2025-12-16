import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./componentes/Home";
import Cards from "./componentes/Navbar/header/Cards";
import Login from "./admin/Login";
import Dashboard from "./admin/dashboard/Dashboard";

import ContactosAdmin from "./admin/ContactosAdmin";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Público */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Cards />} />
        </Route>

        {/* 🔐 Admin */}
        <Route path="/admin" element={<Login />} />

        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/contactos" element={<ContactosAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
