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
  Filter,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

// Usa tu URL de Railway
const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

export default function EliminarProducto() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  /* ================= CARGAR DATOS ================= */
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      console.log("Cargando productos desde:", `${API_URL}/api/productos`);

      const res = await fetch(`${API_URL}/api/productos`);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Error ${res.status}: ${errorText || "No se pudo cargar productos"}`,
        );
      }

      const data = await res.json();
      console.log("Productos recibidos:", data.length);

      if (!Array.isArray(data)) {
        console.error("La respuesta no es un array:", data);
        throw new Error("Formato de respuesta inválido");
      }

      setProductos(data);

      setMessage({
        type: "success",
        text: `${data.length} productos cargados exitosamente`,
      });
    } catch (error) {
      console.error("Error cargando productos:", error);
      setMessage({
        type: "error",
        text: `Error: ${error.message}. Verifica la conexión.`,
      });
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTRADO ================= */
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const searchMatch =
        !search ||
        p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(search.toLowerCase());

      let stockMatch = true;
      if (statusFilter === "con_stock") stockMatch = (p.stock || 0) > 0;
      if (statusFilter === "sin_stock") stockMatch = (p.stock || 0) <= 0;

      return searchMatch && stockMatch;
    });
  }, [productos, search, statusFilter]);

  /* ================= PAGINACIÓN ================= */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = productosFiltrados.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);

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
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      console.log("Respuesta eliminación:", data);

      if (response.ok && data.ok === true) {
        // Eliminar del estado local
        setProductos((prev) => prev.filter((p) => p.id !== selectedProduct.id));

        setMessage({
          type: "success",
          text: `"${selectedProduct.nombre}" eliminado exitosamente`,
        });

        // Resetear página si es necesario
        if (currentItems.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        setShowDeleteModal(false);
        setSelectedProduct(null);
      } else {
        throw new Error(
          data.message || data.error || "Error al eliminar el producto",
        );
      }
    } catch (error) {
      console.error("Error eliminando producto:", error);
      setMessage({
        type: "error",
        text: `Error: ${error.message}`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= EDITAR PRODUCTO ================= */
  const abrirEditar = (producto) => {
    setSelectedProduct({ ...producto });
    setShowEditModal(true);
  };

  const guardarEdicion = async () => {
    if (!selectedProduct) return;

    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      console.log("Actualizando producto:", selectedProduct);

      const updateData = {
        nombre: selectedProduct.nombre || "",
        precio: parseFloat(selectedProduct.precio) || 0,
        precio_antes: selectedProduct.precio_antes
          ? parseFloat(selectedProduct.precio_antes)
          : null,
        descuento: selectedProduct.descuento
          ? parseFloat(selectedProduct.descuento)
          : null,
        descripcion: selectedProduct.descripcion || "",
        categoria_id: selectedProduct.categoria_id || 0,
        es_oferta: selectedProduct.es_oferta ? 1 : 0,
        stock: parseInt(selectedProduct.stock) || 0,
        destacado: selectedProduct.destacado ? 1 : 0,
        nuevo: selectedProduct.nuevo ? 1 : 0,
        categoria: selectedProduct.categoria || "",
        talla: selectedProduct.talla || "",
        color: selectedProduct.color || "",
      };

      const response = await fetch(
        `${API_URL}/api/productos/${selectedProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      const data = await response.json();
      console.log("Respuesta actualización:", data);

      if (response.ok && data.ok === true) {
        // Actualizar en estado local
        setProductos((prev) =>
          prev.map((p) =>
            p.id === selectedProduct.id ? { ...selectedProduct } : p,
          ),
        );

        setMessage({
          type: "success",
          text: `"${selectedProduct.nombre}" actualizado exitosamente`,
        });

        setShowEditModal(false);
        setSelectedProduct(null);
      } else {
        throw new Error(
          data.message || data.error || "Error al actualizar el producto",
        );
      }
    } catch (error) {
      console.error("Error editando producto:", error);
      setMessage({
        type: "error",
        text: `Error: ${error.message}`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= RENDER ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Productos
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Total: {productos.length} productos • Filtrados:{" "}
              {productosFiltrados.length}
            </p>
          </div>
          <button
            onClick={cargarProductos}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Cargando..." : "Recargar"}
          </button>
        </div>

        {/* MENSAJES */}
        {message.text && (
          <div
            className={`p-4 rounded-lg mb-4 flex items-start gap-3 ${
              message.type === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            {message.type === "error" ? (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* FILTROS */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, descripción o categoría..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="todos">Todos los productos</option>
                  <option value="con_stock">Con stock</option>
                  <option value="sin_stock">Sin stock</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LISTA DE PRODUCTOS */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {currentItems.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">
              {productosFiltrados.length === 0 && productos.length > 0
                ? "No hay productos que coincidan con los filtros"
                : "No hay productos disponibles"}
            </p>
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("todos");
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {currentItems.map((producto) => (
                <div
                  key={producto.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Imagen */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                        {producto.imagenes?.[0] || producto.imagen ? (
                          <img
                            src={producto.imagenes?.[0] || producto.imagen}
                            alt={producto.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' font-family='Arial' font-size='14' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ESin imagen%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package size={28} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-lg truncate">
                            {producto.nombre || "Sin nombre"}
                          </h3>
                          <span className="text-sm text-gray-500">
                            ID: {producto.id}
                          </span>
                        </div>

                        {producto.descripcion && (
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {producto.descripcion}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-bold text-gray-900">
                            ${Number(producto.precio || 0).toLocaleString()}
                          </span>

                          {producto.precio_antes &&
                            producto.precio_antes > producto.precio && (
                              <span className="text-sm text-gray-500 line-through">
                                $
                                {Number(producto.precio_antes).toLocaleString()}
                              </span>
                            )}

                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              (producto.stock || 0) > 10
                                ? "bg-green-100 text-green-800"
                                : (producto.stock || 0) > 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            Stock: {producto.stock || 0}
                          </span>

                          {producto.es_oferta && (
                            <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                              Oferta
                            </span>
                          )}

                          {producto.destacado && (
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              Destacado
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {producto.categoria && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {producto.categoria}
                            </span>
                          )}
                          {producto.talla && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Talla: {producto.talla}
                            </span>
                          )}
                          {producto.color && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Color: {producto.color}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 self-end sm:self-center">
                      <button
                        onClick={() => abrirEditar(producto)}
                        className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                        title="Editar"
                      >
                        <Edit size={16} />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                      <button
                        onClick={() => confirmarEliminar(producto)}
                        className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Página {currentPage} de {totalPages} •{" "}
                  {productosFiltrados.length} productos
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Siguiente
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL ELIMINAR */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Eliminar Producto
                  </h3>
                  <p className="text-sm text-gray-600">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 mb-2">
                  ¿Estás seguro de eliminar este producto?
                </p>
                <div className="space-y-1">
                  <p className="font-medium">{selectedProduct.nombre}</p>
                  <p className="text-sm text-gray-500">
                    ID: {selectedProduct.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Precio: $
                    {Number(selectedProduct.precio || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={ejecutarEliminar}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Editar Producto
                  </h3>
                  <p className="text-sm text-gray-600">
                    ID: {selectedProduct.id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={actionLoading}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información básica */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={selectedProduct.precio || ""}
                        onChange={(e) =>
                          setSelectedProduct({
                            ...selectedProduct,
                            precio: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock *
                      </label>
                      <input
                        type="number"
                        value={selectedProduct.stock || ""}
                        onChange={(e) =>
                          setSelectedProduct({
                            ...selectedProduct,
                            stock: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio Anterior
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={selectedProduct.precio_antes || ""}
                        onChange={(e) =>
                          setSelectedProduct({
                            ...selectedProduct,
                            precio_antes: e.target.value || null,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descuento (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedProduct.descuento || ""}
                        onChange={(e) =>
                          setSelectedProduct({
                            ...selectedProduct,
                            descuento: e.target.value || null,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Categorías y opciones */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.categoria || ""}
                        onChange={(e) =>
                          setSelectedProduct({
                            ...selectedProduct,
                            categoria: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Talla
                      </label>
                      <input
                        type="text"
                        value={selectedProduct.talla || ""}
                        onChange={(e) =>
                          setSelectedProduct({
                            ...selectedProduct,
                            talla: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={selectedProduct.color || ""}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          color: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={selectedProduct.descripcion || ""}
                      onChange={(e) =>
                        setSelectedProduct({
                          ...selectedProduct,
                          descripcion: e.target.value,
                        })
                      }
                      rows="3"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProduct.es_oferta || false}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        es_oferta: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium">En oferta</span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProduct.destacado || false}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        destacado: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium">Destacado</span>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProduct.nuevo || false}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        nuevo: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium">Nuevo</span>
                </label>
              </div>

              {/* Botones */}
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarEdicion}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      Guardar Cambios
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
