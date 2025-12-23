// src/App.jsx
import { Routes, Route } from "react-router-dom";

import AdminLayout from "./admin/dashboard/AdminLayout";

import Login from "./admin/Login";
import Dashboard from "./admin/dashboard/Dashboard";
import PedidosAdmin from "./admin/PedidosAdmin";
import ContactosAdmin from "./admin/ContactosAdmin";

import { CartProvider } from "./context/CartContext";
import { FloatingWhatsApp } from "react-floating-whatsapp";

import PublicLayout from "./componentes/PublicLayout";
import CartDrawer from "./componentes/CartDrawer";
import FormularioEnvio from "./componentes/FormularioEnvio";
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import ProductoDetallado from "./pages/ProductoDetallado";
import Foter from "./componentes/Foter";
import { useCart } from "./context/CartContext";
import ContactForm from "./componentes/ContactForm";

function AppContent() {
  const {
    cart,
    setCart,
    showCart,
    setShowCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    total,
    mostrarFormulario,
    setMostrarFormulario,
  } = useCart();

  return (
    <>
      <FloatingWhatsApp
        phoneNumber="+573147041149"
        accountName="Punto G"
        chatMessage="Hola 👋 ¿en qué te ayudamos?"
        avatar="/imagenes/logo.png"
      />

      <CartDrawer
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        increaseQuantity={increaseQuantity}
        decreaseQuantity={decreaseQuantity}
        removeFromCart={removeFromCart}
        total={total}
        setMostrarFormulario={setMostrarFormulario}
      />

      <FormularioEnvio
        mostrarFormulario={mostrarFormulario}
        setMostrarFormulario={setMostrarFormulario}
        cart={cart}
        setCart={setCart}
        total={total}
      />

      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:id" element={<ProductoDetallado />} />

          {/* ✅ CONTACTO */}
          <Route path="/contacto" element={<ContactForm />} />
        </Route>

        {/* ADMIN */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pedidos" element={<PedidosAdmin />} />
          <Route path="contacto" element={<ContactosAdmin />} />
        </Route>

        <Route path="/admin/orden-servicio/:id" element={<OrdenServicio />} />
      </Routes>

      <Foter />
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
