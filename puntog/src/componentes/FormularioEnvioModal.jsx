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
          departamento: form.departamento_id,
          ciudad: form.ciudad,
          envio: costoEnvio, // 🔥 MISMO ENVÍO
          carrito: cart.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            precio: p.precio,
            quantity: p.cantidad,
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

        <h3 className="text-center text-xl mb-4 text-white">
          Finalizar pedido
        </h3>

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

        <div className="mt-4 text-sm">
          <p>Subtotal: ${subtotal.toLocaleString()}</p>
          <p>Envío: ${costoEnvio.toLocaleString()}</p>
          <p className="font-bold">Total: ${totalFinal.toLocaleString()}</p>
        </div>

        <button
          onClick={enviarPedido}
          disabled={loading}
          className="w-full mt-4 bg-green-600 py-3 rounded-xl text-white disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar pedido"}
        </button>
      </div>
    </div>
  );
}
