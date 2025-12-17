import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./componentes/Home";
import Cards from "./componentes/Navbar/header/Cards";
import Login from "./admin/Login";
import Dashboard from "./admin/dashboard/Dashboard";
import ContactosAdmin from "./admin/ContactosAdmin";

import AdminLayout from "./admin/AdminLayout";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Público */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Cards />} />
        </Route>

        {/* 🔐 Login Admin */}
        <Route path="/admin" element={<Login />} />

        {/* 🛠️ Panel Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="contactos" element={<ContactosAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
