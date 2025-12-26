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
    ciudad_id: "",
  });

  /* ================= DATA ================= */
  useEffect(() => {
    fetch(`${API_URL}/api/departamentos`)
      .then((r) => r.json())
      .then((d) => setDepartamentos(Array.isArray(d) ? d : []))
      .catch(() => setDepartamentos([]));
  }, []);

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
      !form.ciudad_id
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
          departamento_id: Number(form.departamento_id),
          ciudad_id: Number(form.ciudad_id),
          costo_envio: costoEnvio,
          total: totalFinal,
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
    } catch {
      alert("Error enviando pedido");
      setLoading(false);
      return;
    }

    const mensaje = `
🖤 *NUEVA ORDEN DE SERVICIO – PUNTO G* 🖤

👤 Cliente: ${form.nombre}
📞 Teléfono: ${form.telefono}
📍 Dirección: ${form.direccion}
🏙️ Ciudad: ${form.ciudad}

🛒 Productos:
${cart
  .map(
    (p) =>
      `• ${p.nombre}
Cantidad: ${p.cantidad}
Precio: $${p.precio.toLocaleString()}`
  )
  .join("\n\n")}

──────────────
Subtotal: $${subtotal.toLocaleString()}
Envío: $${costoEnvio.toLocaleString()}
TOTAL: $${totalFinal.toLocaleString()}
──────────────
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
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowShippingModal(false)}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
          onClick={() => setShowShippingModal(false)}
        >
          <X />
        </button>

        <h3 className="text-xl font-semibold text-gray-900 text-center mb-1">
          Finalizar compra
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Completa los datos de envío
        </p>

        <div className="space-y-4">
          <Input
            label="Nombre completo"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <Input
            label="Teléfono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />

          <Input
            label="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />

          <Select
            label="Departamento"
            value={form.departamento_id}
            onChange={(e) =>
              setForm({
                ...form,
                departamento_id: e.target.value,
                ciudad: "",
                ciudad_id: "",
              })
            }
          >
            <option value="">Seleccionar</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </Select>

          <Select
            label="Ciudad"
            disabled={!form.departamento_id}
            value={form.ciudad_id}
            onChange={(e) => {
              const ciudad = ciudades.find((c) => c.id == e.target.value);
              setForm({
                ...form,
                ciudad_id: e.target.value,
                ciudad: ciudad?.nombre || "",
              });
            }}
          >
            <option value="">Seleccionar</option>
            {ciudades.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </div>

        {/* RESUMEN */}
        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío</span>
            <span>${costoEnvio.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total</span>
            <span>${totalFinal.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={enviarPedido}
          disabled={loading}
          className="w-full mt-6 bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition disabled:opacity-60"
        >
          {loading ? "Procesando..." : "Confirmar pedido"}
        </button>
      </div>
    </div>
  );
}

/* ================= COMPONENTES UI ================= */
const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      {...props}
      className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
    >
      {children}
    </select>
  </div>
);

// import { X } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import { useCart } from "@/context/CartContext";
// import { calcularEnvio } from "@/utils/calcularEnvio";
// import { API_URL } from "@/config";

// export default function FormularioEnvioModal() {
//   const { cart, subtotal, clearCart, setShowShippingModal, setShowCart } =
//     useCart();

//   const [departamentos, setDepartamentos] = useState([]);
//   const [ciudades, setCiudades] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [form, setForm] = useState({
//     nombre: "",
//     telefono: "",
//     direccion: "",
//     departamento_id: "",
//     ciudad: "", // 👈 nombre (para calcular envío)
//     ciudad_id: "", // 👈 id (para backend)
//   });

//   /* ================= DEPARTAMENTOS ================= */
//   useEffect(() => {
//     fetch(`${API_URL}/api/departamentos`)
//       .then((r) => r.json())
//       .then((d) => setDepartamentos(Array.isArray(d) ? d : []))
//       .catch(() => setDepartamentos([]));
//   }, []);

//   /* ================= CIUDADES ================= */
//   useEffect(() => {
//     if (!form.departamento_id) {
//       setCiudades([]);
//       return;
//     }

//     fetch(`${API_URL}/api/ciudades?departamento_id=${form.departamento_id}`)
//       .then((r) => r.json())
//       .then((d) => setCiudades(Array.isArray(d) ? d : []))
//       .catch(() => setCiudades([]));
//   }, [form.departamento_id]);

//   /* ================= ENVÍO ================= */
//   const costoEnvio = useMemo(
//     () =>
//       calcularEnvio({
//         ciudad: form.ciudad, // ✅ NOMBRE (regla intacta)
//         total: subtotal,
//       }),
//     [form.ciudad, subtotal]
//   );

//   const totalFinal = subtotal + costoEnvio;

//   /* ================= ENVIAR ================= */
//   const enviarPedido = async () => {
//     if (
//       !form.nombre ||
//       !form.telefono ||
//       !form.direccion ||
//       !form.departamento_id ||
//       !form.ciudad_id
//     ) {
//       alert("Completa todos los datos");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_URL}/api/enviar-formulario`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           nombre: form.nombre,
//           telefono: form.telefono,
//           direccion: form.direccion,
//           departamento_id: Number(form.departamento_id),
//           ciudad_id: Number(form.ciudad_id),
//           costo_envio: costoEnvio,
//           total: totalFinal,
//           carrito: cart.map((p) => ({
//             id: p.id,
//             nombre: p.nombre,
//             precio: Number(p.precio),
//             cantidad: Number(p.cantidad),
//           })),
//         }),
//       });

