import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import Header from "../Header";
import { API_URL } from "../../../config";

const Cards = () => {
  /* ================= PRODUCTOS ================= */
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= CARRITO ================= */
  const [cart, setCart] = useState([]);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  /* ================= FORM PEDIDO ================= */
  const [pedido, setPedido] = useState({
    nombre: "",
    email: "",
    direccion: "",
    ciudad: "",
    telefono: "",
  });

  /* ================= FORM CONTACTO ================= */
  const [contacto, setContacto] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });

  const [mostrarContacto, setMostrarContacto] = useState(false);

  /* ================= FETCH PRODUCTOS ================= */
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/productos`);
        if (!res.ok) throw new Error("Error cargando productos");
        const data = await res.json();
        setProductos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  /* ================= CARRITO ================= */
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

  /* ================= IMAGEN FALLBACK ================= */
  const handleImgError = (e) => {
    e.target.src = `${API_URL}/images/no-image.png`;
  };

  /* ================= ENVIAR PEDIDO ================= */
  const enviarPedido = async (e) => {
    e.preventDefault();

    if (cart.length === 0) return alert("Carrito vacío");

    const payload = {
      ...pedido,
      carrito: cart.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        precio: Number(item.precio),
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch(`${API_URL}/api/enviar-formulario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Pedido enviado correctamente ✔");
      setCart([]);
      setPedido({
        nombre: "",
        email: "",
        direccion: "",
        ciudad: "",
        telefono: "",
      });
    } catch {
      alert("Error al enviar pedido");
    }
  };

  /* ================= ENVIAR CONTACTO ================= */
  const enviarContacto = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contacto),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Mensaje enviado ✔");
      setContacto({ nombre: "", email: "", mensaje: "" });
      setMostrarContacto(false);
    } catch {
      alert("No se pudo enviar el mensaje");
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-[#22222280]">
      <Header totalItems={totalItems} />

      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-4xl text-center text-pink-400 mb-8">
          Nuestros Productos
        </h1>

        {loading && <p className="text-white text-center">Cargando...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* ================= GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="bg-black rounded-lg overflow-hidden shadow-lg"
            >
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
                  className="mt-4 w-full bg-white py-2 rounded hover:bg-gray-200 flex justify-center gap-2"
                >
                  <ShoppingCart />
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================= FORM CONTACTO ================= */}
        <div className="text-center mt-12">
          <button
            onClick={() => setMostrarContacto(!mostrarContacto)}
            className="text-pink-400 underline"
          >
            Contáctanos
          </button>
        </div>

        {mostrarContacto && (
          <form
            onSubmit={enviarContacto}
            className="max-w-md mx-auto bg-black p-6 rounded-lg mt-6"
          >
            <input
              className="w-full mb-3 p-2 rounded"
              placeholder="Nombre"
              value={contacto.nombre}
              onChange={(e) =>
                setContacto({ ...contacto, nombre: e.target.value })
              }
              required
            />
            <input
              className="w-full mb-3 p-2 rounded"
              placeholder="Email"
              type="email"
              value={contacto.email}
              onChange={(e) =>
                setContacto({ ...contacto, email: e.target.value })
              }
              required
            />
            <textarea
              className="w-full mb-4 p-2 rounded"
              placeholder="Mensaje"
              rows="4"
              value={contacto.mensaje}
              onChange={(e) =>
                setContacto({ ...contacto, mensaje: e.target.value })
              }
              required
            />

            <button
              type="submit"
              className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600"
            >
              Enviar Mensaje
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Cards;
