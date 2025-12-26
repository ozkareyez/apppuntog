import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { calcularEnvio } from "@/utils/calcularEnvio";
import { API_URL } from "@/config";

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
    ciudad: "",
  });

  /* ================= DEPARTAMENTOS ================= */
  useEffect(() => {
    fetch(`${API_URL}/api/departamentos`)
      .then((res) => {
        if (!res.ok) throw new Error("Error departamentos");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setDepartamentos(data);
      })
      .catch((err) => {
        console.error("Departamentos:", err);
        setDepartamentos([]);
      });
  }, []);

  /* ================= CIUDADES ================= */
  useEffect(() => {
    if (!form.departamento_id) {
      setCiudades([]);
      return;
    }

    fetch(`${API_URL}/api/ciudades?departamento_id=${form.departamento_id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error ciudades");
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

  /* ================= ENVÍO ================= */
  const costoEnvio = useMemo(
    () =>
      calcularEnvio({
        ciudad: form.ciudad,
        total: subtotal,
      }),
    [form.ciudad, subtotal]
  );

  const totalFinal = subtotal + costoEnvio;

  const enviarPedido = () => {
    if (
      !form.nombre ||
      !form.telefono ||
      !form.direccion ||
      !form.departamento_id ||
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
🏙️ ${form.departamento}
🏙️ ${form.ciudad}

🛒 Productos:
${cart.map((p) => `• ${p.nombre} x${p.cantidad}`).join("\n")}

💰 Subtotal: $${subtotal.toLocaleString()}
🚚 Envío: $${costoEnvio.toLocaleString()}
✅ Total: $${totalFinal.toLocaleString()}
`;

    const phone = "573147041149";
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );

    clearCart();
    setShowShippingModal(false);
    setShowCart(false);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={() => setShowShippingModal(false)}
      />

      <div className="relative bg-[#0f0f0f] w-full max-w-md p-6 rounded-xl">
        <button
          className="absolute top-4 right-4"
          onClick={() => setShowShippingModal(false)}
        >
          <X />
        </button>

        <h3 className="text-center text-xl mb-4">Finalizar pedido</h3>

        <div className="space-y-3">
          <input
            className="input"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <input
            className="input"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />

          <input
            className="input"
            placeholder="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />

          <select
            className="input"
            value={form.departamento_id}
            onChange={(e) =>
              setForm({
                ...form,
                departamento_id: e.target.value,
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
            className="input"
            disabled={!form.departamento_id}
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

        <button
          onClick={enviarPedido}
          className="w-full mt-4 bg-green-600 py-2 rounded"
        >
          Enviar pedido por WhatsApp
        </button>
      </div>
    </div>
  );
}
