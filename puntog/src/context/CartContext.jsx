import { createContext, useContext, useState, useMemo } from "react";

/* =========================
   CONTEXT
========================= */
const CartContext = createContext(null);

/* =========================
   HOOK
========================= */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
};

/* =========================
   PROVIDER
========================= */
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  /* 🚚 CIUDAD DOMICILIO */
  const [ciudad, setCiudad] = useState("Cali");

  /* ===== ADD ===== */
  const addToCart = (producto) => {
    setCart((prev) => {
      const existe = prev.find((p) => p.id === producto.id);

      if (existe) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }

      return [...prev, { ...producto, quantity: 1 }];
    });
  };

  const increaseQuantity = (id) =>
    setCart((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p))
    );

  const decreaseQuantity = (id) =>
    setCart((prev) =>
      prev.map((p) =>
        p.id === id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p
      )
    );

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((p) => p.id !== id));

  const clearCart = () => setCart([]);

  /* =========================
     TOTALES
  ========================= */

  // 🧾 Subtotal
  // 🧾 Subtotal
  const subtotal = useMemo(() => {
    return cart.reduce((sum, p) => sum + Number(p.precio) * p.quantity, 0);
  }, [cart]);

  // 🚚 Envío
  const envio = useMemo(() => {
    if (subtotal >= 250000) return 0;
    return ciudad === "Cali" ? 5000 : 16000;
  }, [subtotal, ciudad]);

  // 💰 Total final
  const totalFinal = subtotal + envio;

  const totalItems = cart.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,

        // 🔢 Totales
        subtotal,
        domicilio,
        totalFinal,
        totalItems,

        // 🚚 Ciudad
        ciudad,
        setCiudad,

        // UI
        showCart,
        setShowCart,
        mostrarFormulario,
        setMostrarFormulario,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
