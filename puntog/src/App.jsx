import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./componentes/Home";
import Cards from "./componentes/Navbar/header/Cards";
import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import ContactosAdmin from "./admin/ContactosAdmin"; // ✅ IMPORTANTE
import ProtectedRoute from "./admin/ProtectedRoute";
import Foter from "./componentes/Foter";

const App = () => {
  return (
    <BrowserRouter>
      <>
        <Routes>
          {/* Página pública */}
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Cards />} />

          {/* Login */}
          <Route path="/admin" element={<Login />} />

          {/* Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Contactos */}
          <Route
            path="/admin/contactos"
            element={
              <ProtectedRoute>
                <ContactosAdmin />
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <Foter />
      </>
    </BrowserRouter>
  );
};

export default App;
