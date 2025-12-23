import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { API_URL } from "@/config";

export default function FormularioEnvio() {
  const {
    cart,
    totalFinal,
    setMostrarFormulario,
    clearCart,
    setShowCart,
    setCiudad,
  } = useCart();

  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    departamento: "",
    ciudad: "",
  });

  /* =====================
     CARGAR DEPARTAMENTOS
  ===================== */
  useEffect(() => {
    fetch(`${API_URL}/api/departamentos`)
      .then((res) => res.json())
      .then(setDepartamentos)
      .catch(console.error);
  }, []);

  /* =====================
     CARGAR CIUDADES
  ===================== */
  useEffect(() => {
    if (!form.departamento) {
      setCiudades([]);
      return;
    }

    fetch(`${API_URL}/api/ciudades?departamento_id=${form.departamento}`)
      .then((res) => res.json())
      .then(setCiudades)
      .catch(console.error);
  }, [form.departamento]);

  /* =====================
     ENVIAR PEDIDO
  ===================== */
  const enviarPedido = () => {
    if (!form.nombre || !form.telefono || !form.direccion || !form.ciudad) {
      alert("Completa todos los campos");
      return;
    }

    setCiudad(form.ciudad);

    const mensaje = `
🖤 *Pedido Punto G*

👤 ${form.nombre}
📞 ${form.telefono}
📍 ${form.direccion}
🏙 ${form.ciudad}

🛒 Productos:
${cart.map((p) => `• ${p.nombre} x${p.quantity}`).join("\n")}

💰 Total: $${totalFinal.toLocaleString()}
`;

    const url = `https://wa.me/573147041149?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(url, "_blank");

    clearCart();
    setMostrarFormulario(false);
    setShowCart(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70">
      <div className="bg-white w-full max-w-md rounded-xl p-6 relative shadow-2xl">
        <button
          className="absolute top-3 right-3"
          onClick={() => setMostrarFormulario(false)}
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4">Datos de envío</h2>

        <div className="space-y-3">
          <input
            placeholder="Nombre completo"
            className="w-full border p-2 rounded"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <input
            placeholder="Teléfono"
            className="w-full border p-2 rounded"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />

          <input
            placeholder="Dirección"
            className="w-full border p-2 rounded"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />

          {/* DEPARTAMENTO */}
          <select
            className="w-full border p-2 rounded"
            value={form.departamento}
            onChange={(e) =>
              setForm({
                ...form,
                departamento: e.target.value,
                ciudad: "",
              })
            }
          >
            <option value="">Departamento *</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>

          {/* CIUDAD */}
          <select
            className="w-full border p-2 rounded"
            value={form.ciudad}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
            disabled={!ciudades.length}
          >
            <option value="">Ciudad *</option>
            {ciudades.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>

          <button
            onClick={enviarPedido}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-900"
          >
            Enviar pedido por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
