import { useEffect, useState, useMemo } from "react";
import {
  Trash2,
  Pencil,
  Save,
  X,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Package,
  DollarSign,
  Tag,
  ChevronDown,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  BarChart3,
  Edit3,
  Image as ImageIcon,
  Shield,
  Star,
  FileText,
  PlusCircle,
  ShoppingBag,
  ImageOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

export default function EliminarProducto() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("nombre_asc");

  // Estados para eliminación y edición
  const [productoToDelete, setProductoToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formEdit, setFormEdit] = useState({
    nombre: "",
    precio: "",
    precio_antes: "",
    descuento: "",
    descripcion: "",
    categoria_id: "",
    es_oferta: false,
    stock: 0,
    destacado: false,
    nuevo: false,
  });
  const [saving, setSaving] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  /* ================= CARGAR DATOS ================= */
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      setDebugInfo(null);

      console.log(`🔄 Cargando datos de: ${API_URL}`);

      // Cargar productos
      const resProductos = await fetch(`${API_URL}/api/productos`, {
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      });

      console.log(`📊 Productos response status: ${resProductos.status}`);

      if (!resProductos.ok) {
        const errorText = await resProductos.text();
        throw new Error(
          `HTTP ${resProductos.status}: ${errorText.substring(0, 100)}`,
        );
      }

      const dataProductos = await resProductos.json();
      console.log(
        `✅ Productos recibidos: ${Array.isArray(dataProductos) ? dataProductos.length : "no array"}`,
      );

      let productosData = [];
      if (Array.isArray(dataProductos)) {
        productosData = dataProductos;
      } else if (dataProductos && Array.isArray(dataProductos.results)) {
        productosData = dataProductos.results;
      } else if (dataProductos && Array.isArray(dataProductos.data)) {
        productosData = dataProductos.data;
      } else if (dataProductos && typeof dataProductos === "object") {
        // Buscar cualquier array en el objeto
        const arrayKeys = Object.keys(dataProductos).filter((key) =>
          Array.isArray(dataProductos[key]),
        );
        if (arrayKeys.length > 0) {
          productosData = dataProductos[arrayKeys[0]];
        }
      }

      if (!Array.isArray(productosData)) {
        console.warn("Formato de productos inesperado:", dataProductos);
        productosData = [];
      }

      // Filtrar productos con imágenes válidas
      const productosConImagenesValidas = productosData.map((producto) => {
        // Verificar y limpiar URLs de imágenes
        const imagen = producto.imagen || producto.imagen_cloud1;
        const imagenUrl =
          imagen && imagen !== "null" && imagen !== "undefined" ? imagen : null;

        // Verificar si la URL es válida (no null/undefined y tiene formato de URL)
        const imagenValida =
          imagenUrl &&
          (imagenUrl.startsWith("http://") ||
            imagenUrl.startsWith("https://") ||
            imagenUrl.startsWith("data:") ||
            imagenUrl.startsWith("/"));

        return {
          ...producto,
          imagen: imagenValida ? imagenUrl : "/imagenes/no-image.png",
          // Campos adicionales para debugging
          _debug: {
            originalImagen: producto.imagen,
            imagenValida: imagenValida,
            imagenUrl: imagenUrl,
          },
        };
      });

      setProductos(productosConImagenesValidas);
      console.log(
        `📦 Productos procesados: ${productosConImagenesValidas.length}`,
      );

      // Cargar categorías
      try {
        const resCategorias = await fetch(`${API_URL}/api/categorias`, {
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        });

        if (resCategorias.ok) {
          const dataCategorias = await resCategorias.json();
          setCategorias(Array.isArray(dataCategorias) ? dataCategorias : []);
          console.log(
            `🏷️ Categorías cargadas: ${Array.isArray(dataCategorias) ? dataCategorias.length : 0}`,
          );
        }
      } catch (categoriasError) {
        console.warn("Error cargando categorías:", categoriasError);
      }

      setSuccessMessage(
        `✅ ${productosConImagenesValidas.length} productos cargados`,
      );
      setDebugInfo(`Servidor: ${API_URL} | Status: ${resProductos.status}`);
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
      setError(`Error: ${error.message}`);
      setProductos([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  /* ================= ELIMINAR PRODUCTO - Versión mejorada ================= */
  const confirmarEliminacion = (producto) => {
    setProductoToDelete(producto);
    setShowDeleteModal(true);
    setError(null);
  };

  const eliminarProducto = async () => {
    if (!productoToDelete) return;

    setDeleting(true);
    setError(null);
    setDebugInfo(
      `Iniciando eliminación del producto ID: ${productoToDelete.id}`,
    );

    try {
      const productoId = productoToDelete.id;
      if (!productoId) {
        throw new Error("ID del producto no válido");
      }

      console.log(
        `🔄 Enviando DELETE a: ${API_URL}/api/productos/${productoId}`,
      );

      // Opción 1: DELETE directo
      const deleteRes = await fetch(`${API_URL}/api/productos/${productoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log(`📊 DELETE Response Status: ${deleteRes.status}`);
      setDebugInfo(
        `DELETE Status: ${deleteRes.status} ${deleteRes.statusText}`,
      );

      // Obtener la respuesta como texto primero
      const responseText = await deleteRes.text();
      console.log(
        `📝 Response Text (${responseText.length} chars):`,
        responseText.substring(0, 200),
      );

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.warn("Respuesta no es JSON válido:", responseText);
        data = { ok: false, message: "Respuesta no válida del servidor" };
      }

      if (deleteRes.ok) {
        // Éxito: eliminar de la lista local
        setProductos((prev) => prev.filter((p) => p.id !== productoId));

        setSuccessMessage(
          `✅ Producto "${productoToDelete.nombre}" eliminado correctamente`,
        );
        setShowDeleteModal(false);
        setProductoToDelete(null);

        setDebugInfo(
          `Producto ${productoId} eliminado exitosamente | ${new Date().toLocaleTimeString()}`,
        );
      } else if (deleteRes.status === 404) {
        // Endpoint DELETE no existe, intentar con PUT como alternativa
        console.log("⚠️ DELETE 404, intentando con PUT...");
        setDebugInfo("DELETE endpoint no encontrado, intentando PUT...");

        try {
          const putRes = await fetch(`${API_URL}/api/productos/${productoId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ activo: 0 }),
          });

          if (putRes.ok) {
            // Marcar como inactivo localmente
            setProductos((prev) =>
              prev.map((p) => (p.id === productoId ? { ...p, activo: 0 } : p)),
            );

            setSuccessMessage(
              `⚠️ Producto "${productoToDelete.nombre}" marcado como inactivo (DELETE endpoint no disponible)`,
            );
            setShowDeleteModal(false);
            setProductoToDelete(null);

            setDebugInfo(
              `Producto ${productoId} marcado como inactivo | ${new Date().toLocaleTimeString()}`,
            );
          } else {
            // Si PUT también falla, eliminar solo localmente
            throw new Error("PUT también falló");
          }
        } catch (putError) {
          // Eliminar solo localmente como último recurso
          console.warn("Eliminando solo localmente:", putError);
          setProductos((prev) => prev.filter((p) => p.id !== productoId));

          setSuccessMessage(
            `⚠️ Producto "${productoToDelete.nombre}" eliminado localmente. Recarga la página para sincronizar con el servidor.`,
          );
          setShowDeleteModal(false);
          setProductoToDelete(null);

          setDebugInfo(
            `Producto ${productoId} eliminado solo localmente | ${new Date().toLocaleTimeString()}`,
          );
        }
      } else {
        // Otro error HTTP
        throw new Error(
          data.message ||
            `Error ${deleteRes.status}: ${responseText.substring(0, 100)}`,
        );
      }
    } catch (error) {
      console.error("❌ Error eliminando producto:", error);
      setError(`Error al eliminar: ${error.message}`);
      setDebugInfo(
        `Error: ${error.message} | ${new Date().toLocaleTimeString()}`,
      );
    } finally {
      setDeleting(false);

      // Auto-limpiar mensajes después de 5 segundos
      setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
        setDebugInfo(null);
      }, 5000);
    }
  };

  /* ================= RESTANTE DEL CÓDIGO (sin cambios mayores) ================= */
  // ... (mantén el resto de tus funciones como iniciarEdicion, actualizarProducto, etc.)

  /* ================= COMPONENTE IMAGEN MEJORADO ================= */
  const ProductoImagen = ({ producto }) => {
    const [imgError, setImgError] = useState(false);
    const [loading, setLoading] = useState(true);

    const imagenUrl = producto.imagen || "/imagenes/no-image.png";

    return (
      <div className="relative">
        {loading && (
          <div className="w-16 h-16 rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <img
          src={imgError ? "/imagenes/no-image.png" : imagenUrl}
          alt={producto.nombre}
          className={`w-16 h-16 rounded-lg object-cover border border-gray-200 ${loading ? "hidden" : "block"}`}
          onLoad={() => setLoading(false)}
          onError={(e) => {
            console.log(
              `❌ Error cargando imagen para ${producto.nombre}:`,
              imagenUrl,
            );
            setImgError(true);
            setLoading(false);
            e.target.src = "/imagenes/no-image.png";
          }}
          loading="lazy"
        />
        {producto.destacado == 1 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
            <Star className="w-3 h-3 text-white" />
          </div>
        )}
        {imgError && (
          <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
            <ImageOff className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando productos...</p>
          <p className="text-sm text-gray-500 mt-2">Conectando a: {API_URL}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      {/* DEBUG INFO */}
      {debugInfo && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-blue-800 font-mono">{debugInfo}</p>
            </div>
            <button
              onClick={() => setDebugInfo(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* MENSAJES DE ESTADO */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <p className="text-xs text-red-700 mt-1">
                Verifica la conexión con el servidor: {API_URL}
              </p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-800">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* ... Resto del JSX (mantén tu estructura actual) ... */}

      {/* En la tabla, reemplaza las imágenes con el componente mejorado */}
      {productos.map((producto) => (
        <tr key={producto.id}>
          <td className="px-6 py-4">
            <div className="flex items-start gap-4">
              <ProductoImagen producto={producto} />
              {/* ... resto de la información del producto ... */}
            </div>
          </td>
          {/* ... resto de las columnas ... */}
        </tr>
      ))}

      {/* MODAL DE ELIMINACIÓN MEJORADO */}
      <AnimatePresence>
        {showDeleteModal && productoToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Confirmar Eliminación
                    </h3>
                    <p className="text-red-100 text-sm">
                      ID: {productoToDelete.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <ProductoImagen producto={productoToDelete} />
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {productoToDelete.nombre}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Categoría: {productoToDelete.categoria_nombre || "N/A"}
                    </p>
                    <p className="text-red-600 font-bold">
                      ${Number(productoToDelete.precio || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800">
                        ⚠️ Nota importante
                      </p>
                      <p className="text-yellow-700 text-sm mt-1">
                        El endpoint DELETE puede no estar disponible. Si falla,
                        se intentará marcar el producto como inactivo.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">
                        ¿Estás seguro de eliminar este producto?
                      </p>
                      <p className="text-red-700 text-sm mt-1">
                        Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductoToDelete(null);
                    setError(null);
                  }}
                  disabled={deleting}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarProducto}
                  disabled={deleting}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar Producto"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
