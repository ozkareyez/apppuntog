// import { useState, useEffect } from "react";
// import {
//   Upload,
//   Image as ImageIcon,
//   Tag,
//   DollarSign,
//   Percent,
//   Palette,
//   Ruler,
//   Package,
//   CheckCircle,
//   AlertCircle,
//   Loader2,
//   X,
//   Plus,
//   Minus,
//   Eye,
//   Globe,
//   Star,
//   TrendingUp,
//   Save,
//   RefreshCw,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

// const categoriasEjemplo = [
//   { id: 1, nombre: "Lencería", slug: "lenceria" },
//   { id: 2, nombre: "Juguetes", slug: "juguetes" },
//   { id: 3, nombre: "Lubricantes", slug: "lubricantes" },
//   { id: 4, nombre: "Accesorios", slug: "accesorios" },
//   { id: 5, nombre: "Ropa Interior", slug: "ropa-interior" },
//   { id: 6, nombre: "Fetiche", slug: "fetiche" },
// ];

// const initialState = {
//   categoria_id: "",
//   nombre: "",
//   descripcion: "",
//   precio: "",
//   precio_antes: "",
//   descuento: "",
//   es_oferta: false,
//   stock: 10,
//   talla: "",
//   color: "",
//   material: "",
//   imagen: "",
//   destacado: false,
//   nuevo: true,
//   en_inventario: true,
//   meta_keywords: "",
//   meta_descripcion: "",
// };

// export default function FormularioProducto() {
//   const [form, setForm] = useState(initialState);
//   const [loading, setLoading] = useState(false);
//   const [mensaje, setMensaje] = useState({ type: "", text: "" });
//   const [preview, setPreview] = useState(null);
//   const [subiendoImagen, setSubiendoImagen] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [categorias, setCategorias] = useState([]);
//   const [descripcionCount, setDescripcionCount] = useState(0);
//   const [variaciones, setVariaciones] = useState([]);
//   const [showVariacionForm, setShowVariacionForm] = useState(false);
//   const [nuevaVariacion, setNuevaVariacion] = useState({
//     talla: "",
//     color: "",
//     stock: "",
//     precio_extra: "",
//   });

//   // Cargar categorías al inicio
//   useEffect(() => {
//     // En un caso real, haríamos fetch a la API
//     setCategorias(categoriasEjemplo);
//   }, []);

//   // Contador de descripción
//   useEffect(() => {
//     setDescripcionCount(form.descripcion.length);
//   }, [form.descripcion]);

//   // Calcular descuento automáticamente
//   useEffect(() => {
//     if (form.precio && form.precio_antes) {
//       const precio = parseFloat(form.precio);
//       const precioAntes = parseFloat(form.precio_antes);
//       if (precioAntes > precio) {
//         const descuento = Math.round(
//           ((precioAntes - precio) / precioAntes) * 100
//         );
//         setForm((prev) => ({
//           ...prev,
//           descuento: descuento.toString(),
//           es_oferta: true,
//         }));
//       }
//     }
//   }, [form.precio, form.precio_antes]);

