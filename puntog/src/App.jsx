// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { FloatingWhatsApp } from "react-floating-whatsapp";

import PublicLayout from "./componentes/PublicLayout";

import CartDrawer from "./componentes/CartDrawer";
import FormularioEnvio from "./componentes/FormularioEnvio";
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import Foter from "./componentes/Foter";
import { useCart } from "./context/CartContext";
import ProductoDetallado from "./pages/ProductoDetallado";

// Componente wrapper para usar el cart
function AppContent() {
  const {
    cart,
    setCart,
    totalItems,
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

      {/* ⭐ TODAS las rutas deben estar dentro de <Routes> */}
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/productos/:id" element={<ProductoDetallado />} />
        </Route>
      </Routes>

      <Foter />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
