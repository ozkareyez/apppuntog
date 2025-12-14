// import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import { FloatingWhatsApp } from "react-floating-whatsapp";
import Header from "../Header";
import { API_URL } from "../config";

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

  const increaseQuantity = (id) =>
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );

  const decreaseQuantity = (id) => {
    const item = cart.find((item) => item.id === id);
    if (item.quantity === 1) {
      setCart(cart.filter((item) => item.id !== id));
    } else {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    }
  };

  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));

  const total = cart.reduce(
    (sum, item) => sum + item.precio * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  /* ================= FALLBACK IMAGEN ================= */
  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = `${API_URL}/imagenes/no-image.png`;
  };

  /* ================= FORMULARIO ================= */
  const enviarFormulario = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Carrito vacío");

    await fetch(`${API_URL}/api/enviar-formulario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, carrito: cart }),
    });

    setFormData({
      nombre: "",
      email: "",
      direccion: "",
      ciudad: "",
      telefono: "",
    });
    setCart([]);
    setMostrarFormulario(false);
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
        avatar={`${API_URL}/imagenes/logo.png`}
      />

      {/* ================= PRODUCTOS ================= */}
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-4xl text-center text-pink-400 mb-8">
          Nuestros Productos
        </h1>

        {loading && <p className="text-white text-center">Cargando...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="grid md:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="border bg-black rounded-md overflow-hidden"
            >
              <img
                src={`${API_URL}/imagenes/${producto.imagen}`}
                alt={producto.nombre}
                className="w-full h-72 object-cover"
                onError={handleImgError}
              />

              <div className="p-4 text-center">
                <h3 className="text-white text-xl">{producto.nombre}</h3>
                <p className="text-gray-300">Talla: {producto.talla}</p>
                <p className="text-gray-300">Color: {producto.color}</p>
                <p className="text-white text-2xl font-bold">
                  ${producto.precio}
                </p>

                <button
                  onClick={() => addToCart(producto)}
                  className="mt-4 w-full bg-white py-2 rounded hover:bg-gray-200 flex justify-center gap-2"
                >
                  <ShoppingCart />
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cards;
