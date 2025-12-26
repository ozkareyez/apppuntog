import { X, Plus, Minus, Trash } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { API_URL } from "@/config";

const CartDrawer = () => {
  const {
    cart = [],
    showCart,
    setShowCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    total = 0,
  } = useCart();

  const [showShipping, setShowShipping] = useState(false);

  if (!showCart) return null;

  const getImageSrc = (img) => {
    if (!img) return "/imagenes/no-image.png";
    if (img.startsWith("http")) return img;
    return `${API_URL}/uploads/${img}`;
  };

  return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setShowCart(false)}
      />

      {/* DRAWER */}
      <aside className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl">
        {/* HEADER */}
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-extrabold text-gray-900">Tu carrito</h2>
          <button
            onClick={() => setShowCart(false)}
            className="text-gray-500 hover:text-red-600 transition"
          >
            <X />
          </button>
        </header>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 && (
            <p className="text-center text-gray-500 mt-10">
              Tu carrito está vacío
            </p>
          )}

          {cart.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 items-center border border-gray-200 rounded-xl p-3 hover:shadow-sm transition"
            >
              {/* IMAGEN */}
              <img
                src={getImageSrc(item.imagen)}
                alt={item.nombre}
                onError={(e) =>
                  (e.currentTarget.src = "/imagenes/no-image.png")
                }
                className="w-16 h-16 object-cover rounded-lg bg-gray-100"
              />

              {/* INFO */}
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                  {item.nombre}
                </h3>

                <p className="text-red-600 font-bold text-sm mt-0.5">
                  ${Number(item.precio).toLocaleString()}
                </p>

                {/* CONTROLES */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                  >
                    <Minus size={14} />
                  </button>

                  <span className="text-sm font-semibold w-6 text-center">
                    {item.cantidad}
                  </span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* ELIMINAR */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-gray-400 hover:text-red-600 transition"
                title="Eliminar"
              >
                <Trash size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <footer className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center font-bold text-lg mb-4">
            <span>Total</span>
            <span className="text-red-600">
              ${Number(total).toLocaleString()}
            </span>
          </div>

          <button
            className="
              w-full
              bg-red-600
              text-white
              py-3
              rounded-xl
              font-semibold
              hover:bg-red-700
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
            onClick={() => setShowShipping(true)}
            disabled={cart.length === 0}
          >
            Confirmar pedido
          </button>
        </footer>
      </aside>

      {/* MODAL ENVÍO */}
      {/* aquí conectas tu FormularioEnvioModal */}
    </>
  );
};

export default CartDrawer;

// import { X, Plus, Minus, Trash } from "lucide-react";
// import { useState } from "react";
// import { useCart } from "@/context/CartContext";

// import { API_URL } from "@/config";

// const CartDrawer = () => {
//   const {
//     cart = [],
//     showCart,
//     setShowCart,
//     increaseQuantity,
//     decreaseQuantity,
//     removeFromCart,
//     total = 0,
//   } = useCart();

//   const [showShipping, setShowShipping] = useState(false);

//   if (!showCart) return null;

//   const getImageSrc = (img) => {
//     if (!img) return "/imagenes/no-image.png";
//     if (img.startsWith("http")) return img;
//     return `${API_URL}/uploads/${img}`;
//   };

//   return (
//     <>
//       {/* OVERLAY */}
//       <div
//         className="fixed inset-0 bg-black/50 z-40"
//         onClick={() => setShowCart(false)}
//       />

//       {/* DRAWER */}
//       <aside className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col">
//         {/* HEADER */}
//         <header className="p-4 border-b flex justify-between items-center">
//           <h2 className="text-lg font-bold">Tu carrito</h2>
//           <button onClick={() => setShowCart(false)}>
//             <X />
//           </button>
//         </header>

//         {/* BODY */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {cart.length === 0 && (
//             <p className="text-center text-gray-500">Tu carrito está vacío</p>
//           )}

//           {cart.map((item) => (
//             <div
//               key={item.id}
//               className="flex gap-3 items-center border rounded-lg p-2"
//             >
//               {/* IMAGEN MINI */}
//               <img
//                 src={getImageSrc(item.imagen)}
//                 alt={item.nombre}
//                 className="w-16 h-16 object-cover rounded"
//               />

//               {/* INFO */}
//               <div className="flex-1">
//                 <h3 className="font-semibold text-sm">{item.nombre}</h3>
//                 <p className="text-sm text-gray-500">${item.precio}</p>

//                 {/* CONTROLES */}
//                 <div className="flex items-center gap-2 mt-2">
//                   <button
//                     onClick={() => decreaseQuantity(item.id)}
//                     className="p-1 border rounded"
//                   >
//                     <Minus size={14} />
//                   </button>

//                   <span className="text-sm">{item.cantidad}</span>

//                   <button
//                     onClick={() => increaseQuantity(item.id)}
//                     className="p-1 border rounded"
//                   >
//                     <Plus size={14} />
//                   </button>
//                 </div>
//               </div>

//               {/* ELIMINAR */}
//               <button
//                 onClick={() => removeFromCart(item.id)}
//                 className="text-red-500"
//               >
//                 <Trash size={18} />
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* FOOTER */}
//         <footer className="p-4 border-t">
//           <div className="flex justify-between font-bold mb-4">
//             <span>Total</span>
//             <span>${total}</span>
//           </div>

//           <button
//             className="w-full bg-pink-600 text-white py-2 rounded"
//             onClick={() => setShowShipping(true)}
//             disabled={cart.length === 0}
//           >
//             Confirmar pedido
//           </button>
//         </footer>
//       </aside>

//       {/* MODAL ENVÍO */}
//     </>
//   );
// };

// export default CartDrawer;
