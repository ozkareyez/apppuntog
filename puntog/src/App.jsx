// src/App.jsx
import { Routes, Route } from "react-router-dom";

/* ================= ADMIN ================= */
import AdminLayout from "./admin/dashboard/AdminLayout";

import Login from "./admin/Login";
import Dashboard from "./admin/dashboard/Dashboard";
import PedidosAdmin from "./admin/PedidosAdmin";
import ContactosAdmin from "./admin/ContactosAdmin";
import OrdenServicio from "./admin/OrdenServicio";

/* ================= PUBLIC ================= */
import PublicLayout from "./componentes/PublicLayout";
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import ProductoDetallado from "./pages/ProductoDetallado";
import ContactForm from "./componentes/ContactForm";
import Foter from "./componentes/Foter";

/* ================= EXTRAS ================= */
import { FloatingWhatsApp } from "react-floating-whatsapp";
import FormularioProducto from "./admin/FormularioProducto";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import CambiosDevoluciones from "./pages/CambiosDevoluciones";
import PoliticaCookies from "./pages/PoliticaCookies";
import UsoResponsable from "./pages/UsoResponsable";

function App() {
  return (
    <>
      {/* ================= WHATSAPP ================= */}
      <FloatingWhatsApp
        phoneNumber="+573147041149"
        accountName="Punto G"
        chatMessage="Hola 👋 ¿en qué te ayudamos?"
        avatar="/imagenes/logo.png"
        statusMessage="Atención personalizada"
        placeholder="Escribe tu mensaje..."
        allowClickAway
        notification
        notificationSound
      />

      {/* ================= RUTAS ================= */}
      <Routes>
        {/* ---------- PUBLIC ---------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:id" element={<ProductoDetallado />} />
          <Route path="/contacto" element={<ContactForm />} />
          <Route
            path="/politica-de-privacidad"
            element={<PoliticaPrivacidad />}
          />
          <Route
            path="/politica-de-privacidad"
            element={<PoliticaPrivacidad />}
          />
          <Route
            path="/terminos-y-condiciones"
            element={<TerminosCondiciones />}
          />
          <Route
            path="/cambios-y-devoluciones"
            element={<CambiosDevoluciones />}
          />
          <Route path="/politica-de-cookies" element={<PoliticaCookies />} />
          <Route path="/uso-responsable" element={<UsoResponsable />} />
        </Route>

        {/* ---------- ADMIN ---------- */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* 👇 RUTA INDEX */}
          <Route index element={<Dashboard />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pedidos" element={<PedidosAdmin />} />
          <Route path="contacto" element={<ContactosAdmin />} />
          <Route path="nuevo_producto" element={<FormularioProducto />} />
        </Route>

        {/* ---------- ORDEN DE SERVICIO ---------- */}
        <Route path="/admin/orden-servicio/:id" element={<OrdenServicio />} />
      </Routes>

      {/* ================= FOOTER (SOLO PUBLIC) ================= */}
      <Foter />
    </>
  );
}

export default App;
