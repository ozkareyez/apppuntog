import { createContext, useContext, useMemo, useState } from "react";

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

  // 📍 Ubicación
  const [departamento, setDepartamento] = useState("");
  const [ciudad, setCiudad] = useState("");

  /* =========================
     CARRITO
  ========================= */
  const addToCart = (producto) => {
    setCart((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const increaseQuantity = (id) =>
    setCart((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p))
    );

  const decreaseQuantity = (id) =>
    setCart((prev) =>
      prev.map((p) =>
        p.id === id && p.cantidad > 1 ? { ...p, cantidad: p.cantidad - 1 } : p
      )
    );

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((p) => p.id !== id));

  const clearCart = () => setCart([]);

  /* =========================
     TOTALES
  ========================= */

  // 🧾 Subtotal
  const subtotal = useMemo(() => {
    return cart.reduce((sum, p) => sum + Number(p.precio) * p.cantidad, 0);
  }, [cart]);

  // 🚚 Envío
  const envio = useMemo(() => {
    if (subtotal >= 250000) return 0;
    if (!ciudad) return 0;
    return ciudad.toLowerCase() === "cali" ? 5000 : 16000;
  }, [subtotal, ciudad]);

  // 💰 Total final
  const totalFinal = subtotal + envio;

  // 🔢 Contador header
  const totalItems = useMemo(() => {
    return cart.reduce((sum, p) => sum + p.cantidad, 0);
  }, [cart]);

  /* =========================
     PROVIDER
  ========================= */
  return (
    <CartContext.Provider
      value={{
        // carrito
        cart,
        setCart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,

        // totales
        subtotal,
        envio,
        totalFinal,
        totalItems,

        // ubicación
        departamento,
        setDepartamento,
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
