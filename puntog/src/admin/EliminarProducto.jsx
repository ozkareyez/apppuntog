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
  RefreshCw,
  Bug,
  Database,
} from "lucide-react";

const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

export default function EliminarProducto() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Estados generales
  const [message, setMessage] = useState({ type: "", text: "" });
  const [actionLoading, setActionLoading] = useState(false);

  /* ================= CARGAR DATOS CON DEBUG ================= */
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setDebugInfo("🔄 Cargando productos...");

      console.log("📡 Intentando conectar a:", API_URL + "/api/productos");

      const res = await fetch(`${API_URL}/api/productos`);

      setDebugInfo(`📊 Status: ${res.status} ${res.statusText}`);
      console.log("Response status:", res.status, res.statusText);

      // Verificar el tipo de contenido
      const contentType = res.headers.get("content-type");
      setDebugInfo((prev) => prev + `\n📄 Content-Type: ${contentType}`);

      if (!res.ok) {
        // Intentar leer el error como texto
        const errorText = await res.text();
        setDebugInfo(
          (prev) =>
            prev +
            `\n❌ Error body (${errorText.length} chars): ${errorText.substring(0, 200)}...`,
        );
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("📦 Datos recibidos:", data);

      if (!Array.isArray(data)) {
        setDebugInfo(
          (prev) => prev + `\n⚠️ Los datos NO son un array: ${typeof data}`,
        );
        throw new Error("Formato de datos inválido: no es un array");
      }

      setProductos(data);
      setDebugInfo((prev) => prev + `\n✅ ${data.length} productos cargados`);
      setMessage({
        type: "success",
        text: `${data.length} productos cargados`,
      });
    } catch (error) {
      console.error("💥 Error cargando productos:", error);
      setDebugInfo((prev) => prev + `\n💥 Error: ${error.message}`);
      setMessage({
        type: "error",
        text: `Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= PRUEBA DE ENDPOINT DELETE ================= */
  const testDeleteEndpoint = async () => {
    if (!selectedProduct) return;

    setActionLoading(true);
    setDebugInfo(`🧪 Probando DELETE para ID ${selectedProduct.id}...`);

    try {
      console.log(
        `🧪 TEST: DELETE ${API_URL}/api/productos/${selectedProduct.id}`,
      );

      const response = await fetch(
        `${API_URL}/api/productos/${selectedProduct.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        },
      );

      // Obtener el contenido como texto primero
      const responseText = await response.text();

      setDebugInfo(
        (prev) =>
          prev + `\n📊 Status: ${response.status} ${response.statusText}`,
      );
      setDebugInfo(
        (prev) =>
          prev + `\n📄 Content-Type: ${response.headers.get("content-type")}`,
      );
      setDebugInfo(
        (prev) =>
          prev +
          `\n📝 Response (${responseText.length} chars): ${responseText.substring(0, 300)}...`,
      );

      console.log("Response text:", responseText);

      if (response.ok) {
        // Intentar parsear como JSON
        try {
          if (responseText.trim()) {
            const data = JSON.parse(responseText);
            setDebugInfo(
              (prev) =>
                prev + `\n✅ JSON parseado: ${JSON.stringify(data, null, 2)}`,
            );

            if (data.ok === true) {
              // Eliminar del estado local
              setProductos((prev) =>
                prev.filter((p) => p.id !== selectedProduct.id),
              );
              setMessage({
                type: "success",
                text: `"${selectedProduct.nombre}" eliminado correctamente`,
              });
              setShowDeleteModal(false);
              setSelectedProduct(null);
            } else {
              throw new Error(data.message || "Respuesta no exitosa");
            }
          } else {
            // Respuesta vacía pero OK
            setProductos((prev) =>
              prev.filter((p) => p.id !== selectedProduct.id),
            );
            setMessage({
              type: "success",
              text: `"${selectedProduct.nombre}" eliminado`,
            });
            setShowDeleteModal(false);
            setSelectedProduct(null);
          }
        } catch (jsonError) {
          setDebugInfo(
            (prev) => prev + `\n⚠️ No es JSON válido: ${jsonError.message}`,
          );

          // Si no es JSON pero la respuesta es exitosa, igual eliminamos
          if (response.ok) {
            setProductos((prev) =>
              prev.filter((p) => p.id !== selectedProduct.id),
            );
            setMessage({
              type: "success",
              text: `"${selectedProduct.nombre}" eliminado (respuesta no JSON)`,
            });
            setShowDeleteModal(false);
            setSelectedProduct(null);
          } else {
            throw new Error(
              `Respuesta no válida: ${responseText.substring(0, 100)}`,
            );
          }
        }
      } else {
        throw new Error(
          `HTTP ${response.status}: ${responseText.substring(0, 100)}`,
        );
      }
    } catch (error) {
      console.error("💥 Error en test DELETE:", error);
      setDebugInfo((prev) => prev + `\n💥 Error: ${error.message}`);
      setMessage({
        type: "error",
        text: `Error: ${error.message}`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= FILTRADO SIMPLE ================= */
  const productosFiltrados = useMemo(() => {
    if (!search.trim()) return productos;

    const term = search.toLowerCase();
    return productos.filter(
      (p) =>
        (p.nombre && p.nombre.toLowerCase().includes(term)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term)),
    );
  }, [productos, search]);

  /* ================= RENDER ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Debug Productos</h1>
            <p className="text-sm text-gray-600">
              {productos.length} productos • {productosFiltrados.length}{" "}
              filtrados
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cargarProductos}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Recargar
            </button>
            <button
              onClick={() => {
                // Prueba directa del endpoint
                fetch(`${API_URL}/api/productos/1`, { method: "DELETE" })
                  .then((r) => r.text())
                  .then((text) => {
                    console.log("Test DELETE response:", text);
                    setDebugInfo(
                      (prev) =>
                        prev +
                        `\n🧪 Test DELETE ID 1: ${text.substring(0, 200)}`,
                    );
                  })
                  .catch((err) => {
                    console.error("Test DELETE error:", err);
                    setDebugInfo(
                      (prev) => prev + `\n🧪 Test DELETE error: ${err.message}`,
                    );
                  });
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Bug size={16} />
              Test DELETE
            </button>
          </div>
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
            <div className="flex items-center gap-2">
              {message.type === "error" ? (
                <AlertCircle size={16} />
              ) : (
                <CheckCircle size={16} />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* DEBUG INFO */}
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 font-mono text-sm whitespace-pre-wrap overflow-auto max-h-64">
          <div className="flex items-center gap-2 mb-2">
            <Database size={16} />
            <span className="font-bold">Debug Info</span>
          </div>
          {debugInfo || "No hay información de debug todavía"}
        </div>

        {/* FILTRO */}
        <div className="bg-white rounded-lg border p-3 mb-4">
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
                    {/* Imagen con manejo de error */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      {producto.imagen || producto.imagen_cloud1 ? (
                        <img
                          src={producto.imagen || producto.imagen_cloud1}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' font-family='Arial' font-size='10' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ESin imagen%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="text-gray-400">
                          <Package size={24} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {producto.nombre || `Producto ${producto.id}`}
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
                      onClick={() => {
                        setSelectedProduct(producto);
                        setShowDeleteModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL ELIMINAR CON DEBUG */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bug className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-bold">Debug Eliminar Producto</h3>
                  <p className="text-sm text-gray-600">
                    ID: {selectedProduct.id} • Nombre: {selectedProduct.nombre}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="font-medium text-gray-900 mb-2">
                  URL que se intentará:
                </p>
                <code className="text-sm bg-gray-200 p-2 rounded block">
                  DELETE {API_URL}/api/productos/{selectedProduct.id}
                </code>
                <p className="text-sm text-gray-600 mt-3">
                  Este es un modal de DEBUG. Mostrará exactamente qué respuesta
                  recibe del servidor.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={testDeleteEndpoint}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Probando...
                    </>
                  ) : (
                    <>
                      <Bug size={16} />
                      Probar Eliminación (Debug)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSTRUCCIONES */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">⚠️ Problema Detectado</h3>
        <p className="text-blue-800 mb-2">
          El backend está devolviendo una página HTML en lugar de JSON. Esto
          significa que:
        </p>
        <ul className="text-blue-700 text-sm space-y-1 list-disc pl-5">
          <li>El servidor no está ejecutando tu código Node.js</li>
          <li>Railway está sirviendo una página por defecto</li>
          <li>El endpoint DELETE probablemente no existe</li>
        </ul>
        <p className="text-blue-800 mt-3 font-medium">Acciones recomendadas:</p>
        <ol className="text-blue-700 text-sm space-y-1 list-decimal pl-5">
          <li>Verifica que tu backend esté desplegado en Railway</li>
          <li>Revisa los logs de Railway</li>
          <li>Asegúrate de que el puerto 3002 esté expuesto</li>
          <li>Usa el botón "Test DELETE" arriba para diagnosticar</li>
        </ol>
      </div>
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
