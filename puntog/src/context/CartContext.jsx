import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext();

/* =========================
   PROVIDER
========================= */
export function CartProvider({ children }) {
  /* ===== ESTADOS ===== */
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // 👉 Modal formulario envío
  const [showShippingModal, setShowShippingModal] = useState(false);

  /* ===== FUNCIONES DEL CARRITO ===== */
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);

      if (exists) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }

      return [...prev, { ...product, cantidad: 1 }];
    });
  };

  const increaseQuantity = (id) => {
    setCart((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p))
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prev) =>
      prev.map((p) =>
        p.id === id && p.cantidad > 1 ? { ...p, cantidad: p.cantidad - 1 } : p
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCart = () => setCart([]);

  /* ===== TOTALES ===== */
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
    [cart]
  );

  /* ===== CONTEXTO ===== */
  return (
    <CartContext.Provider
      value={{
        // carrito
        cart,
        addToCart,
        removeFromCart,
        clearCart,

        // cantidades
        increaseQuantity,
        decreaseQuantity,

        // drawer carrito
        showCart,
        setShowCart,

        // modal envío
        showShippingModal,
        setShowShippingModal,

        // totales
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =========================
   HOOK
========================= */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}