//   /* ================= INPUT HANDLERS ================= */
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleNumberChange = (field, value) => {
//     if (value === "" || /^\d*\.?\d*$/.test(value)) {
//       setForm((prev) => ({ ...prev, [field]: value }));
//     }
//   };

//   /* ================= IMAGE UPLOAD ================= */
//   const handleImageUpload = async (file) => {
//     if (!file) return;

//     if (!file.type.startsWith("image/")) {
//       setMensaje({ type: "error", text: "Solo se permiten imágenes" });
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       setMensaje({ type: "error", text: "La imagen debe ser menor a 5MB" });
//       return;
//     }

//     const formData = new FormData();
//     formData.append("imagen", file);

//     try {
//       setSubiendoImagen(true);

//       // Crear preview local
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreview(reader.result);
//       };
//       reader.readAsDataURL(file);

//       // Subir a servidor
//       const res = await fetch(`${API_URL}/api/upload-imagen`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || "Error al subir imagen");
//       }

//       const data = await res.json();
//       setForm((prev) => ({ ...prev, imagen: data.url }));

//       setMensaje({ type: "success", text: "✅ Imagen subida correctamente" });
//     } catch (error) {
//       console.error("❌ Upload error:", error);
//       setMensaje({ type: "error", text: `❌ ${error.message}` });
//     } finally {
//       setSubiendoImagen(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     const file = e.dataTransfer.files[0];
//     if (file) handleImageUpload(file);
//   };

//   /* ================= VARIACIONES ================= */
//   const agregarVariacion = () => {
//     if (nuevaVariacion.talla || nuevaVariacion.color) {
//       const nueva = {
//         id: Date.now(),
//         talla: nuevaVariacion.talla,
//         color: nuevaVariacion.color,
//         stock: parseInt(nuevaVariacion.stock) || 0,
//         precio_extra: parseFloat(nuevaVariacion.precio_extra) || 0,
//       };
//       setVariaciones([...variaciones, nueva]);
//       setNuevaVariacion({ talla: "", color: "", stock: "", precio_extra: "" });
//       setShowVariacionForm(false);
//     }
//   };

//   const eliminarVariacion = (id) => {
//     setVariaciones(variaciones.filter((v) => v.id !== id));
//   };

//   /* ================= FORM SUBMIT ================= */
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMensaje({ type: "", text: "" });

//     // Validaciones
//     if (!form.imagen) {
//       setMensaje({
//         type: "error",
//         text: "❌ Debes subir una imagen del producto",
//       });
//       setLoading(false);
//       return;
//     }

//     if (!form.categoria_id) {
//       setMensaje({ type: "error", text: "❌ Selecciona una categoría" });
//       setLoading(false);
//       return;
//     }

//     try {
//       const dataToSend = {
//         ...form,
//         variaciones: variaciones.length > 0 ? variaciones : null,
//         precio_antes: form.precio_antes || form.precio,
//         es_oferta: form.es_oferta ? 1 : 0,
//         destacado: form.destacado ? 1 : 0,
//         nuevo: form.nuevo ? 1 : 0,
//         en_inventario: form.en_inventario ? 1 : 0,
//       };

//       console.log("Enviando datos:", dataToSend);

//       const res = await fetch(`${API_URL}/api/productos`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(dataToSend),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Error al guardar el producto");
//       }

//       setMensaje({
//         type: "success",
//         text: "✅ Producto guardado exitosamente. Redirigiendo...",
//       });

//       // Reset form después de éxito
//       setTimeout(() => {
//         setForm(initialState);
//         setPreview(null);
//         setVariaciones([]);
//         setCurrentStep(1);
//         setMensaje({ type: "", text: "" });
//       }, 2000);
//     } catch (error) {
//       console.error("❌ Error guardando producto:", error);
//       setMensaje({ type: "error", text: `❌ ${error.message}` });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const nextStep = () => {
//     if (currentStep < 3) setCurrentStep(currentStep + 1);
//   };

//   const prevStep = () => {
//     if (currentStep > 1) setCurrentStep(currentStep - 1);
//   };

//   const resetForm = () => {
//     setForm(initialState);
//     setPreview(null);
//     setVariaciones([]);
//     setCurrentStep(1);
//     setMensaje({ type: "", text: "" });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
//       <div className="max-w-6xl mx-auto">
//         {/* HEADER */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
//                 Nuevo Producto
//               </h1>
//               <p className="text-gray-600">
//                 Agrega un nuevo producto al catálogo de Punto G
//               </p>
//             </div>
//             <button
//               onClick={resetForm}
//               className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition"
//             >
//               <RefreshCw size={18} />
//               Nuevo Formulario
//             </button>
//           </div>

//           {/* PROGRESS STEPS */}
//           <div className="flex items-center justify-center mb-8">
//             <div className="flex items-center w-full max-w-2xl">
//               {[1, 2, 3].map((step) => (
//                 <div key={step} className="flex items-center flex-1">
//                   <div className="flex flex-col items-center">
//                     <div
//                       className={`
//                       w-10 h-10 rounded-full flex items-center justify-center font-semibold
//                       ${
//                         currentStep >= step
//                           ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
//                           : "bg-gray-200 text-gray-600"
//                       }
//                     `}
//                     >
//                       {currentStep > step ? <CheckCircle size={20} /> : step}
//                     </div>
//                     <span className="mt-2 text-sm font-medium text-gray-700">
//                       {step === 1 && "Información Básica"}
//                       {step === 2 && "Imagen & Variaciones"}
//                       {step === 3 && "SEO & Finalizar"}
//                     </span>
//                   </div>
//                   {step < 3 && (
//                     <div
//                       className={`flex-1 h-1 mx-4 ${
//                         currentStep > step ? "bg-red-600" : "bg-gray-300"
//                       }`}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </motion.div>

//         <form onSubmit={handleSubmit} className="space-y-8">
//           {/* MESSAGE DISPLAY */}
//           <AnimatePresence>
//             {mensaje.text && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 className={`p-4 rounded-xl border ${
//                   mensaje.type === "success"
//                     ? "bg-green-50 border-green-200"
//                     : "bg-red-50 border-red-200"
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   {mensaje.type === "success" ? (
//                     <CheckCircle className="w-5 h-5 text-green-600" />
//                   ) : (
//                     <AlertCircle className="w-5 h-5 text-red-600" />
//                   )}
//                   <p
//                     className={
//                       mensaje.type === "success"
//                         ? "text-green-700"
//                         : "text-red-700"
//                     }
//                   >
//                     {mensaje.text}
//                   </p>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* STEP 1: BASIC INFO */}
//           <AnimatePresence mode="wait">
//             {currentStep === 1 && (
//               <motion.div
//                 key="step1"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: 20 }}
//                 className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm"
//               >
//                 <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
//                   <Package className="w-6 h-6 text-red-600" />
//                   Información Básica del Producto
//                 </h2>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* CATEGORÍA */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Categoría *
//                     </label>
//                     <div className="relative">
//                       <select
//                         name="categoria_id"
//                         value={form.categoria_id}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
//                         required
//                       >
//                         <option value="">Selecciona una categoría</option>
//                         {categorias.map((cat) => (
//                           <option key={cat.id} value={cat.id}>
//                             {cat.nombre}
//                           </option>
//                         ))}
//                       </select>
//                       <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                     </div>
//                   </div>

//                   {/* NOMBRE */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Nombre del Producto *
//                     </label>
//                     <input
//                       type="text"
//                       name="nombre"
//                       value={form.nombre}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                       placeholder="Ej: Lencería de Encaje Roja"
//                       required
//                     />
//                   </div>

//                   {/* PRECIO */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Precio Actual *
//                     </label>
//                     <div className="relative">
//                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                       <input
//                         type="text"
//                         name="precio"
//                         value={form.precio}
//                         onChange={(e) =>
//                           handleNumberChange("precio", e.target.value)
//                         }
//                         className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                         placeholder="0.00"
//                         required
//                       />
//                     </div>
//                   </div>

//                   {/* PRECIO ANTERIOR */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Precio Anterior
//                     </label>
//                     <div className="relative">
//                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                       <input
//                         type="text"
//                         name="precio_antes"
//                         value={form.precio_antes}
//                         onChange={(e) =>
//                           handleNumberChange("precio_antes", e.target.value)
//                         }
//                         className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                         placeholder="0.00"
//                       />
//                     </div>
//                   </div>

//                   {/* DESCUENTO */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Descuento (%)
//                     </label>
//                     <div className="relative">
//                       <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                       <input
//                         type="text"
//                         name="descuento"
//                         value={form.descuento}
//                         onChange={(e) =>
//                           handleNumberChange("descuento", e.target.value)
//                         }
//                         className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                         placeholder="0"
//                         maxLength="3"
//                       />
//                     </div>
//                   </div>

//                   {/* STOCK */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Stock Inicial *
//                     </label>
//                     <input
//                       type="number"
//                       name="stock"
//                       value={form.stock}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                       min="0"
//                       required
//                     />
//                   </div>

//                   {/* TALLA */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Talla
//                     </label>
//                     <div className="relative">
//                       <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                       <input
//                         type="text"
//                         name="talla"
//                         value={form.talla}
//                         onChange={handleChange}
//                         className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                         placeholder="Ej: S, M, L, Única"
//                       />
//                     </div>
//                   </div>

//                   {/* COLOR */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Color
//                     </label>
//                     <div className="relative">
//                       <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                       <input
//                         type="text"
//                         name="color"
//                         value={form.color}
//                         onChange={handleChange}
//                         className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                         placeholder="Ej: Rojo, Negro, Blanco"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* DESCRIPCIÓN */}
//                 <div className="mt-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Descripción Detallada *
//                     </label>
//                     <span className="text-sm text-gray-500">
//                       {descripcionCount}/2000 caracteres
//                     </span>
//                   </div>
//                   <textarea
//                     name="descripcion"
//                     value={form.descripcion}
//                     onChange={handleChange}
//                     rows="6"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
//                     placeholder="Describe el producto en detalle, incluye materiales, cuidados, características especiales..."
//                     maxLength="2000"
//                     required
//                   />
//                 </div>

//                 {/* CHECKBOXES */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//                   <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       name="es_oferta"
//                       checked={form.es_oferta}
//                       onChange={handleChange}
//                       className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
//                     />
//                     <div>
//                       <span className="font-medium text-gray-900">
//                         En Oferta
//                       </span>
//                       <p className="text-sm text-gray-600">
//                         Mostrar como producto en descuento
//                       </p>
//                     </div>
//                   </label>

//                   <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       name="destacado"
//                       checked={form.destacado}
//                       onChange={handleChange}
//                       className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
//                     />
//                     <div>
//                       <span className="font-medium text-gray-900">
//                         Destacado
//                       </span>
//                       <p className="text-sm text-gray-600">
//                         Mostrar en secciones especiales
//                       </p>
//                     </div>
//                   </label>

//                   <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       name="nuevo"
//                       checked={form.nuevo}
//                       onChange={handleChange}
//                       className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
//                     />
//                     <div>
//                       <span className="font-medium text-gray-900">Nuevo</span>
//                       <p className="text-sm text-gray-600">
//                         Marcar como producto nuevo
//                       </p>
//                     </div>
//                   </label>
//                 </div>
//               </motion.div>
//             )}

//             {/* STEP 2: IMAGE & VARIATIONS */}
//             {currentStep === 2 && (
//               <motion.div
//                 key="step2"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: 20 }}
//                 className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm"
//               >
//                 <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
//                   <ImageIcon className="w-6 h-6 text-red-600" />
//                   Imagen y Variaciones
//                 </h2>

//                 {/* IMAGE UPLOAD */}
//                 <div className="mb-8">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Imagen Principal *
//                   </label>
//                   <div
//                     onDragOver={(e) => e.preventDefault()}
//                     onDrop={handleDrop}
//                     className={`
//                       relative border-2 border-dashed rounded-2xl p-8 text-center
//                       transition-all duration-300 cursor-pointer group
//                       ${
//                         preview
//                           ? "border-green-300 bg-green-50/30"
//                           : "border-gray-300 hover:border-red-400 hover:bg-red-50/10"
//                       }
//                     `}
//                   >
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleImageUpload(e.target.files[0])}
//                       className="hidden"
//                       id="imagen-upload"
//                     />

//                     <label htmlFor="imagen-upload" className="cursor-pointer">
//                       {preview ? (
//                         <div className="space-y-4">
//                           <div className="relative inline-block">
//                             <img
//                               src={preview}
//                               alt="Preview"
//                               className="mx-auto h-64 object-contain rounded-xl shadow-lg"
//                             />
//                             <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl" />
//                           </div>
//                           <p className="text-sm text-green-600 font-medium">
//                             ✓ Imagen lista para subir
//                           </p>
//                         </div>
//                       ) : (
//                         <div className="space-y-4">
//                           <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
//                             <Upload className="w-10 h-10 text-red-600" />
//                           </div>
//                           <div>
//                             <p className="text-lg font-medium text-gray-900 mb-2">
//                               Arrastra y suelta tu imagen aquí
//                             </p>
//                             <p className="text-gray-600">
//                               o haz click para seleccionar
//                             </p>
//                             <p className="text-sm text-gray-500 mt-2">
//                               PNG, JPG, GIF hasta 5MB
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                     </label>

//                     {subiendoImagen && (
//                       <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
//                         <div className="text-center">
//                           <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
//                           <p className="text-gray-700 font-medium">
//                             Subiendo imagen...
//                           </p>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* IMAGE URL INPUT */}
//                   <div className="mt-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       O ingresa la URL de la imagen
//                     </label>
//                     <div className="relative">
//                       <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                       <input
//                         type="text"
//                         name="imagen"
//                         value={form.imagen}
//                         onChange={handleChange}
//                         className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                         placeholder="https://ejemplo.com/imagen.jpg"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* VARIACIONES */}
//                 <div>
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-lg font-semibold text-gray-900">
//                       Variaciones del Producto
//                     </h3>
//                     <button
//                       type="button"
//                       onClick={() => setShowVariacionForm(true)}
//                       className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg transition"
//                     >
//                       <Plus size={18} />
//                       Agregar Variación
//                     </button>
//                   </div>

//                   <AnimatePresence>
//                     {showVariacionForm && (
//                       <motion.div
//                         initial={{ opacity: 0, height: 0 }}
//                         animate={{ opacity: 1, height: "auto" }}
//                         exit={{ opacity: 0, height: 0 }}
//                         className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50"
//                       >
//                         <h4 className="font-medium text-gray-900 mb-4">
//                           Nueva Variación
//                         </h4>
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                           <input
//                             type="text"
//                             placeholder="Talla"
//                             value={nuevaVariacion.talla}
//                             onChange={(e) =>
//                               setNuevaVariacion({
//                                 ...nuevaVariacion,
//                                 talla: e.target.value,
//                               })
//                             }
//                             className="px-3 py-2 border border-gray-300 rounded-lg"
//                           />
//                           <input
//                             type="text"
//                             placeholder="Color"
//                             value={nuevaVariacion.color}
//                             onChange={(e) =>
//                               setNuevaVariacion({
//                                 ...nuevaVariacion,
//                                 color: e.target.value,
//                               })
//                             }
//                             className="px-3 py-2 border border-gray-300 rounded-lg"
//                           />
//                           <input
//                             type="number"
//                             placeholder="Stock"
//                             value={nuevaVariacion.stock}
//                             onChange={(e) =>
//                               setNuevaVariacion({
//                                 ...nuevaVariacion,
//                                 stock: e.target.value,
//                               })
//                             }
//                             className="px-3 py-2 border border-gray-300 rounded-lg"
//                           />
//                           <input
//                             type="text"
//                             placeholder="Precio Extra"
//                             value={nuevaVariacion.precio_extra}
//                             onChange={(e) =>
//                               setNuevaVariacion({
//                                 ...nuevaVariacion,
//                                 precio_extra: e.target.value,
//                               })
//                             }
//                             className="px-3 py-2 border border-gray-300 rounded-lg"
//                           />
//                         </div>
//                         <div className="flex gap-2 mt-4">
//                           <button
//                             type="button"
//                             onClick={agregarVariacion}
//                             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
//                           >
//                             Agregar
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setShowVariacionForm(false)}
//                             className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
//                           >
//                             Cancelar
//                           </button>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   {variaciones.length > 0 ? (
//                     <div className="space-y-3">
//                       {variaciones.map((variacion) => (
//                         <div
//                           key={variacion.id}
//                           className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50"
//                         >
//                           <div className="flex items-center gap-4">
//                             <div className="flex items-center gap-2">
//                               <span className="font-medium">Talla:</span>
//                               <span className="text-gray-700">
//                                 {variacion.talla || "-"}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <span className="font-medium">Color:</span>
//                               <span className="text-gray-700">
//                                 {variacion.color || "-"}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <span className="font-medium">Stock:</span>
//                               <span className="text-gray-700">
//                                 {variacion.stock}
//                               </span>
//                             </div>
//                             {variacion.precio_extra > 0 && (
//                               <div className="flex items-center gap-2">
//                                 <span className="font-medium">
//                                   Precio Extra:
//                                 </span>
//                                 <span className="text-red-600 font-bold">
//                                   +${variacion.precio_extra}
//                                 </span>
//                               </div>
//                             )}
//                           </div>
//                           <button
//                             type="button"
//                             onClick={() => eliminarVariacion(variacion.id)}
//                             className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
//                           >
//                             <X size={18} />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="text-center p-8 border border-dashed border-gray-300 rounded-xl">
//                       <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                       <p className="text-gray-600">
//                         No hay variaciones agregadas
//                       </p>
//                       <p className="text-sm text-gray-500 mt-1">
//                         Agrega diferentes tallas, colores o precios
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </motion.div>
//             )}

//             {/* STEP 3: SEO & FINALIZE */}
//             {currentStep === 3 && (
//               <motion.div
//                 key="step3"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: 20 }}
//                 className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm"
//               >
//                 <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
//                   <TrendingUp className="w-6 h-6 text-red-600" />
//                   SEO y Finalizar
//                 </h2>

//                 <div className="space-y-6">
//                   {/* KEYWORDS */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Palabras Clave (SEO)
//                     </label>
//                     <textarea
//                       name="meta_keywords"
//                       value={form.meta_keywords}
//                       onChange={handleChange}
//                       rows="3"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
//                       placeholder="lencería, ropa interior, sexy, encaje, rojo, sensual (separadas por comas)"
//                     />
//                     <p className="text-sm text-gray-500 mt-2">
//                       Estas palabras ayudarán a los motores de búsqueda a
//                       encontrar tu producto
//                     </p>
//                   </div>

//                   {/* META DESCRIPTION */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Descripción para SEO
//                     </label>
//                     <textarea
//                       name="meta_descripcion"
//                       value={form.meta_descripcion}
//                       onChange={handleChange}
//                       rows="3"
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
//                       placeholder="Describe brevemente el producto para mejorar su visibilidad en buscadores..."
//                       maxLength="160"
//                     />
//                     <p className="text-sm text-gray-500 mt-2">
//                       Máximo 160 caracteres para resultados de búsqueda óptimos
//                     </p>
//                   </div>

//                   {/* MATERIAL */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Material / Composición
//                     </label>
//                     <input
//                       type="text"
//                       name="material"
//                       value={form.material}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                       placeholder="Ej: 95% Algodón, 5% Elastano"
//                     />
//                   </div>

//                   {/* DISCLAIMER */}
//                   <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
//                     <div className="flex items-start gap-3">
//                       <Eye className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                       <div>
//                         <h4 className="font-medium text-blue-900 mb-1">
//                           Vista Previa en Tienda
//                         </h4>
//                         <p className="text-blue-700 text-sm">
//                           Antes de publicar, verifica que toda la información
//                           sea correcta y que las imágenes sean de alta calidad.
//                           Una vez publicado, el producto será visible en tu
//                           catálogo público.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* NAVIGATION BUTTONS */}
//           <div className="flex justify-between">
//             {currentStep > 1 ? (
//               <button
//                 type="button"
//                 onClick={prevStep}
//                 className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
//               >
//                 ← Anterior
//               </button>
//             ) : (
//               <div></div>
//             )}

//             <div className="flex gap-3">
//               {currentStep < 3 ? (
//                 <button
//                   type="button"
//                   onClick={nextStep}
//                   className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg transition"
//                 >
//                   Siguiente →
//                 </button>
//               ) : (
//                 <motion.button
//                   type="submit"
//                   disabled={loading}
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-3"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="w-5 h-5 animate-spin" />
//                       Guardando...
//                     </>
//                   ) : (
//                     <>
//                       <Save size={20} />
//                       Publicar Producto
//                     </>
//                   )}
//                 </motion.button>
//               )}
//             </div>
//           </div>
//         </form>

//         {/* PREVIEW CARD */}
//         {(form.nombre || preview) && (
//           <div className="mt-12">
//             <h3 className="text-xl font-bold text-gray-900 mb-6">
//               Vista Previa del Producto
//             </h3>
//             <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
//               <div className="grid md:grid-cols-2 gap-8">
//                 <div>
//                   {preview ? (
//                     <img
//                       src={preview}
//                       alt="Preview"
//                       className="w-full h-64 object-contain rounded-xl"
//                     />
//                   ) : (
//                     <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center">
//                       <ImageIcon className="w-12 h-12 text-gray-400" />
//                     </div>
//                   )}
//                 </div>
//                 <div>
//                   <h4 className="text-2xl font-bold text-gray-900 mb-2">
//                     {form.nombre || "Nombre del Producto"}
//                   </h4>
//                   {form.descripcion && (
//                     <p className="text-gray-600 mb-4 line-clamp-3">
//                       {form.descripcion}
//                     </p>
//                   )}
//                   <div className="space-y-2">
//                     {form.precio && (
//                       <p className="text-3xl font-bold text-red-600">
//                         ${form.precio}
//                         {form.precio_antes &&
//                           form.precio_antes > form.precio && (
//                             <span className="text-lg text-gray-400 line-through ml-2">
//                               ${form.precio_antes}
//                             </span>
//                           )}
//                       </p>
//                     )}
//                     {form.categoria_id && (
//                       <p className="text-sm text-gray-600">
//                         Categoría:{" "}
//                         {
//                           categorias.find((c) => c.id == form.categoria_id)
//                             ?.nombre
//                         }
//                       </p>
//                     )}
//                     {form.stock > 0 && (
//                       <p className="text-sm text-green-600">
//                         ✓ {form.stock} unidades disponibles
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState } from "react";

