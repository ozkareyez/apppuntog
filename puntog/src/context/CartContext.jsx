import { createContext, useContext, useState, useMemo } from "react";

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [ciudad, setCiudad] = useState("Cali");

  /* =====================
     CARRITO
  ===================== */
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
      prev
        .map((p) => (p.id === id ? { ...p, quantity: p.quantity - 1 } : p))
        .filter((p) => p.quantity > 0)
    );

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((p) => p.id !== id));

  const clearCart = () => setCart([]);

  /* =====================
     TOTALES
  ===================== */

  // Subtotal
  const subtotal = useMemo(() => {
    return cart.reduce((acc, p) => acc + Number(p.precio || 0) * p.quantity, 0);
  }, [cart]);

  // Envío
  const envio = useMemo(() => {
    if (subtotal >= 250000) return 0;
    return ciudad === "Cali" ? 5000 : 16000;
  }, [subtotal, ciudad]);

  // Total final
  const totalFinal = subtotal + envio;

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        showCart,
        setShowCart,

        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,

        subtotal,
        envio,
        totalFinal,

        ciudad,
        setCiudad,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
