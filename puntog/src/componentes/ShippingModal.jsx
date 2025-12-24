import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ShippingModal() {
  const { showShippingModal, setShowShippingModal, cart, clearCart } =
    useCart();

  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    departamento: "",
    ciudad: "",
  });

  /* ===== CARGAR DEPARTAMENTOS ===== */
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/departamentos`)
      .then((r) => r.json())
      .then(setDepartamentos)
      .catch(console.error);
  }, []);

  /* ===== CARGAR CIUDADES ===== */
  useEffect(() => {
    if (!form.departamento) {
      setCiudades([]);
      return;
    }

    fetch(
      `${import.meta.env.VITE_API_URL}/api/ciudades?departamento_id=${
        form.departamento
      }`
    )
      .then((r) => r.json())
      .then(setCiudades)
      .catch(console.error);
  }, [form.departamento]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const enviarPedido = async () => {
    if (!cart.length) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/enviar-formulario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, carrito: cart }),
    });

    clearCart();
    setShowShippingModal(false);
  };

  return (
    <AnimatePresence>
      {showShippingModal && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-black w-full max-w-md rounded-xl p-6 relative"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <button
              onClick={() => setShowShippingModal(false)}
              className="absolute top-4 right-4 text-white"
            >
              <X />
            </button>

            <h2 className="text-pink-400 text-xl font-bold mb-4">
              Datos de envío
            </h2>

            <div className="space-y-3">
              <input
                name="nombre"
                placeholder="Nombre"
                onChange={handleChange}
                className="w-full p-3 bg-white/10 text-white rounded"
              />

              <input
                name="email"
                placeholder="Email"
                onChange={handleChange}
                className="w-full p-3 bg-white/10 text-white rounded"
              />

              <input
                name="telefono"
                placeholder="Teléfono"
                onChange={handleChange}
                className="w-full p-3 bg-white/10 text-white rounded"
              />

              <input
                name="direccion"
                placeholder="Dirección"
                onChange={handleChange}
                className="w-full p-3 bg-white/10 text-white rounded"
              />

              <select
                name="departamento"
                onChange={handleChange}
                className="w-full p-3 bg-white/10 text-white rounded"
              >
                <option value="">Departamento</option>
                {departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>

              <select
                name="ciudad"
                onChange={handleChange}
                disabled={!ciudades.length}
                className="w-full p-3 bg-white/10 text-white rounded"
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
              className="w-full mt-5 bg-pink-500 py-3 rounded-xl font-semibold"
            >
              Enviar pedido
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
