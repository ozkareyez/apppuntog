import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { calcularEnvio } from "@/utils/calcularEnvio";

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
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar departamentos");
        return res.json();
      })
      .then(setDepartamentos)
      .catch((err) => {
        console.error(err);
        setDepartamentos([]);
      });
  }, []);

  /* ================= CARGAR CIUDADES ================= */
  useEffect(() => {
    if (!form.departamento) return;

    fetch(`${API_URL}/api/ciudades/${form.departamento}`)
      .then((res) => res.json())
      .then(setCiudades)
      .catch(console.error);
  }, [form.departamento]);

  /* ================= ENVÍO ================= */
  const costoEnvio = useMemo(() => {
    return calcularEnvio({
      ciudad: form.ciudad,
      total: subtotal,
    });
  }, [form.ciudad, subtotal]);

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

💰 Subtotal: $${subtotal.toLocaleString()}
🚚 Envío: $${costoEnvio.toLocaleString()}
✅ Total: $${totalFinal.toLocaleString()}
`;

    const phone = "573147041149";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");

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
            placeholder="Nombre"
            className="input"
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <input
            placeholder="Teléfono"
            className="input"
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />

          <input
            placeholder="Dirección"
            className="input"
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />

          <select
            className="input"
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
            className="input"
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

        <div className="mt-4 text-sm border-t border-white/10 pt-4">
          <p>Subtotal: ${subtotal.toLocaleString()}</p>
          <p>Envío: ${costoEnvio.toLocaleString()}</p>
          <p className="text-pink-400 font-bold">
            Total: ${totalFinal.toLocaleString()}
          </p>
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