const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

const initialState = {
  categoria: "",
  nombre: "",
  talla: "",
  color: "",
  precio: "",
  imagen: "", // URL de Cloudinary
  categoria_id: "",
  precio_antes: "",
  descuento: "",
  es_oferta: 0,
  descripcion: "",
};

export default function FormularioProducto() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [preview, setPreview] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  /* ================= INPUTS ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  /* ================= SUBIR IMAGEN ================= */
  const handleImageUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes");
      return;
    }

    const formData = new FormData();
    formData.append("imagen", file);

    try {
      setSubiendoImagen(true);

      const res = await fetch(`${API_URL}/api/upload-imagen`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al subir imagen");
      }

      const data = await res.json();

      // ✅ Guardar URL completa de Cloudinary
      setForm((prev) => ({ ...prev, imagen: data.url }));
      setPreview(data.url);

      console.log("✅ Imagen subida a Cloudinary:", data.url);
    } catch (error) {
      console.error("❌ Upload error:", error);
      alert(error.message);
    } finally {
      setSubiendoImagen(false);
    }
  };

  /* ================= DROP ================= */
  const handleDrop = (e) => {
    e.preventDefault();
    handleImageUpload(e.dataTransfer.files[0]);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    if (!form.imagen) {
      setMensaje("❌ Debes subir una imagen");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al guardar producto");
      }

      setMensaje("✅ Producto guardado correctamente");
      setForm(initialState);
      setPreview(null);
    } catch (error) {
      console.error("❌ Error guardando producto:", error);
      setMensaje("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6 border"
    >
      <h2 className="text-2xl font-semibold text-gray-800">Nuevo Producto</h2>

      {/* ================= IMAGEN ================= */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                   hover:border-red-500 transition"
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files[0])}
          className="hidden"
          id="imagen"
        />

        <label htmlFor="imagen" className="cursor-pointer">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="mx-auto h-48 object-contain rounded"
            />
          ) : (
            <p className="text-gray-500">📂 Arrastra una imagen o haz click</p>
          )}
        </label>

        {subiendoImagen && (
          <p className="text-sm text-red-500 mt-2">Subiendo imagen...</p>
        )}
      </div>

      {/* ================= CAMPOS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ["categoria", "Categoría"],
          ["nombre", "Nombre del producto"],
          ["talla", "Talla"],
          ["color", "Color"],
        ].map(([name, placeholder]) => (
          <input
            key={name}
            className="input-admin"
            name={name}
            value={form[name]}
            onChange={handleChange}
            placeholder={placeholder}
            required={name === "categoria" || name === "nombre"}
          />
        ))}

        <input
          className="input-admin"
          type="number"
          step="0.01"
          name="precio"
          value={form.precio}
          onChange={handleChange}
          placeholder="Precio"
          required
        />

        <input
          className="input-admin"
          type="number"
          step="0.01"
          name="precio_antes"
          value={form.precio_antes}
          onChange={handleChange}
          placeholder="Precio anterior"
        />

        <input
          className="input-admin"
          type="number"
          name="descuento"
          value={form.descuento}
          onChange={handleChange}
          placeholder="Descuento %"
        />

        <input
          className="input-admin"
          type="number"
          name="categoria_id"
          value={form.categoria_id}
          onChange={handleChange}
          placeholder="ID Categoría"
          required
        />
      </div>

      <textarea
        name="descripcion"
        value={form.descripcion}
        onChange={handleChange}
        placeholder="Descripción del producto"
        className="input-admin h-28"
      />

      <label className="flex items-center gap-2 text-gray-700">
        <input
          type="checkbox"
          name="es_oferta"
          checked={form.es_oferta === 1}
          onChange={handleChange}
        />
        Producto en oferta
      </label>

      <button
        type="submit"
        disabled={loading || subiendoImagen}
        className="w-full bg-red-600 text-white py-3 rounded-lg font-medium
                   hover:bg-red-700 transition disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar producto"}
      </button>

      {mensaje && (
        <p
          className={`text-sm font-medium ${
            mensaje.includes("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {mensaje}
        </p>
      )}
    </form>
  );
}
