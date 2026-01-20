import { useEffect, useState, useMemo } from "react";
import {
  Trash2,
  Search,
  Edit,
  X,
  Save,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  Filter,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

export default function EliminarProducto() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Estados generales
  const [message, setMessage] = useState({ type: "", text: "" });
  const [actionLoading, setActionLoading] = useState(false);

  /* ================= CARGAR DATOS ================= */
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/productos`);

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);

      setMessage({
        type: "success",
        text: `${data.length} productos cargados`,
      });
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTRADO SIMPLE ================= */
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      // Filtro de búsqueda
      const searchMatch =
        !search ||
        p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(search.toLowerCase());

      // Filtro de stock
      let stockMatch = true;
      if (statusFilter === "con_stock") stockMatch = (p.stock || 0) > 0;
      if (statusFilter === "sin_stock") stockMatch = (p.stock || 0) <= 0;

      return searchMatch && stockMatch;
    });
  }, [productos, search, statusFilter]);

  /* ================= ELIMINAR PRODUCTO ================= */
  const confirmarEliminar = async (producto) => {
    if (!producto || !producto.id) {
      setMessage({ type: "error", text: "Producto no válido" });
      return;
    }

    setSelectedProduct(producto);
    setShowDeleteModal(true);
  };

  const ejecutarEliminar = async () => {
    if (!selectedProduct) return;

    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      console.log(`Eliminando producto ID: ${selectedProduct.id}`);

      const response = await fetch(
        `${API_URL}/api/productos/${selectedProduct.id}`,
        { method: "DELETE" },
      );

      const data = await response.json();

      if (response.ok && data.ok === true) {
        // Eliminar del estado local
        setProductos((prev) => prev.filter((p) => p.id !== selectedProduct.id));

        setMessage({
          type: "success",
          text: `"${selectedProduct.nombre}" eliminado`,
        });

        setShowDeleteModal(false);
        setSelectedProduct(null);
      } else {
        throw new Error(data.message || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error eliminando:", error);
      setMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= EDITAR PRODUCTO ================= */
  const abrirEditar = (producto) => {
    setSelectedProduct(producto);
    setShowEditModal(true);
  };

  const guardarEdicion = async () => {
    if (!selectedProduct) return;

    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(
        `${API_URL}/api/productos/${selectedProduct.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: selectedProduct.nombre,
            precio: selectedProduct.precio,
            stock: selectedProduct.stock,
            descripcion: selectedProduct.descripcion,
            categoria_id: selectedProduct.categoria_id,
            es_oferta: selectedProduct.es_oferta ? 1 : 0,
            destacado: selectedProduct.destacado ? 1 : 0,
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.ok === true) {
        // Actualizar en estado local
        setProductos((prev) =>
          prev.map((p) => (p.id === selectedProduct.id ? selectedProduct : p)),
        );

        setMessage({
          type: "success",
          text: `"${selectedProduct.nombre}" actualizado`,
        });

        setShowEditModal(false);
        setSelectedProduct(null);
      } else {
        throw new Error(data.message || "Error al actualizar");
      }
    } catch (error) {
      console.error("Error editando:", error);
      setMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= RENDER ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Productos</h1>
            <p className="text-sm text-gray-600">
              {productos.length} productos • {productosFiltrados.length}{" "}
              filtrados
            </p>
          </div>
          <button
            onClick={cargarProductos}
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Loader2 size={16} />
            Recargar
          </button>
        </div>

        {/* MENSAJES */}
        {message.text && (
          <div
            className={`p-3 rounded-lg mb-4 ${
              message.type === "error"
                ? "bg-red-50 text-red-700"
                : message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-blue-50 text-blue-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* FILTROS */}
        <div className="bg-white rounded-lg border p-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="todos">Todos</option>
                <option value="con_stock">Con stock</option>
                <option value="sin_stock">Sin stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* LISTA DE PRODUCTOS */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No hay productos</p>
          </div>
        ) : (
          <div className="divide-y">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {/* Imagen */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      {producto.imagen ? (
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' font-family='Arial' font-size='14' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ESin imagen%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package size={24} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {producto.nombre || "Sin nombre"}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {producto.id}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        ${Number(producto.precio || 0).toLocaleString()}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            (producto.stock || 0) > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          Stock: {producto.stock || 0}
                        </span>
                        {producto.es_oferta && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                            Oferta
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirEditar(producto)}
                      className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => confirmarEliminar(producto)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL ELIMINAR */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold">Eliminar Producto</h3>
              </div>

              <p className="text-gray-600 mb-6">
                ¿Eliminar <strong>"{selectedProduct.nombre}"</strong> (ID:{" "}
                {selectedProduct.id})?
                <br />
                <span className="text-sm text-red-500">
                  Esta acción no se puede deshacer.
                </span>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={ejecutarEliminar}
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Eliminar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Editar Producto</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={selectedProduct.nombre || ""}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        nombre: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio
                    </label>
                    <input
                      type="number"
                      value={selectedProduct.precio || ""}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          precio: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={selectedProduct.stock || ""}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          stock: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedProduct.es_oferta || false}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          es_oferta: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">En oferta</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarEdicion}
                  disabled={actionLoading}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={16} />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { Trash2, Pencil, Save, X } from "lucide-react";

// const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

// export default function EliminarProducto() {
//   const [productos, setProductos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [eliminandoId, setEliminandoId] = useState(null);
//   const [editandoId, setEditandoId] = useState(null);
//   const [productoOriginal, setProductoOriginal] = useState(null);

//   const [formEdit, setFormEdit] = useState({
//     nombre: "",
//     precio: "",
//     descripcion: "",
//   });

//   /* ================= CARGAR PRODUCTOS ================= */
//   useEffect(() => {
//     const cargarProductos = async () => {
//       try {
//         const res = await fetch(`${API_URL}/api/productos`);
//         const data = await res.json();
//         setProductos(data);
//       } catch (error) {
//         console.error(error);
//         alert("Error al cargar productos");
//       } finally {
//         setLoading(false);
//       }
//     };

//     cargarProductos();
//   }, []);

//   /* ================= ELIMINAR ================= */
//   const eliminarProducto = async (id) => {
//     if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;

//     setEliminandoId(id);

//     try {
//       const res = await fetch(`${API_URL}/api/productos/${id}`, {
//         method: "DELETE",
//       });

//       const data = await res.json();
//       if (!res.ok || !data.ok) throw new Error();

//       setProductos((prev) => prev.filter((p) => p.id !== id));
//     } catch (error) {
//       console.error(error);
//       alert("No se pudo eliminar el producto");
//     } finally {
//       setEliminandoId(null);
//     }
//   };

//   /* ================= INICIAR EDICIÓN ================= */
//   const iniciarEdicion = (producto) => {
//     setEditandoId(producto.id);
//     setProductoOriginal(producto);

//     setFormEdit({
//       nombre: producto.nombre || "",
//       precio: producto.precio || "",
//       descripcion: producto.descripcion || "",
//     });
//   };

//   /* ================= ACTUALIZAR ================= */
//   const actualizarProducto = async (id) => {
//     const payload = {};

//     /* ===== NOMBRE ===== */
//     if (
//       formEdit.nombre.trim() !== "" &&
//       formEdit.nombre.trim() !== productoOriginal.nombre
//     ) {
//       payload.nombre = formEdit.nombre.trim();
//     }

//     /* ===== PRECIO ===== */
//     if (
//       formEdit.precio !== "" &&
//       !isNaN(Number(formEdit.precio)) &&
//       Number(formEdit.precio) !== Number(productoOriginal.precio)
//     ) {
//       payload.precio = Number(formEdit.precio);
//     }

//     /* ===== DESCRIPCIÓN ===== */
//     if (
//       formEdit.descripcion.trim() !== "" &&
//       formEdit.descripcion !== productoOriginal.descripcion
//     ) {
//       payload.descripcion = formEdit.descripcion.trim();
//     }

//     /* ===== VALIDACIÓN FINAL ===== */
//     if (Object.keys(payload).length === 0) {
//       alert("No hay cambios válidos para guardar");
//       return;
//     }

//     console.log("PAYLOAD FINAL:", payload); // 👈 déjalo para debug

//     try {
//       const res = await fetch(`${API_URL}/api/productos/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.ok) {
//         alert(data.message || "Error al actualizar");
//         return;
//       }

//       setProductos((prev) =>
//         prev.map((p) => (p.id === id ? { ...p, ...payload } : p))
//       );

//       setEditandoId(null);
//       setProductoOriginal(null);
//     } catch (error) {
//       console.error(error);
//       alert("Error inesperado al actualizar");
//     }
//   };

//   /* ================= RENDER ================= */
//   if (loading) return <p className="text-center">Cargando productos...</p>;

//   if (productos.length === 0)
//     return (
//       <p className="text-center text-gray-500">No hay productos registrados</p>
//     );

//   return (
//     <div className="max-w-5xl mx-auto px-4">
//       <h2 className="text-2xl font-bold mb-6">Administrar productos</h2>

//       <div className="space-y-4">
//         {productos.map((p) => (
//           <div key={p.id} className="flex gap-4 bg-white p-4 rounded-xl shadow">
//             <img
//               src={p.imagen}
//               alt={p.nombre}
//               className="w-20 h-20 rounded-lg object-cover"
//             />

//             <div className="flex-1">
//               {editandoId === p.id ? (
//                 <>
//                   <input
//                     className="border rounded px-2 py-1 w-full mb-2"
//                     value={formEdit.nombre}
//                     onChange={(e) =>
//                       setFormEdit({ ...formEdit, nombre: e.target.value })
//                     }
//                   />

//                   <input
//                     type="number"
//                     className="border rounded px-2 py-1 w-full mb-2"
//                     value={formEdit.precio}
//                     onChange={(e) =>
//                       setFormEdit({ ...formEdit, precio: e.target.value })
//                     }
//                   />

//                   <textarea
//                     rows={3}
//                     className="border rounded px-2 py-1 w-full resize-none"
//                     value={formEdit.descripcion}
//                     onChange={(e) =>
//                       setFormEdit({
//                         ...formEdit,
//                         descripcion: e.target.value,
//                       })
//                     }
//                   />
//                 </>
//               ) : (
//                 <>
//                   <p className="font-semibold">{p.nombre}</p>
//                   <p className="text-sm text-gray-600">${p.precio}</p>
//                   <p className="text-sm text-gray-500 line-clamp-2">
//                     {p.descripcion || "Sin descripción"}
//                   </p>
//                 </>
//               )}
//             </div>

//             {/* BOTONES */}
//             {editandoId === p.id ? (
//               <div className="flex flex-col gap-2">
//                 <button
//                   onClick={() => actualizarProducto(p.id)}
//                   className="bg-green-600 text-white p-2 rounded-lg"
//                 >
//                   <Save size={16} />
//                 </button>

//                 <button
//                   onClick={() => setEditandoId(null)}
//                   className="bg-gray-400 text-white p-2 rounded-lg"
//                 >
//                   <X size={16} />
//                 </button>
//               </div>
//             ) : (
//               <div className="flex flex-col gap-2">
//                 <button
//                   onClick={() => iniciarEdicion(p)}
//                   className="bg-blue-600 text-white p-2 rounded-lg"
//                 >
//                   <Pencil size={16} />
//                 </button>

//                 <button
//                   onClick={() => eliminarProducto(p.id)}
//                   disabled={eliminandoId === p.id}
//                   className="bg-red-600 text-white p-2 rounded-lg"
//                 >
//                   <Trash2 size={16} />
//                 </button>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
