// import { X, Plus, Minus, Trash } from "lucide-react";
// import { useCart } from "@/context/CartContext";

// const CartDrawer = () => {
//   const {
//     cart,
//     showCart,
//     setShowCart,
//     increaseQuantity,
//     decreaseQuantity,
//     removeFromCart,
//     total,
//     setMostrarFormulario, // ✅ FALTABA ESTO
//   } = useCart();

//   if (!showCart) return null;

//   const getImageSrc = (img) => {
//     if (!img) return "/imagenes/no-image.png";
//     if (img.startsWith("http")) return img.replace("http://", "https://");
//     if (img.startsWith("imagenes/")) return `/${img}`;
//     return `/imagenes/${img}`;
//   };

//   return (
//     <>
//       {/* OVERLAY */}
//       <div
//         className="fixed inset-0 bg-black/60 z-[90]"
//         onClick={() => setShowCart(false)}
//       />

//       {/* DRAWER */}
//       <aside className="fixed top-0 right-0 h-full w-[380px] max-w-full bg-[#111] z-[100] shadow-2xl flex flex-col">
//         {/* HEADER */}
//         <div className="flex items-center justify-between p-4 border-b border-white/10">
//           <h2 className="text-xl font-bold text-pink-400">Tu carrito</h2>
//           <button onClick={() => setShowCart(false)}>
//             <X className="text-white" />
//           </button>
//         </div>

//         {/* ITEMS */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {cart.length === 0 && (
//             <p className="text-gray-400 text-center mt-10">
//               Tu carrito está vacío
//             </p>
//           )}

//           {cart.map((item) => (
//             <div
//               key={item.id}
//               className="flex gap-3 bg-[#1a1a1a] p-3 rounded-xl"
//             >
//               <img
//                 src={getImageSrc(item.imagen)}
//                 alt={item.nombre}
//                 loading="lazy"
//                 onError={(e) =>
//                   (e.currentTarget.src = "/imagenes/no-image.png")
//                 }
//                 className="w-16 h-16 object-cover rounded-lg bg-black"
//               />

//               <div className="flex-1">
//                 <h4 className="text-white text-sm font-semibold line-clamp-2">
//                   {item.nombre}
//                 </h4>

//                 <p className="text-pink-400 font-bold">
//                   ${Number(item.precio).toFixed(2)}
//                 </p>

//                 <div className="flex items-center gap-2 mt-2">
//                   <button
//                     onClick={() => decreaseQuantity(item.id)}
//                     className="p-1 bg-white/10 rounded"
//                   >
//                     <Minus size={14} />
//                   </button>

//                   <span className="text-white">{item.quantity}</span>

//                   <button
//                     onClick={() => increaseQuantity(item.id)}
//                     className="p-1 bg-white/10 rounded"
//                   >
//                     <Plus size={14} />
//                   </button>

//                   <button
//                     onClick={() => removeFromCart(item.id)}
//                     className="ml-auto text-red-500"
//                   >
//                     <Trash size={16} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* FOOTER */}
//         <div className="p-4 border-t border-white/10">
//           <div className="flex justify-between text-white mb-4">
//             <span>Subtotal</span>
//             <span className="font-bold">${total.toFixed(2)}</span>
//           </div>

//           <button
//             onClick={() => {
//               setMostrarFormulario(true); // ✅ AHORA SÍ FUNCIONA
//               setShowCart(false);
//             }}
//             className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl mt-4"
//           >
//             Confirmar entrega 🚚
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default CartDrawer;
import { X, Plus, Minus, Trash } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { API_URL } from "@/config";

const CartDrawer = () => {
  const {
    cart,
    showCart,
    setShowCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    total,
    setMostrarFormulario,
  } = useCart();

  if (!showCart) return null;

  // ⭐ FUNCIÓN MEJORADA para obtener la imagen
  const getImageSrc = (img) => {
    if (!img) return "/imagenes/no-image.png";

    // Si ya es URL completa
    if (img.startsWith("http://")) return img.replace("http://", "https://");
    if (img.startsWith("https://")) return img;

    // ⭐ Si es solo el nombre del archivo, construye URL del backend
    return `${API_URL}/images/${img}`;
  };

  return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/60 z-[90]"
        onClick={() => setShowCart(false)}
      />

      {/* DRAWER */}
      <aside className="fixed top-0 right-0 h-full w-[380px] max-w-full bg-[#111] z-[100] shadow-2xl flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-pink-400">Tu carrito</h2>
          <button
            onClick={() => setShowCart(false)}
            className="hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <X className="text-white" />
          </button>
        </div>

        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 && (
            <div className="text-center mt-20">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-400">Tu carrito está vacío</p>
            </div>
          )}

          {cart.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 bg-[#1a1a1a] p-3 rounded-xl border border-white/5 hover:border-pink-500/30 transition-colors"
            >
              {/* ⭐ IMAGEN CON LOADING STATE */}
              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-black/50">
                <img
                  src={getImageSrc(item.imagen)}
                  alt={item.nombre}
                  loading="lazy"
                  onError={(e) => {
                    console.error(
                      "❌ Error cargando imagen en carrito:",
                      item.imagen
                    );
                    e.currentTarget.src = "/imagenes/no-image.png";
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-semibold line-clamp-2 mb-1">
                  {item.nombre}
                </h4>

                <p className="text-pink-400 font-bold text-lg">
                  ${Number(item.precio).toFixed(2)}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors text-white"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus size={14} />
                  </button>

                  <span className="text-white font-semibold min-w-[24px] text-center">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors text-white"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={14} />
                  </button>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-auto text-red-500 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded"
                    aria-label="Eliminar del carrito"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>
                  Productos (
                  {cart.reduce((acc, item) => acc + item.quantity, 0)})
                </span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Total</span>
                <span className="text-pink-400">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setMostrarFormulario(true);
                setShowCart(false);
              }}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2"
            >
              <span>Confirmar entrega</span>
              <span>🚚</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
