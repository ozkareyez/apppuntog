import { useCart } from "@/context/CartContext";

export default function ContactForm({ onSuccess }) {
  const { ciudad, setCiudad, total, envio, totalFinal } = useCart();

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <input className="input" placeholder="Nombre completo" />
      <input className="input" placeholder="Teléfono / WhatsApp" />

      <select
        className="input md:col-span-2"
        value={ciudad}
        onChange={(e) => setCiudad(e.target.value)}
      >
        <option value="">Selecciona tu ciudad</option>
        <option value="Cali">Cali</option>
        <option value="Bogotá">Bogotá</option>
        <option value="Medellín">Medellín</option>
        <option value="Otra">Otra</option>
      </select>

      <input className="input md:col-span-2" placeholder="Dirección de envío" />

      {/* RESUMEN */}
      <div className="md:col-span-2 bg-black/40 rounded-xl p-4 space-y-2 text-sm">
        <p>
          Subtotal: <strong>${total.toLocaleString()}</strong>
        </p>
        <p>
          Envío: <strong>${envio.toLocaleString()}</strong>
        </p>
        <p className="text-pink-400 text-lg">
          Total: <strong>${totalFinal.toLocaleString()}</strong>
        </p>
      </div>

      <button
        type="submit"
        className="md:col-span-2 bg-pink-500 hover:bg-pink-600 transition text-white py-3 rounded-xl font-semibold"
        onClick={onSuccess}
      >
        Confirmar pedido
      </button>
    </form>
  );
}
