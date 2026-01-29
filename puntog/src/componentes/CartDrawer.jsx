import { X, Plus, Minus, Trash, ShoppingBag, ArrowRight } from "lucide-react";
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

  const totalProductos = cart.reduce((total, item) => total + item.cantidad, 0);

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay con efecto de desenfoque */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setShowCart(false)}
      />

      {/* Carrito - Slide in desde la derecha */}
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-white via-white to-red-50 text-gray-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
        {/* Encabezado del carrito */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Tu Carrito</h2>
                <p className="text-white/80 text-sm">
                  {totalProductos}{" "}
                  {totalProductos === 1 ? "producto" : "productos"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCart(false)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <X className="text-white" size={20} />
            </button>
          </div>
        </div>

        {/* Contenido del carrito */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="text-red-400" size={40} />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Tu carrito está vacío
              </p>
              <p className="text-gray-500 text-center mb-8">
                Agrega algunos productos para comenzar
              </p>
              <button
                onClick={() => setShowCart(false)}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-medium flex items-center gap-2"
              >
                <span>Seguir comprando</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-red-100 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Imagen del producto */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-red-100">
                        <CartImage
                          imagen={item.imagen}
                          imagen_url={item.imagen_url}
                          nombre={item.nombre}
                        />
                      </div>
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800 line-clamp-2">
                            {item.nombre}
                          </h3>
                          <p className="text-lg font-bold text-red-600 mt-1">
                            ${item.precio.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                          title="Eliminar producto"
                        >
                          <Trash
                            className="text-red-400 group-hover:text-red-600 transition-colors"
                            size={18}
                          />
                        </button>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-red-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="p-2 hover:bg-red-50 text-red-600 transition-colors"
                            disabled={item.cantidad <= 1}
                          >
                            <Minus size={16} />
                          </button>

                          <div className="px-4 py-2 bg-red-50">
                            <span className="font-bold text-red-700 text-sm">
                              {item.cantidad}
                            </span>
                          </div>

                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="p-2 hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Subtotal del producto */}
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Subtotal</p>
                          <p className="font-bold text-red-700">
                            ${(item.precio * item.cantidad).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen y checkout */}
        {cart.length > 0 && (
          <div className="border-t border-red-100 bg-white px-6 py-5 shadow-lg">
            {/* Resumen de precios */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  Subtotal ({totalProductos} productos)
                </span>
                <span className="font-semibold text-gray-800">
                  ${subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Costo de envío</span>
                <span className="text-gray-600">
                  Se calcula en el siguiente paso
                </span>
              </div>

              <div className="border-t border-red-100 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-800">
                    Total estimado
                  </span>
                  <div className="text-right">
                    <p className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
                      ${subtotal.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">IVA incluido</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de checkout */}
            <button
              onClick={() => {
                setShowCart(false);
                setShowShippingModal(true);
              }}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              <span>Continuar con el pedido</span>
              <ArrowRight size={20} />
            </button>

            {/* Texto de seguridad */}
            <p className="text-center text-xs text-gray-500 mt-4">
              <span className="text-red-600">✓</span> Compra 100% segura ·
              Envíos a todo el país
            </p>

            {/* Botón para seguir comprando */}
            <button
              onClick={() => setShowCart(false)}
              className="w-full mt-4 py-3 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
            >
              Seguir comprando
            </button>
          </div>
        )}

        {/* Decoración de fondo */}
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-red-100 to-transparent rounded-full opacity-30 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-100 to-transparent rounded-full opacity-30 pointer-events-none" />
      </aside>

      {/* Estilos para scroll personalizado */}
      <style jsx>{`
        .overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: #dc2626 #fef2f2;
        }
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #fef2f2;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #dc2626;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #b91c1c;
        }
      `}</style>
    </div>
  );
}
