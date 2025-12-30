import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);

  /* ================= ACCIONES ================= */

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((p) => p.id === product.id);

      if (found) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }

      // 🔒 Normalizamos el objeto (NO cambia nunca)
      return [
        ...prev,
        {
          id: product.id,
          nombre: product.nombre,
          precio: Number(product.precio),
          imagen: product.imagen_url, // 👈 Cloudinary URL fija
          cantidad: 1,
        },
      ];
    });
  };

  // const addToCart = (product) => {
  //   setCart((prev) => {
  //     const found = prev.find((p) => p.id === product.id);
  //     if (found) {
  //       return prev.map((p) =>
  //         p.id === product.id ? { ...p, cantidad: p.cantidad + 1 } : p
  //       );
  //     }
  //     return [...prev, { ...product, cantidad: 1 }];
  //   });
  // };

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

  /** ✅ FUNCIÓN QUE FALTABA */
  const clearCart = () => {
    setCart([]);
  };

  /* ================= TOTALES ================= */

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.precio) * Number(item.cantidad),
      0
    );
  }, [cart]);

  /* ================= PROVIDER ================= */

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart, // 👈 YA DISPONIBLE
        showCart,
        setShowCart,
        showShippingModal,
        setShowShippingModal,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}
