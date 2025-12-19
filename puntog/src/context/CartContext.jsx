// src/context/CartContext.jsx
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const addToCart = (producto) => {
    const existe = cart.find((p) => p.id === producto.id);
    if (existe) {
      setCart(
        cart.map((p) =>
          p.id === producto.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setCart([...cart, { ...producto, quantity: 1 }]);
    }
  };

  const increaseQuantity = (id) =>
    setCart(
      cart.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p))
    );

  const decreaseQuantity = (id) =>
    setCart(
      cart.map((p) =>
        p.id === id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p
      )
    );

  const removeFromCart = (id) => setCart(cart.filter((p) => p.id !== id));

  const total = cart.reduce((sum, p) => sum + p.precio * p.quantity, 0);
  const totalItems = cart.reduce((sum, p) => sum + p.quantity, 0);

  const clearCart = () => setCart([]);

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
        total,
        totalItems,
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