//       const data = await res.json();
//       if (!data.ok) throw new Error();
//     } catch (err) {
//       alert("Error enviando pedido");
//       setLoading(false);
//       return;
//     }

//     /* ================= WHATSAPP ================= */
//     const mensaje = `
// 🖤 *NUEVA ORDEN DE SERVICIO – PUNTO G* 🖤

// 👤 *Cliente:* ${form.nombre}
// 📞 *Teléfono:* ${form.telefono}

// 📍 *Dirección:* ${form.direccion}
// 🏙️ *Ciudad:* ${form.ciudad}

// 🛒 *Productos:*
// ${cart
//   .map(
//     (p) =>
//       `• ${p.nombre}
// Cantidad: ${p.cantidad}
// Precio: $${p.precio.toLocaleString()}`
//   )
//   .join("\n\n")}

// ──────────────
// 💰 Subtotal: $${subtotal.toLocaleString()}
// 🚚 Envío: $${costoEnvio.toLocaleString()}
// ✅ TOTAL: $${totalFinal.toLocaleString()}
// ──────────────
// `;

//     window.open(
//       `https://wa.me/573147041149?text=${encodeURIComponent(mensaje)}`,
//       "_blank"
//     );

//     clearCart();
//     setShowShippingModal(false);
//     setShowCart(false);
//     setLoading(false);
//   };

//   /* ================= UI ================= */
//   return (
//     <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
//       <div
//         className="absolute inset-0 bg-black/70"
//         onClick={() => setShowShippingModal(false)}
//       />

//       <div className="relative w-full max-w-md rounded-2xl bg-[#111] p-6">
//         <button
//           className="absolute top-4 right-4 text-white/60"
//           onClick={() => setShowShippingModal(false)}
//         >
//           <X />
//         </button>

//         <h3 className="text-center text-xl mb-4">Finalizar pedido</h3>

//         <div className="space-y-3">
//           <input
//             className="input"
//             placeholder="Nombre"
//             value={form.nombre}
//             onChange={(e) => setForm({ ...form, nombre: e.target.value })}
//           />

//           <input
//             className="input"
//             placeholder="Teléfono"
//             value={form.telefono}
//             onChange={(e) => setForm({ ...form, telefono: e.target.value })}
//           />

//           <input
//             className="input"
//             placeholder="Dirección"
//             value={form.direccion}
//             onChange={(e) => setForm({ ...form, direccion: e.target.value })}
//           />

//           <select
//             className="input"
//             value={form.departamento_id}
//             onChange={(e) =>
//               setForm({
//                 ...form,
//                 departamento_id: e.target.value,
//                 ciudad: "",
//                 ciudad_id: "",
//               })
//             }
//           >
//             <option value="">Departamento</option>
//             {departamentos.map((d) => (
//               <option key={d.id} value={d.id}>
//                 {d.nombre}
//               </option>
//             ))}
//           </select>

//           <select
//             className="input"
//             disabled={!form.departamento_id}
//             value={form.ciudad_id}
//             onChange={(e) => {
//               const ciudad = ciudades.find((c) => c.id == e.target.value);
//               setForm({
//                 ...form,
//                 ciudad_id: e.target.value,
//                 ciudad: ciudad?.nombre || "",
//               });
//             }}
//           >
//             <option value="">Ciudad</option>
//             {ciudades.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.nombre}
//               </option>
//             ))}
//           </select>
//         </div>

//         <button
//           onClick={enviarPedido}
//           disabled={loading}
//           className="w-full mt-6 bg-green-600 py-3 rounded-xl"
//         >
//           {loading ? "Enviando..." : "Confirmar pedido"}
//         </button>
//       </div>
//     </div>
//   );
// }
