import {
  X,
  MapPin,
  User,
  Phone,
  Home,
  Truck,
  Package,
  Shield,
  ChevronDown,
} from "lucide-react";
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

  const totalProductos = cart.reduce((total, item) => total + item.cantidad, 0);

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
      alert("Por favor completa todos los datos obligatorios");
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

      // Éxito
      alert("¡Pedido confirmado! Te contactaremos pronto.");
      clearCart();
      setShowShippingModal(false);
      setShowCart(false);
    } catch {
      alert("Error al enviar el pedido. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Overlay con desenfoque */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/80 via-red-50/30 to-white/80 backdrop-blur-sm"
        onClick={() => setShowShippingModal(false)}
      />

      {/* Modal principal */}
      <div className="relative w-full min-h-screen sm:min-h-0 sm:max-w-2xl sm:my-8 sm:rounded-3xl bg-gradient-to-b from-white via-white to-red-50 shadow-2xl sm:overflow-hidden border border-red-100">
        {/* Decoración de fondo */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-red-100 to-transparent rounded-full opacity-40" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-red-100 to-transparent rounded-full opacity-40" />

        {/* Header del modal - Fijo en móvil */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-600 to-red-700 px-4 sm:px-8 py-4 sm:py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Truck className="text-white" size={20} sm:size={28} />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">
                  Información de Envío
                </h2>
                <p className="text-white/90 text-xs sm:text-sm mt-0.5 sm:mt-1">
                  {totalProductos}{" "}
                  {totalProductos === 1 ? "producto" : "productos"} en tu
                  carrito
                </p>
              </div>
            </div>

            <button
              className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center group"
              onClick={() => setShowShippingModal(false)}
            >
              <X
                className="text-white group-hover:scale-110 transition-transform"
                size={16}
                sm:size={24}
              />
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:grid lg:grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Columna izquierda - Formulario */}
            <div>
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <User className="text-red-600" size={14} sm:size={16} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">
                    Datos Personales
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                  Los datos marcados con <span className="text-red-600">*</span>{" "}
                  son obligatorios
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <InputWithIcon
                  label="Nombre completo"
                  icon={<User size={16} sm:size={18} />}
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />

                <InputWithIcon
                  label="Teléfono"
                  icon={<Phone size={16} sm:size={18} />}
                  value={form.telefono}
                  onChange={(e) =>
                    setForm({ ...form, telefono: e.target.value })
                  }
                  required
                />

                <InputWithIcon
                  label="Dirección completa"
                  icon={<Home size={16} sm:size={18} />}
                  value={form.direccion}
                  onChange={(e) =>
                    setForm({ ...form, direccion: e.target.value })
                  }
                  required
                />

                <SelectWithIcon
                  label="Departamento"
                  icon={<MapPin size={16} sm:size={18} />}
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
                  <option value="">Seleccionar departamento</option>
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </SelectWithIcon>

                <SelectWithIcon
                  label="Ciudad"
                  icon={<MapPin size={16} sm:size={18} />}
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
                  <option value="">Seleccionar ciudad</option>
                  {ciudades.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </SelectWithIcon>
              </div>
            </div>

            {/* Columna derecha - Resumen */}
            <div>
              <div className="lg:sticky lg:top-8">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Package
                        className="text-red-600"
                        size={14}
                        sm:size={16}
                      />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">
                      Resumen del Pedido
                    </h3>
                  </div>

                  {/* Lista de productos */}
                  <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100 p-3 sm:p-4 mb-4 sm:mb-6 max-h-48 sm:max-h-60 overflow-y-auto">
                    <div className="space-y-2 sm:space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 border-b border-red-50 last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                              {item.nombre}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.cantidad} × ${item.precio.toLocaleString()}
                            </p>
                          </div>
                          <p className="font-semibold text-red-600 text-sm sm:text-base ml-2">
                            ${(item.precio * item.cantidad).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resumen de precios */}
                <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100 p-4 sm:p-6 mb-4 sm:mb-6">
                  <h4 className="font-bold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">
                    Detalle de costos
                  </h4>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Subtotal</span>
                      <span className="font-semibold text-gray-800">
                        ${subtotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Truck
                          className="text-red-400"
                          size={14}
                          sm:size={16}
                        />
                        <span className="text-gray-600 text-sm">
                          Costo de envío
                        </span>
                      </div>
                      <span className="font-semibold text-red-600">
                        ${costoEnvio.toLocaleString()}
                      </span>
                    </div>

                    <div className="border-t border-red-100 pt-2 sm:pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base sm:text-lg font-bold text-gray-800">
                          Total a pagar
                        </span>
                        <div className="text-right">
                          <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
                            ${totalFinal.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">IVA incluido</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de seguridad */}
                <div className="flex items-start gap-3 bg-white rounded-xl border border-red-100 p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="text-red-600" size={16} sm:size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-xs sm:text-sm">
                      Compra 100% segura
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Tus datos están protegidos. No compartimos tu información
                      personal.
                    </p>
                  </div>
                </div>

                {/* Botón de confirmación */}
                <button
                  onClick={enviarPedido}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm sm:text-base">
                        Procesando pedido...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm sm:text-base">
                        Confirmar y realizar pedido
                      </span>
                      <Truck size={16} sm:size={20} />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-3 sm:mt-4 px-2">
                  Al confirmar, aceptas nuestros{" "}
                  <a
                    href="/terminos"
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    términos y condiciones
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTES UI ================= */
const InputWithIcon = ({ label, icon, required, ...props }) => (
  <div className="relative">
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-red-400">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white text-sm sm:text-base"
      />
    </div>
  </div>
);

const SelectWithIcon = ({ label, icon, children, ...props }) => (
  <div className="relative">
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-red-400 z-10">
        {icon}
      </div>
      <select
        {...props}
        className="w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white appearance-none text-sm sm:text-base"
      >
        {children}
      </select>
      <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-red-400 pointer-events-none">
        <ChevronDown size={14} sm:size={16} />
      </div>
    </div>
  </div>
);

// import {
//   X,
//   MapPin,
//   User,
//   Phone,
//   Home,
//   Truck,
//   Package,
//   Shield,
// } from "lucide-react";
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
//     ciudad: "",
//     ciudad_id: "",
//   });

//   const totalProductos = cart.reduce((total, item) => total + item.cantidad, 0);

//   /* ================= DATA ================= */
//   useEffect(() => {
//     fetch(`${API_URL}/api/departamentos`)
//       .then((r) => r.json())
//       .then((d) => setDepartamentos(Array.isArray(d) ? d : []))
//       .catch(() => setDepartamentos([]));
//   }, []);

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
//         ciudad: form.ciudad,
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
//       alert("Por favor completa todos los datos obligatorios");
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

//       // Éxito
//       alert("¡Pedido confirmado! Te contactaremos pronto.");
//       clearCart();
//       setShowShippingModal(false);
//       setShowCart(false);
//     } catch {
//       alert("Error al enviar el pedido. Por favor intenta de nuevo.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= UI ================= */
//   return (
//     <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
//       {/* Overlay con desenfoque */}
//       <div
//         className="absolute inset-0 bg-gradient-to-br from-white/80 via-red-50/30 to-white/80 backdrop-blur-sm"
//         onClick={() => setShowShippingModal(false)}
//       />

//       {/* Modal principal */}
//       <div className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-b from-white via-white to-red-50 shadow-2xl overflow-hidden border border-red-100">
//         {/* Decoración de fondo */}
//         <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-red-100 to-transparent rounded-full opacity-40" />
//         <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-red-100 to-transparent rounded-full opacity-40" />

//         {/* Header del modal */}
//         <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 text-white">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
//                 <Truck className="text-white" size={28} />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">Información de Envío</h2>
//                 <p className="text-white/90 text-sm mt-1">
//                   {totalProductos}{" "}
//                   {totalProductos === 1 ? "producto" : "productos"} en tu
//                   carrito
//                 </p>
//               </div>
//             </div>

//             <button
//               className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center group"
//               onClick={() => setShowShippingModal(false)}
//             >
//               <X
//                 className="text-white group-hover:scale-110 transition-transform"
//                 size={24}
//               />
//             </button>
//           </div>
//         </div>

//         {/* Contenido principal */}
//         <div className="px-8 py-8">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Columna izquierda - Formulario */}
//             <div>
//               <div className="mb-6">
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
//                     <User className="text-red-600" size={16} />
//                   </div>
//                   <h3 className="text-lg font-bold text-gray-800">
//                     Datos Personales
//                   </h3>
//                 </div>
//                 <p className="text-sm text-gray-600 mb-6">
//                   Los datos marcados con <span className="text-red-600">*</span>{" "}
//                   son obligatorios
//                 </p>
//               </div>

//               <div className="space-y-6">
//                 <InputWithIcon
//                   label="Nombre completo"
//                   icon={<User size={18} />}
//                   value={form.nombre}
//                   onChange={(e) => setForm({ ...form, nombre: e.target.value })}
//                   required
//                 />

//                 <InputWithIcon
//                   label="Teléfono"
//                   icon={<Phone size={18} />}
//                   value={form.telefono}
//                   onChange={(e) =>
//                     setForm({ ...form, telefono: e.target.value })
//                   }
//                   required
//                 />

//                 <InputWithIcon
//                   label="Dirección completa"
//                   icon={<Home size={18} />}
//                   value={form.direccion}
//                   onChange={(e) =>
//                     setForm({ ...form, direccion: e.target.value })
//                   }
//                   required
//                 />

//                 <SelectWithIcon
//                   label="Departamento"
//                   icon={<MapPin size={18} />}
//                   value={form.departamento_id}
//                   onChange={(e) =>
//                     setForm({
//                       ...form,
//                       departamento_id: e.target.value,
//                       ciudad: "",
//                       ciudad_id: "",
//                     })
//                   }
//                 >
//                   <option value="">Seleccionar departamento</option>
//                   {departamentos.map((d) => (
//                     <option key={d.id} value={d.id}>
//                       {d.nombre}
//                     </option>
//                   ))}
//                 </SelectWithIcon>

//                 <SelectWithIcon
//                   label="Ciudad"
//                   icon={<MapPin size={18} />}
//                   disabled={!form.departamento_id}
//                   value={form.ciudad_id}
//                   onChange={(e) => {
//                     const ciudad = ciudades.find((c) => c.id == e.target.value);
//                     setForm({
//                       ...form,
//                       ciudad_id: e.target.value,
//                       ciudad: ciudad?.nombre || "",
//                     });
//                   }}
//                 >
//                   <option value="">Seleccionar ciudad</option>
//                   {ciudades.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.nombre}
//                     </option>
//                   ))}
//                 </SelectWithIcon>
//               </div>
//             </div>

//             {/* Columna derecha - Resumen */}
//             <div>
//               <div className="sticky top-8">
//                 <div className="mb-6">
//                   <div className="flex items-center gap-2 mb-4">
//                     <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
//                       <Package className="text-red-600" size={16} />
//                     </div>
//                     <h3 className="text-lg font-bold text-gray-800">
//                       Resumen del Pedido
//                     </h3>
//                   </div>

//                   {/* Lista de productos */}
//                   <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100 p-4 mb-6 max-h-60 overflow-y-auto">
//                     <div className="space-y-3">
//                       {cart.map((item) => (
//                         <div
//                           key={item.id}
//                           className="flex items-center justify-between py-2 border-b border-red-50 last:border-0"
//                         >
//                           <div>
//                             <p className="font-medium text-gray-800 text-sm">
//                               {item.nombre}
//                             </p>
//                             <p className="text-xs text-gray-500">
//                               {item.cantidad} × ${item.precio.toLocaleString()}
//                             </p>
//                           </div>
//                           <p className="font-semibold text-red-600">
//                             ${(item.precio * item.cantidad).toLocaleString()}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Resumen de precios */}
//                 <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100 p-6 mb-6">
//                   <h4 className="font-bold text-gray-800 mb-4">
//                     Detalle de costos
//                   </h4>

//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Subtotal</span>
//                       <span className="font-semibold text-gray-800">
//                         ${subtotal.toLocaleString()}
//                       </span>
//                     </div>

//                     <div className="flex justify-between items-center">
//                       <div className="flex items-center gap-2">
//                         <Truck className="text-red-400" size={16} />
//                         <span className="text-gray-600">Costo de envío</span>
//                       </div>
//                       <span className="font-semibold text-red-600">
//                         ${costoEnvio.toLocaleString()}
//                       </span>
//                     </div>

//                     <div className="border-t border-red-100 pt-3">
//                       <div className="flex justify-between items-center">
//                         <span className="text-lg font-bold text-gray-800">
//                           Total a pagar
//                         </span>
//                         <div className="text-right">
//                           <p className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
//                             ${totalFinal.toLocaleString()}
//                           </p>
//                           <p className="text-xs text-gray-500">IVA incluido</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Información de seguridad */}
//                 <div className="flex items-start gap-3 bg-white rounded-xl border border-red-100 p-4 mb-6">
//                   <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                     <Shield className="text-red-600" size={20} />
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-800 text-sm">
//                       Compra 100% segura
//                     </p>
//                     <p className="text-xs text-gray-600 mt-1">
//                       Tus datos están protegidos. No compartimos tu información
//                       personal.
//                     </p>
//                   </div>
//                 </div>

//                 {/* Botón de confirmación */}
//                 <button
//                   onClick={enviarPedido}
//                   disabled={loading}
//                   className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
//                 >
//                   {loading ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       Procesando pedido...
//                     </>
//                   ) : (
//                     <>
//                       <span>Confirmar y realizar pedido</span>
//                       <Truck size={20} />
//                     </>
//                   )}
//                 </button>

//                 <p className="text-center text-xs text-gray-500 mt-4">
//                   Al confirmar, aceptas nuestros
//                   <a
//                     href="/terminos"
//                     className="text-red-600 hover:text-red-700 font-medium mx-1"
//                   >
//                     términos y condiciones
//                   </a>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ================= COMPONENTES UI ================= */
// const InputWithIcon = ({ label, icon, required, ...props }) => (
//   <div className="relative">
//     <label className="block text-sm font-medium text-gray-700 mb-2">
//       {label} {required && <span className="text-red-600">*</span>}
//     </label>
//     <div className="relative">
//       <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400">
//         {icon}
//       </div>
//       <input
//         {...props}
//         className="w-full pl-12 pr-4 py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white"
//       />
//     </div>
//   </div>
// );

// const SelectWithIcon = ({ label, icon, children, ...props }) => (
//   <div className="relative">
//     <label className="block text-sm font-medium text-gray-700 mb-2">
//       {label}
//     </label>
//     <div className="relative">
//       <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 z-10">
//         {icon}
//       </div>
//       <select
//         {...props}
//         className="w-full pl-12 pr-4 py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white appearance-none"
//       >
//         {children}
//       </select>
//       <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-400 pointer-events-none">
//         ▼
//       </div>
//     </div>
//   </div>
// );

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
//     ciudad: "",
//     ciudad_id: "",
//   });

//   /* ================= DATA ================= */
//   useEffect(() => {
//     fetch(`${API_URL}/api/departamentos`)
//       .then((r) => r.json())
//       .then((d) => setDepartamentos(Array.isArray(d) ? d : []))
//       .catch(() => setDepartamentos([]));
//   }, []);

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
//         ciudad: form.ciudad,
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
//     } catch {
//       alert("Error enviando pedido");
//       setLoading(false);
//       return;
//     }

//     clearCart();
//     setShowShippingModal(false);
//     setShowCart(false);
//     setLoading(false);
//   };

//   /* ================= UI ================= */
//   return (
//     <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
//       <div
//         className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//         onClick={() => setShowShippingModal(false)}
//       />

//       <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
//         <button
//           className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
//           onClick={() => setShowShippingModal(false)}
//         >
//           <X />
//         </button>

//         <h3 className="text-2xl font-bold text-center mb-1">
//           <span className="text-red-600"> Finalizar compra</span>
//         </h3>
//         <p className="text-sm text-gray-500 text-center mb-6">
//           Ingresa los datos de envío
//         </p>

//         <div className="space-y-4">
//           <Input
//             label="Nombre completo"
//             value={form.nombre}
//             onChange={(e) => setForm({ ...form, nombre: e.target.value })}
//           />

//           <Input
//             label="Teléfono"
//             value={form.telefono}
//             onChange={(e) => setForm({ ...form, telefono: e.target.value })}
//           />

//           <Input
//             label="Dirección"
//             value={form.direccion}
//             onChange={(e) => setForm({ ...form, direccion: e.target.value })}
//           />

//           <Select
//             label="Departamento"
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
//             <option value="">Seleccionar</option>
//             {departamentos.map((d) => (
//               <option key={d.id} value={d.id}>
//                 {d.nombre}
//               </option>
//             ))}
//           </Select>

//           <Select
//             label="Ciudad"
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
//             <option value="">Seleccionar</option>
//             {ciudades.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.nombre}
//               </option>
//             ))}
//           </Select>
//         </div>

//         {/* RESUMEN */}
//         <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm space-y-2">
//           <div className="flex justify-between">
//             <span className="text-red-600 font-medium">Subtotal</span>
//             <span className="text-red-600">${subtotal.toLocaleString()}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-red-600 font-medium">Envío</span>
//             <span className="text-red-600">${costoEnvio.toLocaleString()}</span>
//           </div>
//           <div className="flex justify-between font-bold text-base pt-2 border-t">
//             <span className="text-red-600 font-medium">Total</span>
//             <span className="text-red-600">${totalFinal.toLocaleString()}</span>
//           </div>
//         </div>

//         <button
//           onClick={enviarPedido}
//           disabled={loading}
//           className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-60"
//         >
//           {loading ? "Procesando..." : "Confirmar pedido"}
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ================= COMPONENTES UI ================= */
// const Input = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm font-medium text-gray-700 mb-1">
//       {label}
//     </label>
//     <input
//       {...props}
//       className="w-full rounded-xl border text-gray-500 border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
//     />
//   </div>
// );

// const Select = ({ label, children, ...props }) => (
//   <div>
//     <label className="block text-sm font-medium text-gray-700 mb-1">
//       {label}
//     </label>
//     <select
//       {...props}
//       className="w-full rounded-xl border text-gray-500 border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
//     >
//       {children}
//     </select>
//   </div>
// );
