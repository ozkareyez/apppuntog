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
  const [loading, setLoading] = useState(false);

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
      .then((r) => r.json())
      .then((d) => setDepartamentos(Array.isArray(d) ? d : []))
      .catch(() => setDepartamentos([]));
  }, []);

  /* ================= CIUDADES ================= */
  useEffect(() => {
    if (!form.departamento_id) {
      setCiudades([]);
      return;
    }

    fetch(`${API_URL}/api/ciudades?departamento_id=${form.departamento_id}`)
      .then((r) => r.json())
      .then((d) => setCiudades(Array.isArray(d) ? d : []))
      .catch(() => setCiudades([]));
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

  /* ================= ENVIAR ================= */
  const enviarPedido = async () => {
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

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/enviar-formulario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          telefono: form.telefono,
          direccion: form.direccion,

          // ✅ ENVIAR AMBOS
          departamento:
            departamentos.find((d) => d.id == form.departamento_id)?.nombre ||
            "",

          departamento_id: form.departamento_id,

          ciudad: form.ciudad,
          ciudad_id: ciudades.find((c) => c.nombre === form.ciudad)?.id || null,

          // ✅ NOMBRE CORRECTO
          costo_envio: costoEnvio,

          // ✅ CAMPOS CORRECTOS
          carrito: cart.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            precio: Number(p.precio),
            cantidad: Number(p.cantidad),
          })),
        }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error();
    } catch (err) {
      alert("Error enviando pedido");
      setLoading(false);
      return;
    }

    /* ================= WHATSAPP ================= */
    const mensaje = `
🖤 *NUEVA ORDEN DE SERVICIO – PUNTO G* 🖤

👤 *Cliente:* ${form.nombre}
📞 *Teléfono:* ${form.telefono}

📍 *Dirección:* ${form.direccion}
🗺️ *Departamento:* ${
      departamentos.find((d) => d.id == form.departamento_id)?.nombre || ""
    }
🏙️ *Ciudad:* ${form.ciudad}


🛒 *Productos:*
${cart
  .map(
    (p) =>
      `• ${p.nombre}
   Cantidad: ${p.cantidad}
   Precio: $${p.precio.toLocaleString()}
   Subtotal: $${(p.precio * p.cantidad).toLocaleString()}`
  )
  .join("\n\n")}

────────────────────
💰 *Subtotal:* $${subtotal.toLocaleString()}
🚚 *Envío:* $${costoEnvio.toLocaleString()}
✅ *TOTAL:* $${totalFinal.toLocaleString()}
────────────────────
`;

    window.open(
      `https://wa.me/573147041149?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );

    clearCart();
    setShowShippingModal(false);
    setShowCart(false);
    setLoading(false);
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowShippingModal(false)}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#141414] to-[#0b0b0b] shadow-2xl border border-white/10 p-6 animate-fadeIn">
        {/* CLOSE */}
        <button
          className="absolute top-4 right-4 text-white/60 hover:text-white transition"
          onClick={() => setShowShippingModal(false)}
        >
          <X size={22} />
        </button>

        {/* TITLE */}
        <h3 className="text-center text-2xl font-semibold text-white mb-1">
          Finalizar pedido
        </h3>
        <p className="text-center text-sm text-white/50 mb-6">
          Completa tus datos para continuar
        </p>

        {/* FORM */}
        <div className="space-y-3">
          <input
            className="input"
            placeholder="Nombre completo"
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
            <option value="">Selecciona departamento</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>

          <select
            className="input disabled:opacity-50"
            disabled={!form.departamento_id}
            value={form.ciudad}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
          >
            <option value="">Selecciona ciudad</option>
            {ciudades.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* TOTAL CARD */}
        <div className="mt-6 rounded-xl bg-black/40 border border-white/10 p-4 space-y-1 text-sm">
          <div className="flex justify-between text-white/70">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-white/70">
            <span>Envío</span>
            <span>${costoEnvio.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-white text-lg font-semibold pt-2 border-t border-white/10">
            <span>Total</span>
            <span>${totalFinal.toLocaleString()}</span>
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={enviarPedido}
          disabled={loading}
          className="w-full mt-6 py-4 rounded-xl text-white font-semibold text-lg
        bg-gradient-to-r from-green-600 to-green-500
        hover:from-green-500 hover:to-green-400
        active:scale-[0.98]
        transition disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Confirmar pedido"}
        </button>
      </div>
    </div>
  );
}
