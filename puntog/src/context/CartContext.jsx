// CartContext.jsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);

  // Memoizar funciones para evitar re-renders
  const increaseQuantity = useCallback((id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    );
  }, []);

  const decreaseQuantity = useCallback((id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.cantidad > 1
          ? { ...item, cantidad: item.cantidad - 1 }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addToCart = useCallback((producto) => {
    setCart((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  }, []);

  // Memoizar subtotal
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }, [cart]);

  const value = useMemo(
    () => ({
      cart,
      showCart,
      setShowCart,
      showShippingModal,
      setShowShippingModal,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      addToCart,
      subtotal,
    }),
    [
      cart,
      showCart,
      showShippingModal,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      addToCart,
      subtotal,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}

// import { createContext, useContext, useMemo, useState } from "react";

// const CartContext = createContext(null);

// export function CartProvider({ children }) {
//   const [cart, setCart] = useState([]);
//   const [showCart, setShowCart] = useState(false);
//   const [showShippingModal, setShowShippingModal] = useState(false);

//   /* ================= ACCIONES ================= */

//   const addToCart = (product) => {
//     setCart((prev) => {
//       const found = prev.find((p) => p.id === product.id);

//       if (found) {
//         return prev.map((p) =>
//           p.id === product.id ? { ...p, cantidad: p.cantidad + 1 } : p
//         );
//       }

//       // 🔒 Normalizamos el objeto (NO cambia nunca)
//       return [
//         ...prev,
//         {
//           id: product.id,
//           nombre: product.nombre,
//           precio: Number(product.precio),
//           imagen: product.imagen, // 👈 Cloudinary URL fija
//           cantidad: 1,
//         },
//       ];
//     });
//   };

//   // const addToCart = (product) => {
//   //   setCart((prev) => {
//   //     const found = prev.find((p) => p.id === product.id);
//   //     if (found) {
//   //       return prev.map((p) =>
//   //         p.id === product.id ? { ...p, cantidad: p.cantidad + 1 } : p
//   //       );
//   //     }
//   //     return [...prev, { ...product, cantidad: 1 }];
//   //   });
//   // };

//   const increaseQuantity = (id) => {
//     setCart((prev) =>
//       prev.map((p) => (p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p))
//     );
//   };

//   const decreaseQuantity = (id) => {
//     setCart((prev) =>
//       prev.map((p) =>
//         p.id === id && p.cantidad > 1 ? { ...p, cantidad: p.cantidad - 1 } : p
//       )
//     );
//   };

//   const removeFromCart = (id) => {
//     setCart((prev) => prev.filter((p) => p.id !== id));
//   };

//   /** ✅ FUNCIÓN QUE FALTABA */
//   const clearCart = () => {
//     setCart([]);
//   };

//   /* ================= TOTALES ================= */

//   const subtotal = useMemo(() => {
//     return cart.reduce(
//       (sum, item) => sum + Number(item.precio) * Number(item.cantidad),
//       0
//     );
//   }, [cart]);

//   /* ================= PROVIDER ================= */

//   return (
//     <CartContext.Provider
//       value={{
//         cart,
//         addToCart,
//         increaseQuantity,
//         decreaseQuantity,
//         removeFromCart,
//         clearCart, // 👈 YA DISPONIBLE
//         showCart,
//         setShowCart,
//         showShippingModal,
//         setShowShippingModal,
//         subtotal,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// /* ================= HOOK ================= */

// export function useCart() {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error("useCart debe usarse dentro de CartProvider");
//   }
//   return context;
// }
