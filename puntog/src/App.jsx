import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./componentes/Home";
import Cards from "./componentes/Navbar/header/Cards";
import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import ProtectedRoute from "./admin/ProtectedRoute";
import Foter from "./componentes/Foter";

const App = () => {
  return (
    <BrowserRouter>
      <>
        <Routes>
          {/* Página principal (CTA + Cards) */}
          <Route path="/" element={<Home />} />

          {/* Catálogo independiente */}
          <Route path="/catalogo" element={<Cards />} />

          {/* Login Admin */}
          <Route
            path="/admin"
            element={
              <Login onLogin={() => (window.location.href = "/Dashboard")} />
            }
          />
          <Route
            path="/admin/contactos"
            element={
              <ProtectedRoute>
                <ContactosAdmin />
              </ProtectedRoute>
            }
          />

          {/* Dashboard protegido */}
          <Route
            path="/Dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>

        <Foter />
      </>
    </BrowserRouter>
  );
};

export default App;
