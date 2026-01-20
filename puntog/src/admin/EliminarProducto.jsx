import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Trash2,
  Search,
  Filter,
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
  Shield,
  Star,
  ImageOff,
  Edit,
  X,
  Save,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

// Componente optimizado para imágenes
const ProductoImagen = ({ src, alt, className = "w-16 h-16" }) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  const imageUrl = src && !src.includes("null") ? src : null;
  const finalSrc = error || !imageUrl ? "/placeholder-image.jpg" : imageUrl;

  return (
    <div className="relative">
      <img
        src={finalSrc}
        alt={alt}
        className={`${className} rounded-lg object-cover border border-gray-200 bg-gray-100`}
        onError={handleError}
        loading="lazy"
      />
      {error && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <ImageOff className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default function EliminarProducto() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("id_desc");

  // Estados para acciones
  const [productoToDelete, setProductoToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productoToEdit, setProductoToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Formulario de edición
  const [editForm, setEditForm] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoria_id: "",
    es_oferta: false,
    destacado: false,
    activo: true,
  });

  // Estados generales
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ================= CARGAR DATOS ================= */
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar productos
      const productosRes = await fetch(`${API_URL}/api/productos`);

      if (!productosRes.ok) {
        throw new Error(`Error ${productosRes.status}`);
      }

      const productosData = await productosRes.json();

      if (!Array.isArray(productosData)) {
        throw new Error("Formato de datos inválido");
      }

      // Preparar productos
      const productosLimpios = productosData.map((producto) => ({
        id: producto.id,
        nombre: producto.nombre || "Sin nombre",
        descripcion: producto.descripcion,
        precio: Number(producto.precio) || 0,
        precio_antes: producto.precio_antes
          ? Number(producto.precio_antes)
          : null,
        stock: parseInt(producto.stock) || 0,
        es_oferta: producto.es_oferta == 1,
        destacado: producto.destacado == 1,
        nuevo: producto.nuevo == 1,
        categoria_id: producto.categoria_id,
        categoria_nombre: producto.categoria_nombre || "Sin categoría",
        imagen: producto.imagen,
        activo: producto.activo == 1,
      }));

      setProductos(productosLimpios);

      // Cargar categorías
      try {
        const categoriasRes = await fetch(`${API_URL}/api/categorias`);
        if (categoriasRes.ok) {
          const categoriasData = await categoriasRes.json();
          setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
        }
      } catch (catError) {
        console.warn("Error cargando categorías:", catError);
      }

      setSuccessMessage(`${productosLimpios.length} productos cargados`);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  /* ================= FILTRADO Y ORDENACIÓN ================= */
  const productosFiltrados = useMemo(() => {
    let filtered = [...productos];

    // Búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(term)),
      );
    }

    // Categoría
    if (selectedCategory !== "todos") {
      filtered = filtered.filter((p) => p.categoria_id == selectedCategory);
    }

    // Estado
    if (statusFilter !== "todos") {
      switch (statusFilter) {
        case "oferta":
          filtered = filtered.filter((p) => p.es_oferta);
          break;
        case "destacados":
          filtered = filtered.filter((p) => p.destacado);
          break;
        case "sin_stock":
          filtered = filtered.filter((p) => p.stock <= 0);
          break;
        case "con_stock":
          filtered = filtered.filter((p) => p.stock > 0);
          break;
      }
    }

    // Ordenación
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "id_desc":
          return b.id - a.id;
        case "nombre_asc":
          return a.nombre.localeCompare(b.nombre);
        case "nombre_desc":
          return b.nombre.localeCompare(a.nombre);
        case "precio_asc":
          return a.precio - b.precio;
        case "precio_desc":
          return b.precio - a.precio;
        default:
          return 0;
      }
    });

    return filtered;
  }, [productos, searchTerm, selectedCategory, statusFilter, sortBy]);

  /* ================= PAGINACIÓN ================= */
  const paginatedProductos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return productosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [productosFiltrados, currentPage]);

  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);

  /* ================= ELIMINAR PRODUCTO ================= */
  const confirmarEliminacion = (producto) => {
    setProductoToDelete(producto);
    setShowDeleteModal(true);
  };

  const eliminarProducto = async () => {
    if (!productoToDelete) return;

    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/productos/${productoToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      // Éxito - eliminar del estado local
      setProductos((prev) => prev.filter((p) => p.id !== productoToDelete.id));
      setSuccessMessage(`Producto eliminado: ${productoToDelete.nombre}`);

      setShowDeleteModal(false);
      setProductoToDelete(null);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error eliminando producto:", error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= EDITAR PRODUCTO ================= */
  const iniciarEdicion = (producto) => {
    setProductoToEdit(producto);
    setEditForm({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio: producto.precio || 0,
      stock: producto.stock || 0,
      categoria_id: producto.categoria_id || "",
      es_oferta: producto.es_oferta || false,
      destacado: producto.destacado || false,
      activo: producto.activo !== false,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const actualizarProducto = async () => {
    if (!productoToEdit) return;

    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/productos/${productoToEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editForm,
            es_oferta: editForm.es_oferta ? 1 : 0,
            destacado: editForm.destacado ? 1 : 0,
            activo: editForm.activo ? 1 : 0,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      // Actualizar en estado local
      const categoriaNombre =
        categorias.find((c) => c.id == editForm.categoria_id)?.nombre ||
        "Sin categoría";

      setProductos((prev) =>
        prev.map((p) =>
          p.id === productoToEdit.id
            ? {
                ...p,
                nombre: editForm.nombre,
                descripcion: editForm.descripcion,
                precio: editForm.precio,
                stock: editForm.stock,
                es_oferta: editForm.es_oferta,
                destacado: editForm.destacado,
                activo: editForm.activo,
                categoria_id: editForm.categoria_id,
                categoria_nombre: categoriaNombre,
              }
            : p,
        ),
      );

      setSuccessMessage(`Producto actualizado: ${editForm.nombre}`);
      setShowEditModal(false);
      setProductoToEdit(null);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error actualizando producto:", error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= RENDER ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Administrar Productos
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {productos.length} productos • {productosFiltrados.length}{" "}
              filtrados
            </p>
          </div>

          <button
            onClick={cargarDatos}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>

        {/* MENSAJES */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        )}

        {/* FILTROS MINIMALISTAS */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="todos">Todas categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="con_stock">Con stock</option>
                <option value="sin_stock">Sin stock</option>
                <option value="oferta">En oferta</option>
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="id_desc">Más recientes</option>
                <option value="nombre_asc">Nombre A-Z</option>
                <option value="nombre_desc">Nombre Z-A</option>
                <option value="precio_asc">Precio menor</option>
                <option value="precio_desc">Precio mayor</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS - RESPONSIVE */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {paginatedProductos.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No hay productos</p>
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedProductos.map((producto) => (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductoImagen
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="w-10 h-10"
                          />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {producto.nombre}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {producto.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {producto.categoria_nombre}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-gray-900">
                            ${producto.precio.toLocaleString()}
                          </p>
                          {producto.precio_antes && (
                            <p className="text-xs text-gray-400 line-through">
                              ${producto.precio_antes.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            producto.stock > 10
                              ? "bg-green-100 text-green-800"
                              : producto.stock > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {producto.stock} unidades
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => iniciarEdicion(producto)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => confirmarEliminacion(producto)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="md:hidden">
              {paginatedProductos.map((producto) => (
                <div key={producto.id} className="border-b border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <ProductoImagen
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-12 h-12"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {producto.nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          {producto.categoria_nombre}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => iniciarEdicion(producto)}
                        className="p-1.5 bg-blue-100 text-blue-600 rounded"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => confirmarEliminacion(producto)}
                        className="p-1.5 bg-red-100 text-red-600 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Precio</p>
                      <p className="font-bold">
                        ${producto.precio.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Stock</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          producto.stock > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {producto.stock} unidades
                      </span>
                    </div>
                  </div>

                  {producto.es_oferta && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        En oferta
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {showDeleteModal && productoToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold">Eliminar Producto</h3>
              </div>

              <p className="text-gray-600 mb-6">
                ¿Eliminar <strong>{productoToDelete.nombre}</strong>? Esta
                acción no se puede deshacer.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductoToDelete(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarProducto}
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
      {showEditModal && productoToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-md my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Editar Producto</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setProductoToEdit(null);
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
                    name="nombre"
                    value={editForm.nombre}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={editForm.descripcion}
                    onChange={handleEditChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio
                    </label>
                    <input
                      type="number"
                      name="precio"
                      value={editForm.precio}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={editForm.stock}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    name="categoria_id"
                    value={editForm.categoria_id}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="es_oferta"
                      checked={editForm.es_oferta}
                      onChange={handleEditChange}
                      className="rounded"
                    />
                    <span className="text-sm">En oferta</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="destacado"
                      checked={editForm.destacado}
                      onChange={handleEditChange}
                      className="rounded"
                    />
                    <span className="text-sm">Destacado</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={editForm.activo}
                      onChange={handleEditChange}
                      className="rounded"
                    />
                    <span className="text-sm">Activo</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setProductoToEdit(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={actualizarProducto}
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
