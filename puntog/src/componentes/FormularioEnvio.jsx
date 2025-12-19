// src/componentes/FormularioEnvio.jsx
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { API_URL } from "@/config";

const FormularioEnvio = ({
  mostrarFormulario,
  setMostrarFormulario,
  cart,
  setCart,
  total,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    departamento: "",
    ciudad: "",
  });

  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/departamentos`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setDepartamentos(data))
      .catch((err) => console.error("❌ Error cargando departamentos:", err));
  }, []);

  useEffect(() => {
    if (!formData.departamento) {
      setCiudades([]);
      setFormData((prev) => ({ ...prev, ciudad: "" }));
      return;
    }

    fetch(`${API_URL}/api/ciudades?departamento_id=${formData.departamento}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCiudades(data);
        setFormData((prev) => ({ ...prev, ciudad: "" }));
      })
      .catch((err) => console.error("❌ Error cargando ciudades:", err));
  }, [formData.departamento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nombreDepartamento =
    departamentos.find((d) => d.id == formData.departamento)?.nombre || "";

  const enviarFormulario = async (e) => {
    e.preventDefault();
    if (!cart.length) return alert("El carrito está vacío");

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

      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        direccion: "",
        departamento: "",
        ciudad: "",
      });
    } catch (error) {
      alert("❌ No se pudo enviar el pedido. Intenta nuevamente.");
      console.error(error);
    }
  };

  const enviarWhatsApp = () => {
    const mensaje = encodeURIComponent(`
📦 *Nuevo Pedido PuntoG*

👤 ${formData.nombre}
📧 ${formData.email}
📞 ${formData.telefono}
📍 ${formData.direccion}
🏙 ${formData.ciudad}, ${nombreDepartamento}

🛒 Productos:
${cart
  .map(
    (p) =>
      `• ${p.nombre} x${p.quantity} = $${(p.precio * p.quantity).toFixed(2)}`
  )
  .join("\n")}

💰 Total: $${total.toFixed(2)}
`);

    window.open(`https://wa.me/573147041149?text=${mensaje}`, "_blank");
  };

  if (!mostrarFormulario) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-60"
        onClick={() => setMostrarFormulario(false)}
      />
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={() => setMostrarFormulario(false)}
            className="absolute top-3 right-3 hover:bg-gray-100 p-2 rounded-full"
          >
            <X />
          </button>

          <h2 className="text-2xl font-bold text-center my-6">
            🚚 Datos de Envío
          </h2>

          <form onSubmit={enviarFormulario} className="space-y-4 px-6 pb-6">
            <input
              name="nombre"
              required
              type="text"
              placeholder="Nombre completo"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />

            <input
              name="email"
              required
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />

            <input
              name="telefono"
              required
              type="text"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />

            <input
              name="direccion"
              required
              type="text"
              placeholder="Dirección"
              value={formData.direccion}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />

            <select
              name="departamento"
              required
              value={formData.departamento}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Seleccione un departamento</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>

            <select
              name="ciudad"
              required
              disabled={!ciudades.length}
              value={formData.ciudad}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Seleccione una ciudad</option>
              {ciudades.map((c) => (
                <option key={c.id} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between mb-4">
                <span className="font-bold">Total a pagar:</span>
                <span className="text-pink-500 font-bold text-xl">
                  ${total.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
              >
                Confirmar Pedido ✅
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default FormularioEnvio;
