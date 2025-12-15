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

const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

const Cards = () => {
  /************************************ */
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    direccion: "",
    ciudad: "",
    departamento: "",
    telefono: "",
  });

  /********************************************** */

  const [cart, setCart] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const [departamentoId, setDepartamentoId] = useState("");
  const [ciudadId, setCiudadId] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/departamentos`)
      .then((res) => res.json())
      .then((data) => setDepartamentos(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!departamentoId) return;

    fetch(`${API_URL}/api/ciudades/${departamentoId}`)
      .then((res) => res.json())
      .then((data) => setCiudades(data))
      .catch((err) => console.error(err));
  }, [departamentoId]);

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
      const response = await fetch(`${API_URL}/api/enviar-formulario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          direccion: formData.direccion,
          departamento_id: departamentoId,
          ciudad_id: ciudadId,
          carrito: cart,
        }),
      });

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
        departamento: "",
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
-Departamento: ${formData.departamento}
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

  const handleImgError = (e) => {
    e.target.onerror = null; // 🔒 evita loop infinito
    e.target.src = "/imagenes/no-image.png";
  };

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
                          onError={handleImgError}
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
                      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-auto relative">
                        {/* Cerrar */}
                        <button
                          onClick={() => setMostrarFormulario(false)}
                          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                        >
                          <X />
                        </button>

                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                          🚚 Datos de Envío
                        </h2>

                        <form onSubmit={enviarFormulario} className="space-y-4">
                          {/* Nombre */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                              Nombre completo
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.nombre}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  nombre: e.target.value,
                                })
                              }
                              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                              placeholder="Ej: Juan Pérez"
                            />
                          </div>

                          {/* Email */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                              Correo electrónico
                            </label>
                            <input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                              placeholder="correo@email.com"
                            />
                          </div>

                          {/* Departamento */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                              Departamento
                            </label>
                            <select
                              value={departamentoId}
                              required
                              onChange={(e) => {
                                const id = e.target.value;
                                const depto = departamentos.find(
                                  (d) => d.id == id
                                );

                                setDepartamentoId(id);
                                setCiudadId("");
                                setCiudades([]);
                                setFormData({
                                  ...formData,
                                  departamento: depto?.nombre || "",
                                  ciudad: "",
                                });
                              }}
                              className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                            >
                              <option value="">Seleccione departamento</option>
                              {departamentos.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.nombre}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Ciudad */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                              Ciudad
                            </label>
                            <select
                              value={ciudadId}
                              required
                              disabled={!ciudades.length}
                              onChange={(e) => {
                                const id = e.target.value;
                                const ciudadSeleccionada = ciudades.find(
                                  (c) => c.id == id
                                );

                                setCiudadId(id);
                                setFormData({
                                  ...formData,
                                  ciudad: ciudadSeleccionada?.nombre || "",
                                });
                              }}
                              className="w-full border rounded-lg px-3 py-2 bg-white disabled:bg-gray-100 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            >
                              <option value="">Seleccione ciudad</option>
                              {ciudades.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.nombre}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Dirección */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                              Dirección de entrega
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.direccion}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  direccion: e.target.value,
                                })
                              }
                              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                              placeholder="Calle 10 #20-30"
                            />
                          </div>

                          {/* Teléfono */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                              Teléfono
                            </label>
                            <input
                              type="tel"
                              required
                              value={formData.telefono}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  telefono: e.target.value,
                                })
                              }
                              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                              placeholder="3001234567"
                            />
                          </div>

                          {/* Botón */}
                          <button
                            type="submit"
                            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                          >
                            Confirmar Pedido ✅
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

        <div className="space-y-4 grid md:grid-cols-3 gap-7 sm:">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="sm:flex border border-[#ffffff40] bg-black rounded-md overflow-hidden hover:border hover:border-gray-300 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 bg-[#22222280] border border-[#ffffff40] rounded-lg overflow-hidden">
                {/* IMAGEN (Móvil arriba, Escritorio izquierda) */}
                <div className="w-full h-64 md:h-auto md:col-span-1 order-1 md:order-none">
                  <img
                    className="w-full h-full object-cover"
                    src={producto.imagen}
                    alt={producto.nombre}
                    loading="lazy"
                    onError={handleImgError}
                  />
                </div>

                {/* INFO (Móvil abajo, Escritorio derecha) */}
                <div className="p-6 flex flex-col justify-center text-center md:col-span-2 order-2 md:order-none">
                  <h3 className="text-sm font-semibold text-[#ffffff90] mb-2">
                    {producto.nombre}
                  </h3>

                  <p className="text-[#ffffff90] text-sm">
                    Talla: {producto.talla}
                  </p>

                  <p className="text-[#ffffff90] text-sm">
                    Color: {producto.color}
                  </p>

                  <p className="text-sm font-bold text-white mt-2 mb-4">
                    ${producto.precio}
                  </p>

                  <button
                    onClick={() => addToCart(producto)}
                    className="mx-auto flex items-center gap-2 border border-[#ffffff40] py-2 px-8 rounded-md bg-white text-black hover:bg-transparent hover:text-white transition"
                  >
                    <ShoppingCart size={16} />
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
