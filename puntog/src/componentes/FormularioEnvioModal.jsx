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
    departamento_id: "",
    ciudad_id: "",
  });

  /* ================= DEPARTAMENTOS ================= */
  useEffect(() => {
    fetch(`${API_URL}/api/departamentos`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDepartamentos(data);
      })
      .catch(console.error);
  }, []);

  /* ================= CIUDADES ================= */
  useEffect(() => {
    if (!form.departamento_id) {
      setCiudades([]);
      return;
    }

    fetch(`${API_URL}/api/ciudades?departamento_id=${form.departamento_id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error cargando ciudades");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setCiudades(data);
      })
      .catch((err) => {
        console.error("Ciudades:", err);
        setCiudades([]);
      });
  }, [form.departamento_id]);

  const totalFinal = subtotal;

  /* ================= ENVIAR ================= */
  const enviarPedido = () => {
    if (
      !form.nombre ||
      !form.telefono ||
      !form.direccion ||
      !form.departamento_id ||
      !form.ciudad_id
    ) {
      alert("Completa todos los datos");
      return;
    }

    const departamento = departamentos.find(
      (d) => d.id === Number(form.departamento_id)
    )?.nombre;

    const ciudad = ciudades.find(
      (c) => c.id === Number(form.ciudad_id)
    )?.nombre;

    const mensaje = `
🖤 Pedido Punto G 🖤

👤 ${form.nombre}
📞 ${form.telefono}
📍 ${form.direccion}
🏙️ ${ciudad}, ${departamento}

🛒 Productos:
${cart.map((p) => `• ${p.nombre} x${p.cantidad}`).join("\n")}

💰 Total: $${totalFinal.toLocaleString()}
`;

    const url = `https://wa.me/573147041149?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(url, "_blank");

    clearCart();
    setShowShippingModal(false);
    setShowCart(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={() => setShowShippingModal(false)}
      />

      <div className="relative bg-black w-full max-w-md p-6 rounded-xl text-white">
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
            className="input"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <input
            placeholder="Teléfono"
            className="input"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />

          <input
            placeholder="Dirección"
            className="input"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />

          {/* DEPARTAMENTO */}
          <select
            className="input"
            value={form.departamento_id}
            onChange={(e) =>
              setForm({
                ...form,
                departamento_id: e.target.value,
                ciudad_id: "",
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

          {/* CIUDAD */}
          <select
            className="input"
            disabled={!form.departamento_id}
            value={form.ciudad_id}
            onChange={(e) => setForm({ ...form, ciudad_id: e.target.value })}
          >
            <option value="">Ciudad</option>
            {ciudades.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={enviarPedido}
          className="w-full mt-4 bg-green-600 py-3 rounded-xl font-semibold"
        >
          Enviar pedido por WhatsApp
        </button>
      </div>
    </div>
  );
}
