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
    departamento: "",
    ciudad: "",
  });

  /* ================= DEPARTAMENTOS ================= */
  useEffect(() => {
    fetch(`${API_URL}/api/departamentos`)
      .then((res) => res.json())
      .then(setDepartamentos)
      .catch(console.error);
  }, []);

  /* ================= CIUDADES ================= */
  useEffect(() => {
    if (!form.departamento) return;

    fetch(`${API_URL}/api/ciudades?departamento_id=${form.departamento}`)
      .then((res) => res.json())
      .then(setCiudades)
      .catch(console.error);
  }, [form.departamento]);

  const costoEnvio = useMemo(
    () => calcularEnvio({ ciudad: form.ciudad, total: subtotal }),
    [form.ciudad, subtotal]
  );

  const totalFinal = subtotal + costoEnvio;

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

      <div className="relative bg-black w-full max-w-md p-6 rounded-xl">
        <button
          className="absolute top-4 right-4"
          onClick={() => setShowShippingModal(false)}
        >
          <X />
        </button>

        <select
          className="input"
          value={form.departamento}
          onChange={(e) =>
            setForm({ ...form, departamento: e.target.value, ciudad: "" })
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
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <button
          onClick={enviarPedido}
          className="w-full mt-4 bg-green-600 py-2 rounded"
        >
          Enviar pedido
        </button>
      </div>
    </div>
  );
}
