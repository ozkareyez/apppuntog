import { X } from "lucide-react";
import { useState, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { calcularEnvio } from "@/utils/calcularEnvio";

export default function FormularioEnvioModal() {
  const { cart, subtotal, clearCart, setShowCart, setShowShippingModal } =
    useCart();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    departamento: "",
    ciudad: "",
  });

  /* ================= CALCULOS ================= */

  const costoEnvio = useMemo(() => {
    return calcularEnvio({
      ciudad: form.ciudad,
      total: subtotal,
    });
  }, [form.ciudad, subtotal]);

  const totalConEnvio = subtotal + costoEnvio;

  /* ================= ENVIAR ================= */

  const enviarPedido = () => {
    if (!form.nombre || !form.telefono || !form.direccion || !form.ciudad) {
      alert("Por favor completa todos los datos");
      return;
    }

    const mensaje = `
🖤 *Pedido Punto G* 🖤

👤 *Cliente*
Nombre: ${form.nombre}
Teléfono: ${form.telefono}
Dirección: ${form.direccion}
Ciudad: ${form.ciudad}

🛍️ *Productos*
${cart
  .map(
    (p) =>
      `• ${p.nombre} x${p.cantidad} ($${(
        p.precio * p.cantidad
      ).toLocaleString()})`
  )
  .join("\n")}

💰 *Resumen*
Subtotal: $${subtotal.toLocaleString()}
Envío: ${costoEnvio === 0 ? "Gratis" : `$${costoEnvio.toLocaleString()}`}
TOTAL: $${totalConEnvio.toLocaleString()}
`;

    const phone = "573147041149";

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");

    clearCart();
    setShowShippingModal(false);
    setShowCart(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* FONDO */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={() => setShowShippingModal(false)}
      />

      {/* MODAL */}
      <div className="relative bg-[#0f0f0f] text-white w-full max-w-md rounded-xl shadow-2xl p-6">
        <button
          className="absolute top-4 right-4"
          onClick={() => setShowShippingModal(false)}
        >
          <X />
        </button>

        <h3 className="text-xl font-semibold mb-4 text-center">
          Finalizar pedido
        </h3>

        {/* FORMULARIO */}
        <div className="space-y-3">
          <input
            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <input
            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />

          <input
            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2"
            placeholder="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />
          <select
            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2"
            value={form.departamento}
            onChange={(e) =>
              setForm({ ...form, departamento: e.target.value, ciudad: "" })
            }
          >
            <option value="">Departamento</option>
            {departamentos.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.nombre}
              </option>
            ))}
          </select>

          <select
            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2"
            value={form.ciudad}
            disabled={!form.departamento}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
          >
            <option value="">Ciudad</option>
            {ciudades.map((ciu) => (
              <option key={ciu.id} value={ciu.nombre}>
                {ciu.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* RESUMEN */}
        <div className="mt-5 text-sm border-t border-white/10 pt-4 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span>Envío</span>
            <span>
              {costoEnvio === 0 ? "Gratis" : `$${costoEnvio.toLocaleString()}`}
            </span>
          </div>

          <div className="flex justify-between font-bold text-pink-400 text-base mt-2">
            <span>Total</span>
            <span>${totalConEnvio.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={enviarPedido}
          className="w-full mt-5 py-2 rounded bg-green-600 hover:bg-green-700 transition font-semibold"
        >
          Enviar pedido por WhatsApp
        </button>
      </div>
    </div>
  );
}
