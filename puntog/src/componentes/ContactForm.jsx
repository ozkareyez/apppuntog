import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  Mail,
  MessageSquare,
  Phone,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  HeadphonesIcon,
} from "lucide-react";
import { API_URL } from "@/config";

export default function ContactForm() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [formVisible, setFormVisible] = useState(true);

  const asuntos = [
    "Consulta general",
    "Soporte técnico",
    "Asesoría personalizada",
    "Información de envíos",
    "Problemas con pedido",
    "Devoluciones",
    "Facturación",
    "Otro",
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!form.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!form.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email inválido";
    }
    if (!form.asunto) newErrors.asunto = "Selecciona un asunto";
    if (!form.mensaje.trim()) newErrors.mensaje = "El mensaje es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const enviar = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${API_URL}/api/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!data.ok) throw new Error("Error en el servidor");

      setSubmitted(true);
      setFormVisible(false);
      setForm({ nombre: "", email: "", telefono: "", asunto: "", mensaje: "" });

      setTimeout(() => {
        setFormVisible(true);
        setSubmitted(false);
      }, 5000);
    } catch {
      setErrors({ submit: "Error al enviar el mensaje. Intenta nuevamente." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const supportFeatures = [
    { icon: <Clock className="w-5 h-5" />, text: "Respuesta en 24h" },
    { icon: <Shield className="w-5 h-5" />, text: "Privacidad garantizada" },
    { icon: <HeadphonesIcon className="w-5 h-5" />, text: "Asesoría experta" },
  ];

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-red-600/5 to-rose-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-4">
            <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">
              💬 Soporte Personalizado
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Estamos aquí para
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              ayudarte
            </span>
          </h2>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Nuestro equipo de expertos está listo para responder todas tus
            preguntas y brindarte la mejor atención personalizada.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* INFO PANEL */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-100 p-8 h-full">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Información de contacto
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Escríbenos por cualquier consulta, estamos disponibles las
                    24 horas.
                  </p>
                </div>

                {/* SUPPORT FEATURES */}
                <div className="space-y-4">
                  {supportFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                        {feature.icon}
                      </div>
                      <span className="text-gray-700 font-medium">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CONTACT METHODS */}
                <div className="space-y-6 pt-8 border-t border-red-100">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Otros medios
                    </h4>
                    <div className="space-y-3">
                      <button className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center justify-center gap-2">
                        <MessageSquare size={18} />
                        WhatsApp: +57 300 123 4567
                      </button>
                      <button className="w-full py-3 px-4 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition flex items-center justify-center gap-2">
                        <Mail size={18} />
                        info@puntog.com
                      </button>
                    </div>
                  </div>
                </div>

                {/* WORK HOURS */}
                <div className="pt-6 border-t border-red-100">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Horarios de atención
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Lunes a Viernes: 8am - 8pm
                  </p>
                  <p className="text-gray-600 text-sm">Sábados: 9am - 2pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* FORM PANEL */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {formVisible ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative"
                >
                  {/* FORM CARD */}
                  <div className="bg-white rounded-2xl border border-red-100 overflow-hidden shadow-2xl shadow-red-900/10">
                    {/* FORM HEADER */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            Formulario de contacto
                          </h3>
                          <p className="text-red-100 text-sm">
                            Completa los campos y nos pondremos en contacto
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* FORM BODY */}
                    <form onSubmit={enviar} className="p-6 md:p-8">
                      {/* ERROR MESSAGE */}
                      {errors.submit && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                        >
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-red-700 font-medium">
                              Error al enviar
                            </p>
                            <p className="text-red-600 text-sm">
                              {errors.submit}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* FORM GRID */}
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* NOMBRE */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            Nombre completo *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={form.nombre}
                              onChange={(e) =>
                                handleChange("nombre", e.target.value)
                              }
                              className={`w-full rounded-xl border ${
                                errors.nombre
                                  ? "border-red-300"
                                  : "border-gray-300"
                              } px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition`}
                              placeholder="Ingresa tu nombre"
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                          {errors.nombre && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.nombre}
                            </p>
                          )}
                        </div>

                        {/* EMAIL */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            Email *
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={form.email}
                              onChange={(e) =>
                                handleChange("email", e.target.value)
                              }
                              className={`w-full rounded-xl border ${
                                errors.email
                                  ? "border-red-300"
                                  : "border-gray-300"
                              } px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition`}
                              placeholder="tu@email.com"
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.email}
                            </p>
                          )}
                        </div>

                        {/* TELÉFONO */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            Teléfono (Opcional)
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={form.telefono}
                              onChange={(e) =>
                                handleChange("telefono", e.target.value)
                              }
                              className="w-full rounded-xl border border-gray-300 px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                              placeholder="+57 300 123 4567"
                            />
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>

                        {/* ASUNTO */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Asunto *
                          </label>
                          <select
                            value={form.asunto}
                            onChange={(e) =>
                              handleChange("asunto", e.target.value)
                            }
                            className={`w-full rounded-xl border ${
                              errors.asunto
                                ? "border-red-300"
                                : "border-gray-300"
                            } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition`}
                          >
                            <option value="">Selecciona un asunto</option>
                            {asuntos.map((asunto) => (
                              <option key={asunto} value={asunto}>
                                {asunto}
                              </option>
                            ))}
                          </select>
                          {errors.asunto && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.asunto}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* MENSAJE */}
                      <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                          Mensaje *
                        </label>
                        <div className="relative">
                          <textarea
                            rows="6"
                            value={form.mensaje}
                            onChange={(e) =>
                              handleChange("mensaje", e.target.value)
                            }
                            className={`w-full rounded-xl border ${
                              errors.mensaje
                                ? "border-red-300"
                                : "border-gray-300"
                            } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none`}
                            placeholder="Describe tu consulta en detalle..."
                          />
                          <div className="absolute bottom-3 right-3 text-sm text-gray-500">
                            {form.mensaje.length}/1000
                          </div>
                        </div>
                        {errors.mensaje && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.mensaje}
                          </p>
                        )}
                      </div>

                      {/* PRIVACY AND SUBMIT */}
                      <div className="space-y-6">
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                          <Shield className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-600">
                            Tu información está protegida. No compartimos tus
                            datos con terceros y usamos encriptación de extremo
                            a extremo para todas las comunicaciones.
                          </p>
                        </div>

                        <motion.button
                          type="submit"
                          disabled={loading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Enviando mensaje...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              Enviar mensaje
                            </>
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative"
                >
                  {/* SUCCESS MESSAGE */}
                  <div className="bg-white rounded-2xl border border-red-100 overflow-hidden shadow-2xl shadow-red-900/10">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        ¡Mensaje enviado con éxito!
                      </h3>
                      <p className="text-green-100">
                        Nos pondremos en contacto contigo en menos de 24 horas.
                      </p>
                    </div>

                    <div className="p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        ¿Qué sigue?
                      </h4>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Revisaremos tu consulta y uno de nuestros especialistas
                        te contactará por el medio que hayas proporcionado.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={() => {
                            setFormVisible(true);
                            setSubmitted(false);
                          }}
                          className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg transition"
                        >
                          Enviar otro mensaje
                        </button>
                        <button
                          onClick={() => (window.location.href = "/")}
                          className="px-8 py-3 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition"
                        >
                          Volver al inicio
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

// import { useState } from "react";
// import { API_URL } from "@/config";

// export default function ContactForm() {
//   const [form, setForm] = useState({
//     nombre: "",
//     email: "",
//     mensaje: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const enviar = async (e) => {
//     e.preventDefault();

//     if (!form.nombre || !form.email || !form.mensaje) {
//       alert("Completa todos los campos");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch(`${API_URL}/api/contacto`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();
//       if (!data.ok) throw new Error();

//       alert("Mensaje enviado correctamente ✅");
//       setForm({ nombre: "", email: "", mensaje: "" });
//     } catch {
//       alert("Error enviando mensaje ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="py-16 px-4">
//       <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100">
//         {/* HEADER */}
//         <div className="p-6 border-b">
//           <h2 className="text-2xl font-bold text-gray-800">Contáctanos</h2>
//           <p className="text-sm text-gray-500 mt-1">
//             Déjanos tu mensaje y te responderemos lo antes posible
//           </p>
//         </div>

//         {/* FORM */}
//         <form onSubmit={enviar} className="p-6 space-y-5">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Nombre
//             </label>
//             <input
//               type="text"
//               placeholder="Tu nombre"
//               value={form.nombre}
//               onChange={(e) => setForm({ ...form, nombre: e.target.value })}
//               className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email
//             </label>
//             <input
//               type="email"
//               placeholder="tu@email.com"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Mensaje
//             </label>
//             <textarea
//               rows="4"
//               placeholder="Escribe tu mensaje aquí..."
//               value={form.mensaje}
//               onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
//               className="w-full rounded-xl border border-gray-300 px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
//             />
//           </div>

//           <button
//             disabled={loading}
//             className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
//           >
//             {loading ? "Enviando..." : "Enviar mensaje"}
//           </button>
//         </form>
//       </div>
//     </section>
//   );
// }
