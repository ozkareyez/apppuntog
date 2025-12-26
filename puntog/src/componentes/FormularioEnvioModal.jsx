import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function FormularioEnvioModal() {
  const { cart, subtotal, clearCart, setShowShippingModal, setShowCart } =
    useCart();

  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    departamento: "",
    ciudad: "",
  });

  /* ================= CARGAR DEPARTAMENTOS ================= */
  useEffect(() => {
    fetch(`${API_URL}/api/departamentos`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDepartamentos(data);
      })
      .catch((err) => {
        console.error("Departamentos:", err);
        setDepartamentos([]);
      });
  }, []);

  /* ================= CARGAR CIUDADES ================= */
  useEffect(() => {
    if (!form.departamento) return;

    fetch(`${API_URL}/api/ciudades/${form.departamento}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCiudades(data);
      })
      .catch((err) => {
        console.error("Ciudades:", err);
        setCiudades([]);
      });
  }, [form.departamento]);

  /* ================= ENVÍO ================= */
  const costoEnvio = 0; // si luego quieres calcularlo dinámico
  const totalFinal = subtotal + costoEnvio;

  /* ================= ENVIAR ================= */
  const enviarPedido = () => {
    if (
      !form.nombre ||
      !form.telefono ||
      !form.direccion ||
      !form.departamento ||
      !form.ciudad
    ) {
      alert("Completa todos los datos");
      return;
    }

    const mensaje = `
🖤 Pedido Punto G 🖤

👤 ${form.nombre}
📞 ${form.telefono}
📍 ${form.direccion}
🏙️ ${form.ciudad}

🛒 Productos:
${cart.map((p) => `• ${p.nombre} x${p.cantidad}`).join("\n")}

💰 Total: $${totalFinal.toLocaleString()}
`;

    const phone = "573147041149";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");

    clearCart();
    setShowShippingModal(false);
    setShowCart(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={() => setShowShippingModal(false)}
      />

      {/* MODAL */}
      <div className="relative bg-black w-full max-w-md p-6 rounded-xl text-white border border-white/10">
        <button
          className="absolute top-4 right-4"
          onClick={() => setShowShippingModal(false)}
        >
          <X />
        </button>

        <h3 className="text-center text-xl mb-4 font-semibold">
          Finalizar pedido
        </h3>

        <div className="space-y-3">
          <input
            placeholder="Nombre"
            className="w-full bg-black text-white border border-white/20 rounded-lg px-3 py-2"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <input
            placeholder="Teléfono"
            className="w-full bg-black text-white border border-white/20 rounded-lg px-3 py-2"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />

          <input
            placeholder="Dirección"
            className="w-full bg-black text-white border border-white/20 rounded-lg px-3 py-2"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />

          <select
            className="w-full bg-black text-white border border-white/20 rounded-lg px-3 py-2"
            value={form.departamento}
            onChange={(e) =>
              setForm({
                ...form,
                departamento: e.target.value,
                ciudad: "",
              })
            }
          >
            <option value="">Departamento</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>

          <select
            className="w-full bg-black text-white border border-white/20 rounded-lg px-3 py-2"
            disabled={!form.departamento}
            value={form.ciudad}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
          >
            <option value="">Ciudad</option>
            {ciudades.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 border-t border-white/10 pt-4 text-sm">
          <p className="text-pink-400 font-bold text-lg">
            Total: ${totalFinal.toLocaleString()}
          </p>
        </div>

        <button
          onClick={enviarPedido}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-semibold transition"
        >
          Enviar pedido por WhatsApp
        </button>
      </div>
    </div>
  );
}
