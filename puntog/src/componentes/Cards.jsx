import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import { FloatingWhatsApp } from "react-floating-whatsapp";
import Header from "./Header";
import { API_URL } from "@/config";

const Cards = () => {
  /* ===================== FORM ===================== */
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    departamento: "",
    ciudad: "",
  });

  /* ===================== STATE ===================== */
  const [cart, setCart] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  /* ===================== FETCH DEPARTAMENTOS ===================== */
  useEffect(() => {
    console.log(
      "🔍 Cargando departamentos desde:",
      `${API_URL}/api/departamentos`
    );

    fetch(`${API_URL}/api/departamentos`)
      .then((res) => {
        console.log("📡 Respuesta departamentos status:", res.status);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("✅ Departamentos recibidos:", data);
        setDepartamentos(data);
      })
      .catch((err) => {
        console.error("❌ Error cargando departamentos:", err);
      });
  }, []);

  /* ===================== FETCH CIUDADES ===================== */
  useEffect(() => {
    if (!formData.departamento) {
      setCiudades([]);
      setFormData((prev) => ({ ...prev, ciudad: "" }));
      return;
    }

    console.log(
      "🔍 Cargando ciudades para departamento:",
      formData.departamento
    );

    fetch(`${API_URL}/api/ciudades?departamento_id=${formData.departamento}`)
      .then((res) => {
        console.log("📡 Respuesta ciudades status:", res.status);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("✅ Ciudades recibidas:", data);
        setCiudades(data);
        setFormData((prev) => ({ ...prev, ciudad: "" }));
      })
      .catch((err) => {
        console.error("❌ Error cargando ciudades:", err);
      });
  }, [formData.departamento]);

  /* ===================== FETCH PRODUCTOS ===================== */
  useEffect(() => {
    fetch(`${API_URL}/api/productos`)
      .then((res) => res.json())
      .then(setProductos)
      .catch(() => setError("Error al cargar productos"))
      .finally(() => setLoading(false));
  }, []);

  /* ===================== CARRITO ===================== */
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

  const increaseQuantity = (id) =>
    setCart(
      cart.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p))
    );

  const decreaseQuantity = (id) =>
    setCart(
      cart.map((p) =>
        p.id === id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p
      )
    );

  const removeFromCart = (id) => setCart(cart.filter((p) => p.id !== id));

  const total = cart.reduce((sum, p) => sum + p.precio * p.quantity, 0);
  const totalItems = cart.reduce((sum, p) => sum + p.quantity, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Cambio en ${name}:`, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ===================== FORM ===================== */
  const enviarFormulario = async (e) => {
    e.preventDefault();
    if (!cart.length) return alert("El carrito está vacío");

    console.log("📤 Enviando formulario:", formData);

    try {
      const res = await fetch(`${API_URL}/api/enviar-formulario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          carrito: cart,
        }),
      });

      if (!res.ok) throw new Error("Error al enviar pedido");

      enviarWhatsApp();
      setCart([]);
      setMostrarFormulario(false);
      setShowCart(false);
    } catch (error) {
      alert("❌ No se pudo enviar el pedido. Intenta nuevamente.");
      console.error(error);
    }
  };

  const nombreDepartamento =
    departamentos.find((d) => d.id == formData.departamento)?.nombre || "";

  const enviarWhatsApp = () => {
    const mensaje = encodeURIComponent(`
📦 *Nuevo Pedido PuntoG*

👤 ${formData.nombre}
📞 ${formData.telefono}
📍 ${formData.direccion}
🏙 ${formData.ciudad}, ${nombreDepartamento}

🛒 Productos:
${cart
  .map(
    (p) =>
      `• ${p.nombre} x${p.quantity} = $${(p.precio * p.quantity).toFixed(0)}`
  )
  .join("\n")}

💰 Total: $${total.toFixed(0)}
`);

    window.open(`https://wa.me/573147041149?text=${mensaje}`, "_blank");
  };

  const handleImgError = (e) => {
    e.target.src = "/imagenes/no-image.png";
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="min-h-screen bg-[#22222280]">
      <Header totalItems={totalItems} onCartClick={() => setShowCart(true)} />

      <FloatingWhatsApp
        phoneNumber="+573147041149"
        accountName="Punto G"
        chatMessage="Hola 👋 ¿en qué te ayudamos?"
        avatar="/imagenes/logo.png"
      />

      {/* ===================== CARRITO ===================== */}
      {showCart && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowCart(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white z-50 shadow-xl">
            <div className="flex justify-between p-4 border-b">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart /> Carrito
              </h2>
              <button onClick={() => setShowCart(false)}>
                <X />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-160px)]">
              {cart.map((p) => (
                <div
                  key={p.id}
                  className="flex gap-3 bg-gray-100 p-3 rounded-lg"
                >
                  <img
                    src={p.imagen}
                    onError={handleImgError}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{p.nombre}</p>
                    <p className="text-pink-500 font-bold">${p.precio}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-1">
                      <button onClick={() => decreaseQuantity(p.id)}>
                        <Minus size={14} />
                      </button>
                      <span>{p.quantity}</span>
                      <button onClick={() => increaseQuantity(p.id)}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(p.id)}
                      className="text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t">
                <p className="font-bold mb-3">Total: ${total.toFixed(0)}</p>
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
                >
                  Confirmar Entrega
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===================== MODAL FORM ===================== */}
      {mostrarFormulario && (
        <>
          <div className="fixed inset-0 bg-black/60 z-60" />
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setMostrarFormulario(false)}
                className="absolute top-3 right-3"
              >
                <X />
              </button>

              <h2 className="text-2xl font-bold text-center my-6">
                🚚 Datos de Envío
              </h2>

              <form onSubmit={enviarFormulario} className="space-y-4 px-6 pb-6">
                {["nombre", "email", "telefono", "direccion"].map((c) => (
                  <input
                    key={c}
                    name={c}
                    required
                    type={c === "email" ? "email" : "text"}
                    placeholder={c.charAt(0).toUpperCase() + c.slice(1)}
                    value={formData[c]}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-lg"
                  />
                ))}

                {/* ===== DEPARTAMENTO ===== */}
                <div>
                  <select
                    name="departamento"
                    required
                    value={formData.departamento}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-lg"
                  >
                    <option value="">Seleccione un departamento</option>
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                  {departamentos.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      ⚠️ No se cargaron departamentos. Revisa la consola.
                    </p>
                  )}
                </div>

                {/* ===== CIUDAD ===== */}
                <div>
                  <select
                    name="ciudad"
                    required
                    disabled={!ciudades.length}
                    value={formData.ciudad}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-lg disabled:bg-gray-100"
                  >
                    <option value="">Seleccione una ciudad</option>
                    {ciudades.map((c) => (
                      <option key={c.id} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  {formData.departamento && ciudades.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      ⚠️ No hay ciudades para este departamento
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
                >
                  Confirmar Pedido ✅
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ===================== PRODUCTOS ===================== */}
      {/* <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-4xl text-center text-pink-400 mb-6">
          Nuestros Productos
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="group bg-[#1f1f1f] border border-white/10 rounded-2xl overflow-hidden
              transition hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20"
            >
              <div className="relative w-full h-48 sm:h-64 lg:h-72 overflow-hidden">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  onError={handleImgError}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-3 sm:p-5 text-center">
                <h3 className="text-white text-sm sm:text-base font-semibold line-clamp-2">
                  {producto.nombre}
                </h3>

                <p className="text-pink-400 text-lg sm:text-xl font-bold mt-1 sm:mt-2">
                  ${producto.precio}
                </p>

                <button
                  onClick={() => addToCart(producto)}
                  className="mt-3 w-full py-2 rounded-xl bg-white text-black font-semibold
                  hover:bg-pink-500 hover:text-white transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} />
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default Cards;
