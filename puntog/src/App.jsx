import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./componentes/Home";
import Cards from "./componentes/Navbar/header/Cards";
import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import ContactosAdmin from "./admin/ContactosAdmin";
import ProtectedRoute from "./admin/ProtectedRoute";
import Foter from "./componentes/Foter";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Cards />} />

        {/* Admin */}

        <Route
          path="/admin/login"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="pedidos" element={<Dashboard />} />
          <Route path="contactos" element={<ContactosAdmin />} />
        </Route>
      </Routes>

      <Foter />
    </BrowserRouter>
  );
};

export default App;
