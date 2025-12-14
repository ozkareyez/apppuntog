import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  MailPlus,
  Link,
} from "lucide-react";
import { FloatingWhatsApp } from "react-floating-whatsapp";
import Header from "../Header";
import MainCTA from "../../MainCTA";

const Cards = () => {
  /************************************ */
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    direccion: "",
    ciudad: "",
    telefono: "",
  });

  /********************************************** */

  const [cart, setCart] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

  const fetchProductos = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/productos`);

      if (!response.ok) {
        throw new Error("Error al obtener datos del servidor");
      }

      const data = await response.json();
      setProductos(data);
      setError(null);
    } catch (error) {
      console.error("Error al obtener los productos:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const addToCart = (producto) => {
    const existingItem = cart.find((item) => item.id === producto.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === producto.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...producto, quantity: 1 }]);
    }
  };

  const increaseQuantity = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    const item = cart.find((item) => item.id === id);

    if (item.quantity === 1) {
      removeFromCart(id);
    } else {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.precio * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  /************************************************************* */
  const enviarFormulario = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    try {
      const response = await fetch(
        "https://gleaming-motivation-production-4018.up.railway.app/api/enviar-formulario",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            carrito: cart,
          }),
        }
      );

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      alert("Pedido enviado correctamente ✔");

      enviarWhatsApp(); // ←← ABRIR WHATSAPP AUTOMÁTICAMENTE

      // Limpiar formulario
      setFormData({
        nombre: "",
        email: "",
        direccion: "",
        ciudad: "",
        telefono: "",
      });

      setCart([]);
      setMostrarFormulario(false);
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      alert("Hubo un error al enviar los datos.");
    }
  };

  /******************************************** */
  const enviarWhatsApp = () => {
    const numero = "573147041149"; // tu número sin + ni espacios

    // Armar mensaje del cliente
    const datosCliente = `
🧑 Cliente:
- Nombre: ${formData.nombre}
- Email: ${formData.email}
- Dirección: ${formData.direccion}
- Ciudad: ${formData.ciudad}
- Teléfono: ${formData.telefono}
`;

    // Armar mensaje del carrito
    const productosTexto = cart
      .map(
        (item) =>
          `• ${item.nombre} x${item.quantity} = $${(
            item.precio * item.quantity
          ).toFixed(2)}`
      )
      .join("\n");

    const totalPedido = total.toFixed(2);

    const mensaje = encodeURIComponent(`
📦 *Nuevo Pedido desde la tienda PuntoG*

${datosCliente}

🛒 *Productos:*
${productosTexto}

💰 *Total:* $${totalPedido}

