import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { FloatingWhatsApp } from "react-floating-whatsapp";
import Header from "../Header";
import { API_URL } from "../../../config";

const Cards = () => {
  /* ================= FORMULARIO ================= */
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    direccion: "",
    ciudad: "",
    telefono: "",
  });

  /* ================= ESTADOS ================= */
  const [cart, setCart] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  /* ================= OBTENER PRODUCTOS ================= */
  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/productos`);
      if (!response.ok) throw new Error("Error al obtener productos");
      const data = await response.json();
      setProductos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  /* ================= CARRITO ================= */
  const addToCart = (producto) => {
    const existing = cart.find((item) => item.id === producto.id);

    if (existing) {
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

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  /* ================= FALLBACK IMAGEN ================= */
  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = `${API_URL}/images/no-image.png`;
  };

  /* ================= ENVIAR FORMULARIO ================= */
  const enviarFormulario = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Carrito vacío");
      return;
    }

    const payload = {
      ...formData,
      carrito: cart.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        precio: Number(item.precio),
        quantity: item.quantity || 1,
      })),
    };

    try {
      const res = await fetch(`${API_URL}/api/enviar-formulario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al enviar pedido");
      }

      alert("Pedido enviado correctamente ✔");

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
      console.error(error);
      alert("No se pudo enviar el pedido");
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-[#22222280]">
      <Header
        totalItems={totalItems}
        onCartClick={() => setShowCart(!showCart)}
      />

      <FloatingWhatsApp
        phoneNumber="+573147041149"
        accountName="Punto G"
        chatMessage="Hola 👋 ¿En qué te ayudamos?"
        avatar={`${API_URL}/images/logo.png`}
      />

      {/* ================= PRODUCTOS ================= */}
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-4xl text-center text-pink-400 mb-8">
          Nuestros Productos
        </h1>

        {loading && <p className="text-white text-center">Cargando...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="bg-black rounded-lg overflow-hidden shadow-lg"
            >
              {/* ===== IMAGEN RESPONSIVE CORRECTA ===== */}
              <div className="w-full h-56 md:h-72 overflow-hidden">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  onError={handleImgError}
                  className="w-full h-full object-cover block"
                />
              </div>

              <div className="p-4 text-center">
                <h3 className="text-white text-xl font-semibold">
                  {producto.nombre}
                </h3>
                <p className="text-gray-300">Talla: {producto.talla}</p>
                <p className="text-gray-300">Color: {producto.color}</p>
                <p className="text-white text-2xl font-bold mt-2">
                  ${producto.precio}
                </p>

                <button
                  onClick={() => addToCart(producto)}
                  className="
                    mt-4
                    w-full
                    bg-white
                    py-2
                    rounded
                    hover:bg-gray-200
                    flex
                    justify-center
                    items-center
                    gap-2
                  "
                >
                  <ShoppingCart />
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= FORMULARIO ================= */}
      {mostrarFormulario && (
        <form
          onSubmit={enviarFormulario}
          className="max-w-md mx-auto bg-black p-6 rounded-lg mt-10"
        >
          <input
            className="w-full mb-3 p-2 rounded"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
          />
          <input
            className="w-full mb-3 p-2 rounded"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <input
            className="w-full mb-3 p-2 rounded"
            placeholder="Dirección"
            value={formData.direccion}
            onChange={(e) =>
              setFormData({ ...formData, direccion: e.target.value })
            }
            required
          />
          <input
            className="w-full mb-3 p-2 rounded"
            placeholder="Ciudad"
            value={formData.ciudad}
            onChange={(e) =>
              setFormData({ ...formData, ciudad: e.target.value })
            }
            required
          />
          <input
            className="w-full mb-4 p-2 rounded"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
            required
          />

          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600"
          >
            Enviar Pedido
          </button>
        </form>
      )}
    </div>
  );
};

export default Cards;
