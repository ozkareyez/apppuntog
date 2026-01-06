import { useEffect, useState } from "react";
import { Trash2, Pencil, Save, X } from "lucide-react";

const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

export default function EliminarProducto() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [productoOriginal, setProductoOriginal] = useState(null);

  const [formEdit, setFormEdit] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
  });

  /* ================= CARGAR PRODUCTOS ================= */
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/productos`);
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        console.error(error);
        alert("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  /* ================= ELIMINAR ================= */
  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;

    setEliminandoId(id);

    try {
      const res = await fetch(`${API_URL}/api/productos/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error();

      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el producto");
    } finally {
      setEliminandoId(null);
    }
  };

  /* ================= INICIAR EDICIÓN ================= */
  const iniciarEdicion = (producto) => {
    setEditandoId(producto.id);
    setProductoOriginal(producto);

    setFormEdit({
      nombre: producto.nombre || "",
      precio: producto.precio || "",
      descripcion: producto.descripcion || "",
    });
  };

  /* ================= ACTUALIZAR ================= */
  const actualizarProducto = async (id) => {
    const payload = {};

    /* ===== NOMBRE ===== */
    if (
      formEdit.nombre.trim() !== "" &&
      formEdit.nombre.trim() !== productoOriginal.nombre
    ) {
      payload.nombre = formEdit.nombre.trim();
    }

    /* ===== PRECIO ===== */
    if (
      formEdit.precio !== "" &&
      !isNaN(Number(formEdit.precio)) &&
      Number(formEdit.precio) !== Number(productoOriginal.precio)
    ) {
      payload.precio = Number(formEdit.precio);
    }

    /* ===== DESCRIPCIÓN ===== */
    if (
      formEdit.descripcion.trim() !== "" &&
      formEdit.descripcion !== productoOriginal.descripcion
    ) {
      payload.descripcion = formEdit.descripcion.trim();
    }

    /* ===== VALIDACIÓN FINAL ===== */
    if (Object.keys(payload).length === 0) {
      alert("No hay cambios válidos para guardar");
      return;
    }

    console.log("PAYLOAD FINAL:", payload); // 👈 déjalo para debug

    try {
      const res = await fetch(`${API_URL}/api/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        alert(data.message || "Error al actualizar");
        return;
      }

      setProductos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...payload } : p))
      );

      setEditandoId(null);
      setProductoOriginal(null);
    } catch (error) {
      console.error(error);
      alert("Error inesperado al actualizar");
    }
  };

  /* ================= RENDER ================= */
  if (loading) return <p className="text-center">Cargando productos...</p>;

  if (productos.length === 0)
    return (
      <p className="text-center text-gray-500">No hay productos registrados</p>
    );

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Administrar productos</h2>

      <div className="space-y-4">
        {productos.map((p) => (
          <div key={p.id} className="flex gap-4 bg-white p-4 rounded-xl shadow">
            <img
              src={p.imagen}
              alt={p.nombre}
              className="w-20 h-20 rounded-lg object-cover"
            />

            <div className="flex-1">
              {editandoId === p.id ? (
                <>
                  <input
                    className="border rounded px-2 py-1 w-full mb-2"
                    value={formEdit.nombre}
                    onChange={(e) =>
                      setFormEdit({ ...formEdit, nombre: e.target.value })
                    }
                  />

                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-full mb-2"
                    value={formEdit.precio}
                    onChange={(e) =>
                      setFormEdit({ ...formEdit, precio: e.target.value })
                    }
                  />

                  <textarea
                    rows={3}
                    className="border rounded px-2 py-1 w-full resize-none"
                    value={formEdit.descripcion}
                    onChange={(e) =>
                      setFormEdit({
                        ...formEdit,
                        descripcion: e.target.value,
                      })
                    }
                  />
                </>
              ) : (
                <>
                  <p className="font-semibold">{p.nombre}</p>
                  <p className="text-sm text-gray-600">${p.precio}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {p.descripcion || "Sin descripción"}
                  </p>
                </>
              )}
            </div>

            {/* BOTONES */}
            {editandoId === p.id ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => actualizarProducto(p.id)}
                  className="bg-green-600 text-white p-2 rounded-lg"
                >
                  <Save size={16} />
                </button>

                <button
                  onClick={() => setEditandoId(null)}
                  className="bg-gray-400 text-white p-2 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => iniciarEdicion(p)}
                  className="bg-blue-600 text-white p-2 rounded-lg"
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => eliminarProducto(p.id)}
                  disabled={eliminandoId === p.id}
                  className="bg-red-600 text-white p-2 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { Trash2 } from "lucide-react";

// const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

// export default function EliminarProducto() {
//   const [productos, setProductos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [eliminandoId, setEliminandoId] = useState(null);

//   useEffect(() => {
//     const cargarProductos = async () => {
//       try {
//         const res = await fetch(`${API_URL}/api/productos`);
//         const data = await res.json();
//         setProductos(data);
//       } catch (error) {
//         console.error("Error cargando productos:", error);
//         alert("Error al cargar productos");
//       } finally {
//         setLoading(false);
//       }
//     };

//     cargarProductos();
//   }, []);

//   const eliminarProducto = async (id) => {
//     const confirmar = window.confirm(
//       "¿Seguro que deseas eliminar este producto?"
//     );
//     if (!confirmar) return;

//     setEliminandoId(id);

//     try {
//       const res = await fetch(`${API_URL}/api/productos/${id}`, {
//         method: "DELETE",
//       });

//       const data = await res.json();

//       if (!res.ok || !data.ok) {
//         throw new Error(data.message || "Error al eliminar");
//       }

//       // quitar del estado solo si backend confirma
//       setProductos((prev) => prev.filter((p) => p.id !== id));
//     } catch (error) {
//       console.error(error);
//       alert("No se pudo eliminar el producto");
//     } finally {
//       setEliminandoId(null);
//     }
//   };

//   if (loading) {
//     return <p className="text-center">Cargando productos...</p>;
//   }

//   if (productos.length === 0) {
//     return (
//       <p className="text-center text-gray-500">No hay productos activos</p>
//     );
//   }

//   return (
//     <div className="max-w-5xl mx-auto px-4">
//       <h2 className="text-2xl font-bold mb-6">Eliminar productos</h2>

//       <div className="space-y-4">
//         {productos.map((p) => (
//           <div
//             key={p.id}
//             className="flex items-center gap-4 bg-white p-4 rounded-xl shadow"
//           >
//             <img
//               src={p.imagen}
//               alt={p.nombre}
//               className="w-20 h-20 rounded-lg object-cover"
//             />

//             <div className="flex-1">
//               <p className="font-semibold">{p.nombre}</p>
//               <p className="text-sm text-gray-500">${p.precio}</p>
//             </div>

//             <button
//               onClick={() => eliminarProducto(p.id)}
//               disabled={eliminandoId === p.id}
//               className={`px-4 py-2 rounded-lg text-white transition
//                 ${
//                   eliminandoId === p.id
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-red-600 hover:bg-red-700"
//                 }`}
//             >
//               <Trash2 size={16} />
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