Gracias por su compra!
  `);

    const url = `https://wa.me/${numero}?text=${mensaje}`;
    window.open(url, "_blank");
  };

  /****** */

  return (
    <div className="min-h-screen bg-[#22222280]">
      {/* Header con ícono del carrito */}
      <Header
        totalItems={totalItems}
        onCartClick={() => setShowCart(!showCart)}
      />

      {/* <MainCTA /> */}

      {/* <div className="sticky top-0 z-50 bg-transparent border-b border-[#ffffff40]"> */}
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* <img className="size-30" src="./public/imagenes/logo (3).png" alt="" /> */}

        <FloatingWhatsApp
          phoneNumber="+573147041149"
          accountName="Punto G"
          statusMessage="tienda on line"
          chatMessage="Buen dia somos PuntoG en que te puedo ayudar!!"
          avatar="/imagenes/logo.png"
        />
      </div>
      {/* </div> */}

      {/* Dropdown del Carrito */}
      {showCart && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCart(false)}
          ></div>

          {/* Panel del carrito */}
          <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform">
            <div className="flex flex-col h-full">
              {/* Header del carrito */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ShoppingCart size={24} />
                  Carrito de Compras
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Contenido del carrito */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    El carrito está vacío. ¡Agrega algunos productos!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = "/imagenes/no-image.png";
                          }}
                        />

                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-800">
                            {item.nombre}
                          </h4>
                          <p className="text-indigo-600 font-bold text-sm">
                            ${item.precio.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => decreaseQuantity(item.id)}
                              className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="w-8 text-center font-semibold text-sm">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => increaseQuantity(item.id)}
                              className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                          >
                            <Trash2 size={14} />
                          </button>

                          <p className="font-bold text-gray-800 text-sm">
                            ${(item.precio * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer con total */}
              {cart.length > 0 && (
                <div className="border-t p-4 bg-gray-50">
                  <div className="flex justify-between items-center text-lg font-bold mb-4">
                    <span>Total:</span>
                    <span className="text-indigo-600">${total.toFixed(2)}</span>
                  </div>
                  <div>
                    {!mostrarFormulario ? (
                      <button
                        onClick={() => {
                          setMostrarFormulario(true);
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
                      >
                        Confirmar Entrega
                      </button>
                    ) : (
                      <div className="bg-[#d3c5c520] w-88 h-120  m-auto items-center border border-gray-200 rounded-md">
                        <button
                          className="ml-80 mt-2 cursor-pointer"
                          onClick={() => setMostrarFormulario(false)}
                        >
                          <X />
                        </button>
                        <h2 className="text-center text-[20px] font-semibold p-4">
                          Datos de Enterga
                        </h2>
                        <form
                          className="items-center m-2"
                          onSubmit={enviarFormulario}
                        >
                          <input
                            className="border border-[#00000050] hover:bg-gray-50 m-2 w-80 h-10 rounded-sm p-2"
                            type="text"
                            placeholder="Nombre"
                            value={formData.nombre}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                nombre: e.target.value,
                              })
                            }
                          />

                          <input
                            className="border border-[#00000050] hover:bg-gray-50 m-2 w-80 h-10 rounded-sm p-2"
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                          />

                          <input
                            className="border border-[#00000050] hover:bg-gray-50 m-2 w-80 h-10 rounded-sm p-2"
                            type="text"
                            placeholder="Dirección"
                            value={formData.direccion}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                direccion: e.target.value,
                              })
                            }
                          />

                          <input
                            className="border border-[#00000050] hover:bg-gray-50 m-2 w-80 h-10 rounded-sm p-2"
                            type="text"
                            placeholder="Ciudad"
                            value={formData.ciudad}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                ciudad: e.target.value,
                              })
                            }
                          />

                          <input
                            className="border border-[#00000050] hover:bg-gray-50 m-2 w-80 h-10 rounded-sm p-2"
                            type="text"
                            placeholder="Teléfono"
                            value={formData.telefono}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                telefono: e.target.value,
                              })
                            }
                          />

                          <button
                            className="border px-6 py-2 w-80 ml-2 mt-6 rounded-sm bg-green-600 text-white font-bold"
                            type="submit"
                          >
                            Enviar
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Productos */}
      <div className="max-w-7xl mx-auto p-4">
        {loading && (
          <p className="text-white text-center">Cargando productos...</p>
        )}

        {error && <p className="text-red-500 text-center">Error: {error}</p>}

        {!loading && !error && productos.length === 0 && (
          <p className="text-white text-center">No hay productos disponibles</p>
        )}

        <h1 className="text-4xl m-4 p-2 mb-6 text-center text-pink-400 font-semibold">
          Nuestros Productos
        </h1>

        <div className="space-y-4 grid md:grid-cols-3 gap-7">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="border border-[#ffffff40] bg-black rounded-md overflow-hidden hover:border hover:border-gray-300 transition-colors"
            >
              <div className=" flex md:grid md:grid-cols-3">
                <div className="w-full md:w-50 md:h-64 md:object-cover bg-[#22222280] border-r border-[#ffffff40] ">
                  <img
                    className="w-full h-full md:w-64 md:h-72 object-cover"
                    src={producto.imagen}
                    alt={producto.nombre}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/no-image.png";
                    }}
                  />
                </div>

                <div className="p-6 flex flex-col justify-center md:px-20 md:text-center md:mx-auto">
                  <h3 className="text-xl font-semibold text-[#ffffff90] mb-4">
                    {producto.nombre}
                  </h3>
                  <p className="text-[#ffffff90] mb-2">
                    Talla: {producto.talla}
                  </p>
                  <p className="text-[#ffffff90] mb-2">
                    Color: {producto.color}
                  </p>
                  <p className="text-2xl font-bold text-white mb-4">
                    ${producto.precio}
                  </p>

                  <button
                    onClick={() => addToCart(producto)}
                    className="w-full md:w-auto border border-[#ffffff40] py-2 px-8 rounded-md bg-white hover:bg-transparent hover:text-white transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="text-[12px]" size={22} />
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cards;
