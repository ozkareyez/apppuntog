import { X, Plus, Minus, Trash } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartImage from "@/componentes/CartImage";

export default function CartDrawer() {
  const {
    cart,
    showCart,
    setShowCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    subtotal,
    setShowShippingModal,
  } = useCart();

  if (!showCart) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setShowCart(false)}
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white text-gray-800 shadow-xl flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold">
            Tu <span className="text-red-600">carrito</span>
          </h2>
          <button
            onClick={() => setShowCart(false)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 && (
            <p className="text-center text-gray-500 mt-20">
              Tu carrito está vacío
            </p>
          )}

          {cart.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 py-4 border-b border-gray-200"
            >
              <CartImage
                imagen={item.imagen}
                imagen_url={item.imagen_url}
                nombre={item.nombre}
              />

              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-2">
                  {item.nombre}
                </p>

                <p className="text-red-600 font-bold mt-1">
                  ${item.precio.toLocaleString()}
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                      <Minus size={14} />
                    </button>

                    <span className="px-3 text-sm font-semibold">
                      {item.cantidad}
                    </span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-auto text-red-500 hover:text-red-700"
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
          <div className="border-t px-5 py-4">
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Total</span>
              <span className="text-red-600">${subtotal.toLocaleString()}</span>
            </div>

            <button
              onClick={() => {
                setShowCart(false);
                setShowShippingModal(true);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition"
            >
              Confirmar pedido
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

// import { X, Plus, Minus, Trash } from "lucide-react";
// import { useCart } from "@/context/CartContext";
// import CartImage from "@/componentes/CartImage";
// import { memo } from "react";

// // 👇 Componente totalmente aislado
// const CartItem = memo(
//   ({ item, onIncrease, onDecrease, onRemove }) => {
//     return (
//       <div className="flex gap-4 py-4 border-b border-gray-200">
//         <CartImage item={item} />

//         <div className="flex-1">
//           <p className="text-sm font-medium line-clamp-2">{item.nombre}</p>

//           <p className="text-red-600 font-bold mt-1">
//             ${item.precio.toLocaleString()}
//           </p>

//           <div className="flex items-center gap-3 mt-3">
//             <div className="flex items-center border rounded-lg">
//               <button
//                 onClick={onDecrease}
//                 className="px-2 py-1 hover:bg-gray-100"
//               >
//                 <Minus size={14} />
//               </button>

//               <span className="px-3 text-sm font-semibold">
//                 {item.cantidad}
//               </span>

//               <button
//                 onClick={onIncrease}
//                 className="px-2 py-1 hover:bg-gray-100"
//               >
//                 <Plus size={14} />
//               </button>
//             </div>

//             <button
//               onClick={onRemove}
//               className="ml-auto text-red-500 hover:text-red-700"
//             >
//               <Trash size={16} />
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   },
//   // 👇 Solo re-renderizar si cambia la cantidad o precio del item
//   (prevProps, nextProps) => {
//     return (
//       prevProps.item.id === nextProps.item.id &&
//       prevProps.item.cantidad === nextProps.item.cantidad &&
//       prevProps.item.precio === nextProps.item.precio
//     );
//   }
// );

// CartItem.displayName = "CartItem";

// export default function CartDrawer() {
//   const {
//     cart,
//     showCart,
//     setShowCart,
//     increaseQuantity,
//     decreaseQuantity,
//     removeFromCart,
//     subtotal,
//     setShowShippingModal,
//   } = useCart();

//   if (!showCart) return null;

//   return (
//     <div className="fixed inset-0 z-50">
//       {/* OVERLAY */}
//       <div
//         className="absolute inset-0 bg-black/40"
//         onClick={() => setShowCart(false)}
//       />

//       {/* DRAWER */}
//       <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white text-gray-800 shadow-xl flex flex-col">
//         {/* HEADER */}
//         <div className="flex items-center justify-between px-5 py-4 border-b">
//           <h2 className="text-lg font-bold">
//             Tu <span className="text-red-600">carrito</span>
//           </h2>
//           <button
//             onClick={() => setShowCart(false)}
//             className="p-2 rounded-full hover:bg-gray-100"
//           >
//             <X />
//           </button>
//         </div>

//         {/* CONTENIDO */}
//         <div className="flex-1 overflow-y-auto px-5 py-4">
//           {cart.length === 0 && (
//             <p className="text-center text-gray-500 mt-20">
//               Tu carrito está vacío
//             </p>
//           )}

//           {cart.map((item) => (
//             <CartItem
//               key={item.id}
//               item={item}
//               onIncrease={() => increaseQuantity(item.id)}
//               onDecrease={() => decreaseQuantity(item.id)}
//               onRemove={() => removeFromCart(item.id)}
//             />
//           ))}
//         </div>

//         {/* FOOTER */}
//         {cart.length > 0 && (
//           <div className="border-t px-5 py-4">
//             <div className="flex justify-between text-lg font-semibold mb-4">
//               <span>Total</span>
//               <span className="text-red-600">${subtotal.toLocaleString()}</span>
//             </div>

//             <button
//               onClick={() => {
//                 setShowCart(false);
//                 setShowShippingModal(true);
//               }}
//               className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition"
//             >
//               Confirmar pedido
//             </button>
//           </div>
//         )}
//       </aside>
//     </div>
//   );
// }

// import { X, Plus, Minus, Trash } from "lucide-react";
// import { useCart } from "@/context/CartContext";
// import CartImage from "@/componentes/CartImage";

// export default function CartDrawer() {
//   const {
//     cart,
//     showCart,
//     setShowCart,
//     increaseQuantity,
//     decreaseQuantity,
//     removeFromCart,
//     subtotal,
//     setShowShippingModal,
//   } = useCart();

//   if (!showCart) return null;

//   return (
//     <div className="fixed inset-0 z-50">
//       {/* OVERLAY */}
//       <div
//         className="absolute inset-0 bg-black/40"
//         onClick={() => setShowCart(false)}
//       />

//       {/* DRAWER */}
//       <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white text-gray-800 shadow-xl flex flex-col">
//         {/* HEADER */}
//         <div className="flex items-center justify-between px-5 py-4 border-b">
//           <h2 className="text-lg font-bold">
//             Tu <span className="text-red-600">carrito</span>
//           </h2>
//           <button
//             onClick={() => setShowCart(false)}
//             className="p-2 rounded-full hover:bg-gray-100"
//           >
//             <X />
//           </button>
//         </div>

//         {/* CONTENIDO */}
//         <div className="flex-1 overflow-y-auto px-5 py-4">
//           {cart.length === 0 && (
//             <p className="text-center text-gray-500 mt-20">
//               Tu carrito está vacío
//             </p>
//           )}

//           {cart.map((item) => (
//             <div
//               key={item.id}
//               className="flex gap-4 py-4 border-b border-gray-200"
//             >
//               <CartImage item={item} />

//               <div className="flex-1">
//                 <p className="text-sm font-medium line-clamp-2">
//                   {item.nombre}
//                 </p>

//                 <p className="text-red-600 font-bold mt-1">
//                   ${item.precio.toLocaleString()}
//                 </p>

//                 <div className="flex items-center gap-3 mt-3">
//                   <div className="flex items-center border rounded-lg">
//                     <button
//                       onClick={() => decreaseQuantity(item.id)}
//                       className="px-2 py-1 hover:bg-gray-100"
//                     >
//                       <Minus size={14} />
//                     </button>

//                     <span className="px-3 text-sm font-semibold">
//                       {item.cantidad}
//                     </span>

//                     <button
//                       onClick={() => increaseQuantity(item.id)}
//                       className="px-2 py-1 hover:bg-gray-100"
//                     >
//                       <Plus size={14} />
//                     </button>
//                   </div>

//                   <button
//                     onClick={() => removeFromCart(item.id)}
//                     className="ml-auto text-red-500 hover:text-red-700"
//                   >
//                     <Trash size={16} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* FOOTER */}
//         {cart.length > 0 && (
//           <div className="border-t px-5 py-4">
//             <div className="flex justify-between text-lg font-semibold mb-4">
//               <span>Total</span>
//               <span className="text-red-600">${subtotal.toLocaleString()}</span>
//             </div>

//             <button
//               onClick={() => {
//                 setShowCart(false);
//                 setShowShippingModal(true);
//               }}
//               className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition"
//             >
//               Confirmar pedido
//             </button>
//           </div>
//         )}
//       </aside>
//     </div>
//   );
// }
