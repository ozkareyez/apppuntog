import { useState } from "react";

// URL del backend en Railway
const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

const initialState = {
  categoria: "",
  nombre: "",
  talla: "",
  color: "",
  precio: "",
  imagen: "",
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

  /* ================= INPUT NORMAL ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  /* ================= SUBIR IMAGEN ================= */
  const handleImageUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Solo imágenes permitidas");
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

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.message || "Error al subir imagen");
      }

      // Guardar solo el nombre del archivo
      setForm((prev) => ({
        ...prev,
        imagen: data.filename,
      }));

      // Mostrar preview con la URL completa
      setPreview(`${API_URL}${data.url}`);

      console.log("✅ Imagen subida:", data.filename);
      console.log("📸 Preview URL:", `${API_URL}${data.url}`);
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Error subiendo imagen: " + error.message);
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
      console.log("📤 Enviando producto:", form);

      const res = await fetch(`${API_URL}/api/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al guardar");
      }

      setMensaje("✅ Producto guardado correctamente");
      setForm(initialState);
      setPreview(null);

      console.log("✅ Producto creado con ID:", data.producto_id);
    } catch (error) {
      console.error("❌ Error:", error);
      setMensaje("❌ Error al guardar el producto: " + error.message);
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

      {/* ================= DROP IMAGE ================= */}
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
            <div className="space-y-2">
              <img
                src={preview}
                alt="Preview"
                className="mx-auto h-48 object-contain rounded"
              />
              <p className="text-xs text-gray-500">Archivo: {form.imagen}</p>
            </div>
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
        <input
          className="input-admin"
          name="categoria"
          value={form.categoria}
          onChange={handleChange}
          placeholder="Categoría"
          required
        />

        <input
          className="input-admin"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Nombre del producto"
          required
        />

        <input
          className="input-admin"
          name="talla"
          value={form.talla}
          onChange={handleChange}
          placeholder="Talla"
        />

        <input
          className="input-admin"
          name="color"
          value={form.color}
          onChange={handleChange}
          placeholder="Color"
        />

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

// import { useState } from "react";
// import { API_URL } from "@/config";

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
//       if (!data.ok) throw new Error();

//       setForm((prev) => ({
//         ...prev,
//         imagen: data.filename,
//       }));

//       setPreview(`${API_URL}${data.url}`);
//     } catch {
//       alert("Error subiendo imagen");
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
//       const res = await fetch(`${API_URL}/api/productos`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       setMensaje("✅ Producto guardado correctamente");
//       setForm(initialState);
//       setPreview(null);
//     } catch (error) {
//       console.error(error);
//       setMensaje("❌ Error al guardar el producto");
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
//             <img
//               src={preview}
//               alt="Preview"
//               className="mx-auto h-48 object-contain rounded"
//             />
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
//         />

//         <input
//           className="input-admin"
//           name="nombre"
//           value={form.nombre}
//           onChange={handleChange}
//           placeholder="Nombre del producto"
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
//           name="precio"
//           value={form.precio}
//           onChange={handleChange}
//           placeholder="Precio"
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
