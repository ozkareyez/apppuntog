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
  MessageCircle,
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
  const [pedidoId, setPedidoId] = useState(null);

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
  const costoEnvio = useMemo(() => {
    return calcularEnvio({
      ciudad: form.ciudad,
      total: subtotal,
    });
  }, [form.ciudad, subtotal]);

  const totalFinal = useMemo(() => {
    if (typeof costoEnvio === "string" || costoEnvio === 0) {
      return subtotal;
    }
    return subtotal + costoEnvio;
  }, [subtotal, costoEnvio]);

  const mostrarCostoEnvio = useMemo(() => {
    if (costoEnvio === "") return "¡Envío gratis!";
    if (typeof costoEnvio === "string") return costoEnvio;
    return `$${costoEnvio.toLocaleString()}`;
  }, [costoEnvio]);

  const esEnvioGratis = costoEnvio === "" || costoEnvio === 0;

  /* ================= FUNCIÓN WHATSAPP CORREGIDA ================= */
  const construirMensajeWhatsApp = (pedidoId = "PENDIENTE") => {
    const deptoSeleccionado = departamentos.find(
      (d) => d.id == form.departamento_id,
    );
    const ciudadSeleccionada = ciudades.find((c) => c.id == form.ciudad_id);

    const nombreDepto = deptoSeleccionado?.nombre || "";
    const nombreCiudad = ciudadSeleccionada?.nombre || form.ciudad || "";

    const listaProductos = cart
      .map(
        (item) =>
          `${item.cantidad}x ${item.nombre} ($${item.precio.toLocaleString()} c/u)`,
      )
      .join("\n• ");

    const mensaje =
      `🛒 **NUEVO PEDIDO - Punto G Sexshop**\n\n` +
      `📋 **Pedido #:**-**** \n` +
      `📅 **Fecha:** ${new Date().toLocaleDateString("es-CO")}\n\n` +
      `👤 **Datos del Cliente:**\n` +
      `• Nombre: ${form.nombre}\n` +
      `• Teléfono: ${form.telefono}\n` +
      `• Dirección: ${form.direccion}\n` +
      `• Ciudad: ${nombreCiudad}\n` +
      `• Departamento: ${nombreDepto}\n\n` +
      `📦 **Productos (${totalProductos} items):**\n` +
      `• ${listaProductos}\n\n` +
      `💰 **Total a Pagar:**\n` +
      `   Subtotal: $${subtotal.toLocaleString()}\n` +
      `   Envío: ${mostrarCostoEnvio}\n` +
      `   **TOTAL: $${totalFinal.toLocaleString()}**\n\n` +
      `⏰ **Hora del pedido:** ${new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}\n` +
      `📱 **Vía:** Tienda Online PuntoG`;

    return encodeURIComponent(mensaje);
  };

  const abrirWhatsApp = (pedidoId) => {
    const mensaje = construirMensajeWhatsApp(pedidoId);
    const url = `https://wa.me/573183704240?text=${mensaje}`;
    window.open(url, "_blank");
  };

  /* ================= ENVIAR PEDIDO CORREGIDO ================= */
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

    if (form.ciudad.toLowerCase() === "cali" && subtotal < 200000) {
      const confirmar = window.confirm(
        "Para envíos a Cali, el costo del envío varía según la zona. " +
          "¿Deseas continuar con el pedido? Te contactaremos para confirmar el costo exacto.",
      );
      if (!confirmar) return;
    }

    setLoading(true);

    try {
      const costoEnvioNumero = typeof costoEnvio === "number" ? costoEnvio : 0;

      const res = await fetch(`${API_URL}/api/enviar-formulario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          telefono: form.telefono,
          direccion: form.direccion,
          departamento_id: Number(form.departamento_id),
          ciudad_id: Number(form.ciudad_id),
          costo_envio: costoEnvioNumero,
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

      // Usar el ID real del backend o generar uno temporal
      const nuevoPedidoId =
        data.pedido_id || `ORD-${Date.now().toString().slice(-6)}`;
      setPedidoId(nuevoPedidoId);

      // Éxito - mostrar alerta y abrir WhatsApp
      alert("¡Pedido confirmado! Se abrirá WhatsApp para enviar los detalles.");

      // Abrir WhatsApp con los datos
      setTimeout(() => {
        abrirWhatsApp(nuevoPedidoId);
      }, 500);

      // Limpiar carrito y cerrar modales
      setTimeout(() => {
        clearCart();
        setShowShippingModal(false);
        setShowCart(false);
      }, 1000);
    } catch {
      alert("Error al enviar el pedido. Por favor intenta de nuevo.");
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
                <Truck className="text-white w-5 h-5 sm:w-7 sm:h-7" />
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
              <X className="text-white group-hover:scale-110 transition-transform w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Columna izquierda - Formulario */}
            <div>
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <User className="text-red-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                  icon={<User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />

                <InputWithIcon
                  label="Teléfono"
                  icon={<Phone className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
                  value={form.telefono}
                  onChange={(e) =>
                    setForm({ ...form, telefono: e.target.value })
                  }
                  required
                />

                <InputWithIcon
                  label="Dirección completa"
                  icon={<Home className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
                  value={form.direccion}
                  onChange={(e) =>
                    setForm({ ...form, direccion: e.target.value })
                  }
                  required
                />

                <SelectWithIcon
                  label="Departamento"
                  icon={<MapPin className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
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
                  icon={<MapPin className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
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
                      <Package className="text-red-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                              {item.nombre}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.cantidad} × ${item.precio.toLocaleString()}
                            </p>
                          </div>
                          <p className="font-semibold text-red-600 text-sm sm:text-base whitespace-nowrap">
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
                      <span className="font-semibold text-gray-800 text-sm sm:text-base">
                        ${subtotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Truck
                          className={`${esEnvioGratis ? "text-green-500" : "text-red-400"} w-3.5 h-3.5 sm:w-4 sm:h-4`}
                        />
                        <span className="text-gray-600 text-sm">
                          Costo de envío
                          {subtotal >= 200000 && (
                            <span className="text-green-600 text-xs ml-2">
                              ✓ Aplica a envío gratis
                            </span>
                          )}
                        </span>
                      </div>
                      <span
                        className={`font-semibold ${esEnvioGratis ? "text-green-600" : "text-red-600"} text-sm sm:text-base`}
                      >
                        {mostrarCostoEnvio}
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

                {/* Información de seguridad y nota para Cali */}
                <div className="space-y-4">
                  {form.ciudad.toLowerCase() === "cali" &&
                    subtotal < 200000 && (
                      <div className="flex items-start gap-3 bg-yellow-50 rounded-xl border border-yellow-200 p-3 sm:p-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Truck className="text-yellow-600 w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-xs sm:text-sm">
                            Envío a Cali
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            El costo del envío a Cali varía según la zona. Te
                            contactaremos para confirmar el costo exacto antes
                            de procesar tu pedido.
                          </p>
                        </div>
                      </div>
                    )}

                  <div className="flex items-start gap-3 bg-white rounded-xl border border-red-100 p-3 sm:p-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="text-red-600 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-xs sm:text-sm">
                        Compra 100% segura
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Tus datos están protegidos. No compartimos tu
                        información personal.
                      </p>
                    </div>
                  </div>
                </div>

                {/* BOTÓN ÚNICO - CONFIRMAR Y ENVIAR POR WHATSAPP */}
                <button
                  onClick={enviarPedido}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4 group"
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
                      <div className="flex items-center gap-3">
                        <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-sm sm:text-base">
                        {form.ciudad.toLowerCase() === "cali" &&
                        subtotal < 200000
                          ? "Continuar y notificar por WhatsApp"
                          : "Confirmar y notificar por WhatsApp"}
                      </span>
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

                {/* Nota sobre WhatsApp */}
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 text-center">
                    <MessageCircle className="inline w-3 h-3 mr-1 text-green-600" />
                    <strong>Nota:</strong> Después de confirmar el pedido, se
                    abrirá WhatsApp automáticamente para enviarte los detalles.
                  </p>
                </div>
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
        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
//   ChevronDown,
//   MessageCircle,
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
//   const [pedidoId, setPedidoId] = useState(null);

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
//   const costoEnvio = useMemo(() => {
//     return calcularEnvio({
//       ciudad: form.ciudad,
//       total: subtotal,
//     });
//   }, [form.ciudad, subtotal]);

//   const totalFinal = useMemo(() => {
//     if (typeof costoEnvio === "string" || costoEnvio === 0) {
//       return subtotal;
//     }
//     return subtotal + costoEnvio;
//   }, [subtotal, costoEnvio]);

//   const mostrarCostoEnvio = useMemo(() => {
//     if (costoEnvio === "") return "¡Envío gratis!";
//     if (typeof costoEnvio === "string") return costoEnvio;
//     return `$${costoEnvio.toLocaleString()}`;
//   }, [costoEnvio]);

//   const esEnvioGratis = costoEnvio === "" || costoEnvio === 0;

//   /* ================= FUNCIÓN WHATSAPP ================= */
//   const construirMensajeWhatsApp = (pedidoId = "PENDIENTE") => {
//     const deptoSeleccionado = departamentos.find(
//       (d) => d.id == form.departamento_id,
//     );
//     const nombreDepto = deptoSeleccionado?.nombre || "";

//     const listaProductos = cart
//       .map(
//         (item) =>
//           `${item.cantidad}x ${item.nombre} ($${item.precio.toLocaleString()} c/u)`,
//       )
//       .join("\n• ");

//     const mensaje =
//       `🛒 **NUEVO PEDIDO**` +
//       `👤 **Cliente:**\n` +
//       `• Nombre: ${form.nombre}\n` +
//       `• Teléfono: ${form.telefono}\n` +
//       `• Dirección: ${form.direccion}\n` +
//       `• Ciudad: ${form.ciudad}\n` +
//       `• Departamento: ${nombreDepto}\n\n` +
//       `📦 **Productos:**\n• ${listaProductos}\n\n` +
//       `💰 **Total:** $${totalFinal.toLocaleString()}\n` +
//       `   (Subtotal: $${subtotal.toLocaleString()} + Envío: ${mostrarCostoEnvio})\n\n` +
//       `⏰ **Fecha:** ${new Date().toLocaleString()}`;

//     return encodeURIComponent(mensaje);
//   };

//   const abrirWhatsApp = (pedidoId) => {
//     const mensaje = construirMensajeWhatsApp(pedidoId);
//     const url = `https://wa.me/573117687596?text=${mensaje}`;
//      window.open(url, "_blank", "noopener,noreferrer,width=800,height=600");
//   };

//   /* ================= ENVIAR PEDIDO ================= */
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

//     if (form.ciudad.toLowerCase() === "cali" && subtotal < 200000) {
//       const confirmar = window.confirm(
//         "Para envíos a Cali, el costo del envío varía según la zona. " +
//           "¿Deseas continuar con el pedido? Te contactaremos para confirmar el costo exacto.",
//       );
//       if (!confirmar) return;
//     }

//     setLoading(true);

//     try {
//       const costoEnvioNumero = typeof costoEnvio === "number" ? costoEnvio : 0;

//       const res = await fetch(`${API_URL}/api/enviar-formulario`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           nombre: form.nombre,
//           telefono: form.telefono,
//           direccion: form.direccion,
//           departamento_id: Number(form.departamento_id),
//           ciudad_id: Number(form.ciudad_id),
//           costo_envio: costoEnvioNumero,
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

//       // Guardar ID del pedido si viene en la respuesta
//       const nuevoPedidoId =
//         data.pedidoId || `ORD-${Date.now().toString().slice(-6)}`;
//       setPedidoId(nuevoPedidoId);

//       // Éxito - mostrar alerta y abrir WhatsApp
//       alert("¡Pedido confirmado! Se abrirá WhatsApp para enviar los detalles.");

//       // Abrir WhatsApp con los datos
//       setTimeout(() => {
//         abrirWhatsApp(nuevoPedidoId);
//       }, 500);

//       // Limpiar carrito y cerrar modales
//       setTimeout(() => {
//         clearCart();
//         setShowShippingModal(false);
//         setShowCart(false);
//       }, 1000);
//     } catch {
//       alert("Error al enviar el pedido. Por favor intenta de nuevo.");
//       setLoading(false);
//     }
//   };

//   /* ================= UI ================= */
//   return (
//     <div className="fixed inset-0 z-[10000] flex items-start justify-center p-0 sm:p-4 overflow-y-auto">
//       {/* Overlay con desenfoque */}
//       <div
//         className="absolute inset-0 bg-gradient-to-br from-white/80 via-red-50/30 to-white/80 backdrop-blur-sm"
//         onClick={() => setShowShippingModal(false)}
//       />

//       {/* Modal principal */}
//       <div className="relative w-full min-h-screen sm:min-h-0 sm:max-w-2xl sm:my-8 sm:rounded-3xl bg-gradient-to-b from-white via-white to-red-50 shadow-2xl sm:overflow-hidden border border-red-100">
//         {/* Decoración de fondo */}
//         <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-red-100 to-transparent rounded-full opacity-40" />
//         <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-red-100 to-transparent rounded-full opacity-40" />

//         {/* Header del modal - Fijo en móvil */}
//         <div className="sticky top-0 z-10 bg-gradient-to-r from-red-600 to-red-700 px-4 sm:px-8 py-4 sm:py-6 text-white">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3 sm:gap-4">
//               <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
//                 <Truck className="text-white w-5 h-5 sm:w-7 sm:h-7" />
//               </div>
//               <div>
//                 <h2 className="text-lg sm:text-2xl font-bold">
//                   Información de Envío
//                 </h2>
//                 <p className="text-white/90 text-xs sm:text-sm mt-0.5 sm:mt-1">
//                   {totalProductos}{" "}
//                   {totalProductos === 1 ? "producto" : "productos"} en tu
//                   carrito
//                 </p>
//               </div>
//             </div>

//             <button
//               className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center group"
//               onClick={() => setShowShippingModal(false)}
//             >
//               <X className="text-white group-hover:scale-110 transition-transform w-4 h-4 sm:w-6 sm:h-6" />
//             </button>
//           </div>
//         </div>

//         {/* Contenido principal */}
//         <div className="px-4 sm:px-8 py-6 sm:py-8">
//           <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8">
//             {/* Columna izquierda - Formulario */}
//             <div>
//               <div className="mb-4 sm:mb-6">
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center">
//                     <User className="text-red-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                   </div>
//                   <h3 className="text-base sm:text-lg font-bold text-gray-800">
//                     Datos Personales
//                   </h3>
//                 </div>
//                 <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
//                   Los datos marcados con <span className="text-red-600">*</span>{" "}
//                   son obligatorios
//                 </p>
//               </div>

//               <div className="space-y-4 sm:space-y-6">
//                 <InputWithIcon
//                   label="Nombre completo"
//                   icon={<User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
//                   value={form.nombre}
//                   onChange={(e) => setForm({ ...form, nombre: e.target.value })}
//                   required
//                 />

//                 <InputWithIcon
//                   label="Teléfono"
//                   icon={<Phone className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
//                   value={form.telefono}
//                   onChange={(e) =>
//                     setForm({ ...form, telefono: e.target.value })
//                   }
//                   required
//                 />

//                 <InputWithIcon
//                   label="Dirección completa"
//                   icon={<Home className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
//                   value={form.direccion}
//                   onChange={(e) =>
//                     setForm({ ...form, direccion: e.target.value })
//                   }
//                   required
//                 />

//                 <SelectWithIcon
//                   label="Departamento"
//                   icon={<MapPin className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
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
//                   icon={<MapPin className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
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
//               <div className="lg:sticky lg:top-8">
//                 <div className="mb-4 sm:mb-6">
//                   <div className="flex items-center gap-2 mb-3 sm:mb-4">
//                     <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center">
//                       <Package className="text-red-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                     </div>
//                     <h3 className="text-base sm:text-lg font-bold text-gray-800">
//                       Resumen del Pedido
//                     </h3>
//                   </div>

//                   {/* Lista de productos */}
//                   <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100 p-3 sm:p-4 mb-4 sm:mb-6 max-h-48 sm:max-h-60 overflow-y-auto">
//                     <div className="space-y-2 sm:space-y-3">
//                       {cart.map((item) => (
//                         <div
//                           key={item.id}
//                           className="flex items-center justify-between py-2 border-b border-red-50 last:border-0"
//                         >
//                           <div className="flex-1 min-w-0 pr-2">
//                             <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">
//                               {item.nombre}
//                             </p>
//                             <p className="text-xs text-gray-500">
//                               {item.cantidad} × ${item.precio.toLocaleString()}
//                             </p>
//                           </div>
//                           <p className="font-semibold text-red-600 text-sm sm:text-base whitespace-nowrap">
//                             ${(item.precio * item.cantidad).toLocaleString()}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Resumen de precios */}
//                 <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100 p-4 sm:p-6 mb-4 sm:mb-6">
//                   <h4 className="font-bold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">
//                     Detalle de costos
//                   </h4>

//                   <div className="space-y-2 sm:space-y-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600 text-sm">Subtotal</span>
//                       <span className="font-semibold text-gray-800 text-sm sm:text-base">
//                         ${subtotal.toLocaleString()}
//                       </span>
//                     </div>

//                     <div className="flex justify-between items-center">
//                       <div className="flex items-center gap-2">
//                         <Truck
//                           className={`${esEnvioGratis ? "text-green-500" : "text-red-400"} w-3.5 h-3.5 sm:w-4 sm:h-4`}
//                         />
//                         <span className="text-gray-600 text-sm">
//                           Costo de envío
//                           {subtotal >= 200000 && (
//                             <span className="text-green-600 text-xs ml-2">
//                               ✓ Aplica a envío gratis
//                             </span>
//                           )}
//                         </span>
//                       </div>
//                       <span
//                         className={`font-semibold ${esEnvioGratis ? "text-green-600" : "text-red-600"} text-sm sm:text-base`}
//                       >
//                         {mostrarCostoEnvio}
//                       </span>
//                     </div>

//                     <div className="border-t border-red-100 pt-2 sm:pt-3">
//                       <div className="flex justify-between items-center">
//                         <span className="text-base sm:text-lg font-bold text-gray-800">
//                           Total a pagar
//                         </span>
//                         <div className="text-right">
//                           <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
//                             ${totalFinal.toLocaleString()}
//                           </p>
//                           <p className="text-xs text-gray-500">IVA incluido</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Información de seguridad y nota para Cali */}
//                 <div className="space-y-4">
//                   {form.ciudad.toLowerCase() === "cali" &&
//                     subtotal < 200000 && (
//                       <div className="flex items-start gap-3 bg-yellow-50 rounded-xl border border-yellow-200 p-3 sm:p-4">
//                         <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                           <Truck className="text-yellow-600 w-4 h-4 sm:w-5 sm:h-5" />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="font-medium text-gray-800 text-xs sm:text-sm">
//                             Envío a Cali
//                           </p>
//                           <p className="text-xs text-gray-600 mt-1">
//                             El costo del envío a Cali varía según la zona. Te
//                             contactaremos para confirmar el costo exacto antes
//                             de procesar tu pedido.
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                   <div className="flex items-start gap-3 bg-white rounded-xl border border-red-100 p-3 sm:p-4">
//                     <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                       <Shield className="text-red-600 w-4 h-4 sm:w-5 sm:h-5" />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="font-medium text-gray-800 text-xs sm:text-sm">
//                         Compra 100% segura
//                       </p>
//                       <p className="text-xs text-gray-600 mt-1">
//                         Tus datos están protegidos. No compartimos tu
//                         información personal.
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* BOTÓN ÚNICO - CONFIRMAR Y ENVIAR POR WHATSAPP */}
//                 <button
//                   onClick={enviarPedido}
//                   disabled={loading}
//                   className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4 group"
//                 >
//                   {loading ? (
//                     <>
//                       <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       <span className="text-sm sm:text-base">
//                         Procesando pedido...
//                       </span>
//                     </>
//                   ) : (
//                     <>
//                       <div className="flex items-center gap-3">
//                         <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
//                         <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
//                       </div>
//                       <span className="text-sm sm:text-base">
//                         {form.ciudad.toLowerCase() === "cali" &&
//                         subtotal < 200000
//                           ? "Continuar y notificar por WhatsApp"
//                           : "Confirmar y notificar por WhatsApp"}
//                       </span>
//                     </>
//                   )}
//                 </button>

//                 <p className="text-center text-xs text-gray-500 mt-3 sm:mt-4 px-2">
//                   Al confirmar, aceptas nuestros{" "}
//                   <a
//                     href="/terminos"
//                     className="text-red-600 hover:text-red-700 font-medium"
//                   >
//                     términos y condiciones
//                   </a>
//                 </p>

//                 {/* Nota sobre WhatsApp */}
//                 <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
//                   <p className="text-xs text-gray-600 text-center">
//                     <MessageCircle className="inline w-3 h-3 mr-1 text-green-600" />
//                     <strong>Nota:</strong> Después de confirmar el pedido, se
//                     abrirá WhatsApp automáticamente para enviarte los detalles.
//                   </p>
//                 </div>
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
//     <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
//       {label} {required && <span className="text-red-600">*</span>}
//     </label>
//     <div className="relative">
//       <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-red-400">
//         {icon}
//       </div>
//       <input
//         {...props}
//         className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white text-sm sm:text-base"
//       />
//     </div>
//   </div>
// );

// const SelectWithIcon = ({ label, icon, children, ...props }) => (
//   <div className="relative">
//     <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
//       {label}
//     </label>
//     <div className="relative">
//       <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-red-400 z-10">
//         {icon}
//       </div>
//       <select
//         {...props}
//         className="w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white appearance-none text-sm sm:text-base"
//       >
//         {children}
//       </select>
//       <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-red-400 pointer-events-none">
//         <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//       </div>
//     </div>
//   </div>
// );
