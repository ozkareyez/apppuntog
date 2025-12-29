// import { useState } from "react";

// // URL del backend en Railway
// const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

// const initialState = {
//   categoria: "",
//   nombre: "",
//   talla: "",
//   color: "",
//   precio: "",
//   imagen: "",
//   categoria_id: "",
//   precio_antes: "",
//   descuento: "",
//   es_oferta: 0,
//   descripcion: "",
// };

// export default function FormularioProducto() {
//   const [form, setForm] = useState(initialState);
//   const [loading, setLoading] = useState(false);
//   const [mensaje, setMensaje] = useState("");
//   const [preview, setPreview] = useState(null);
//   const [subiendoImagen, setSubiendoImagen] = useState(false);

//   /* ================= INPUT NORMAL ================= */
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm({
//       ...form,
//       [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
//     });
//   };

//   /* ================= SUBIR IMAGEN ================= */
//   const handleImageUpload = async (file) => {
//     if (!file) return;

//     if (!file.type.startsWith("image/")) {
//       alert("Solo imágenes permitidas");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("imagen", file);

//     try {
//       setSubiendoImagen(true);

//       const res = await fetch(`${API_URL}/api/upload-imagen`, {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();

//       if (!data.ok) {
//         throw new Error(data.message || "Error al subir imagen");
//       }

//       // Guardar la URL COMPLETA de Cloudinary
//       setForm((prev) => ({
//         ...prev,
//         imagen: data.url, // 👈 URL completa
//       }));

//       // Mostrar preview
//       setPreview(data.url);

//       console.log("✅ Imagen subida:", data.url);

//       console.log("✅ Imagen subida:", data.filename);
//       console.log("📸 Preview URL:", `${API_URL}${data.url}`);
//     } catch (error) {
//       console.error("❌ Error:", error);
//       alert("Error subiendo imagen: " + error.message);
//     } finally {
//       setSubiendoImagen(false);
//     }
//   };

//   /* ================= DROP ================= */
//   const handleDrop = (e) => {
//     e.preventDefault();
//     handleImageUpload(e.dataTransfer.files[0]);
//   };

//   /* ================= SUBMIT ================= */
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMensaje("");

//     if (!form.imagen) {
//       setMensaje("❌ Debes subir una imagen");
//       setLoading(false);
//       return;
//     }

//     try {
//       console.log("📤 Enviando producto:", form);

//       const res = await fetch(`${API_URL}/api/productos`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Error al guardar");
//       }

//       setMensaje("✅ Producto guardado correctamente");
//       setForm(initialState);
//       setPreview(null);

//       console.log("✅ Producto creado con ID:", data.producto_id);
//     } catch (error) {
//       console.error("❌ Error:", error);
//       setMensaje("❌ Error al guardar el producto: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6 border"
//     >
//       <h2 className="text-2xl font-semibold text-gray-800">Nuevo Producto</h2>

//       {/* ================= DROP IMAGE ================= */}
//       <div
//         onDragOver={(e) => e.preventDefault()}
//         onDrop={handleDrop}
//         className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
//                    hover:border-red-500 transition"
//       >
//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) => handleImageUpload(e.target.files[0])}
//           className="hidden"
//           id="imagen"
//         />

//         <label htmlFor="imagen" className="cursor-pointer">
//           {preview ? (
//             <div className="space-y-2">
//               <img
//                 src={preview}
//                 alt="Preview"
//                 className="mx-auto h-48 object-contain rounded"
//               />
//               <p className="text-xs text-gray-500">Archivo: {form.imagen}</p>
//             </div>
//           ) : (
//             <p className="text-gray-500">📂 Arrastra una imagen o haz click</p>
//           )}
//         </label>

//         {subiendoImagen && (
//           <p className="text-sm text-red-500 mt-2">Subiendo imagen...</p>
//         )}
//       </div>

//       {/* ================= CAMPOS ================= */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <input
//           className="input-admin"
//           name="categoria"
//           value={form.categoria}
//           onChange={handleChange}
//           placeholder="Categoría"
//           required
//         />

//         <input
//           className="input-admin"
//           name="nombre"
//           value={form.nombre}
//           onChange={handleChange}
//           placeholder="Nombre del producto"
//           required
//         />

//         <input
//           className="input-admin"
//           name="talla"
//           value={form.talla}
//           onChange={handleChange}
//           placeholder="Talla"
//         />

//         <input
//           className="input-admin"
//           name="color"
//           value={form.color}
//           onChange={handleChange}
//           placeholder="Color"
//         />

//         <input
//           className="input-admin"
//           type="number"
//           step="0.01"
//           name="precio"
//           value={form.precio}
//           onChange={handleChange}
//           placeholder="Precio"
//           required
//         />

//         <input
//           className="input-admin"
//           type="number"
//           step="0.01"
//           name="precio_antes"
//           value={form.precio_antes}
//           onChange={handleChange}
//           placeholder="Precio anterior"
//         />

//         <input
//           className="input-admin"
//           type="number"
//           name="descuento"
//           value={form.descuento}
//           onChange={handleChange}
//           placeholder="Descuento %"
//         />

//         <input
//           className="input-admin"
//           type="number"
//           name="categoria_id"
//           value={form.categoria_id}
//           onChange={handleChange}
//           placeholder="ID Categoría"
//           required
//         />
//       </div>

//       <textarea
//         name="descripcion"
//         value={form.descripcion}
//         onChange={handleChange}
//         placeholder="Descripción del producto"
//         className="input-admin h-28"
//       />

//       <label className="flex items-center gap-2 text-gray-700">
//         <input
//           type="checkbox"
//           name="es_oferta"
//           checked={form.es_oferta === 1}
//           onChange={handleChange}
//         />
//         Producto en oferta
//       </label>

//       <button
//         type="submit"
//         disabled={loading || subiendoImagen}
//         className="w-full bg-red-600 text-white py-3 rounded-lg font-medium
//                    hover:bg-red-700 transition disabled:opacity-50"
//       >
//         {loading ? "Guardando..." : "Guardar producto"}
//       </button>

//       {mensaje && (
//         <p
//           className={`text-sm font-medium ${
//             mensaje.includes("✅") ? "text-green-600" : "text-red-600"
//           }`}
//         >
//           {mensaje}
//         </p>
//       )}
//     </form>
//   );
// }

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

    clearCart();
    setShowShippingModal(false);
    setShowCart(false);
    setLoading(false);
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowShippingModal(false)}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
          onClick={() => setShowShippingModal(false)}
        >
          <X />
        </button>

        <h3 className="text-2xl font-bold text-center mb-1">
          <span className="text-red-600"> Finalizar compra</span>
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Ingresa los datos de envío
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
        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-red-600 font-medium">Subtotal</span>
            <span className="text-red-600">${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-600 font-medium">Envío</span>
            <span className="text-red-600">${costoEnvio.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span className="text-red-600 font-medium">Total</span>
            <span className="text-red-600">${totalFinal.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={enviarPedido}
          disabled={loading}
          className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-60"
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
      className="w-full rounded-xl border text-gray-500 border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
      className="w-full rounded-xl border text-gray-500 border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
    >
      {children}
    </select>
  </div>
);
