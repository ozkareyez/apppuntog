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
  MoreVertical,
  BarChart3,
  Edit3,
  Image as ImageIcon,
  Calendar,
  Shield,
  Star,
  FileText,
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

  /* ================= CARGAR DATOS ================= */
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        // Cargar productos
        const resProductos = await fetch(`${API_URL}/api/productos`);
        const dataProductos = await resProductos.json();
        setProductos(Array.isArray(dataProductos) ? dataProductos : []);

        // Cargar categorías
        const resCategorias = await fetch(`${API_URL}/api/categorias`);
        const dataCategorias = await resCategorias.json();
        setCategorias(Array.isArray(dataCategorias) ? dataCategorias : []);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setProductos([]);
        setCategorias([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  /* ================= FILTRADO Y ORDENACIÓN ================= */
  const productosFiltrados = useMemo(() => {
    let filtered = [...productos];

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.descripcion?.toLowerCase().includes(term) ||
          p.categoria_nombre?.toLowerCase().includes(term)
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== "todos") {
      filtered = filtered.filter(
        (p) =>
          p.categoria_id == selectedCategory ||
          p.categoria_nombre?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filtrar por estado
    if (statusFilter !== "todos") {
      switch (statusFilter) {
        case "oferta":
          filtered = filtered.filter((p) => p.es_oferta == 1);
          break;
        case "sin_stock":
          filtered = filtered.filter((p) => (p.stock || 0) <= 0);
          break;
        case "destacados":
          filtered = filtered.filter((p) => p.destacado == 1);
          break;
      }
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "nombre_asc":
          return a.nombre.localeCompare(b.nombre);
        case "nombre_desc":
          return b.nombre.localeCompare(a.nombre);
        case "precio_asc":
          return (a.precio || 0) - (b.precio || 0);
        case "precio_desc":
          return (b.precio || 0) - (a.precio || 0);
        case "stock_asc":
          return (a.stock || 0) - (b.stock || 0);
        case "stock_desc":
          return (b.stock || 0) - (a.stock || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [productos, searchTerm, selectedCategory, statusFilter, sortBy]);

  /* ================= ELIMINAR PRODUCTO ================= */
  const confirmarEliminacion = (producto) => {
    setProductoToDelete(producto);
    setShowDeleteModal(true);
  };

  const eliminarProducto = async () => {
    if (!productoToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `${API_URL}/api/productos/${productoToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Error al eliminar");
      }

      setProductos((prev) => prev.filter((p) => p.id !== productoToDelete.id));
      setShowDeleteModal(false);
      setProductoToDelete(null);
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el producto: " + error.message);
    } finally {
      setDeleting(false);
    }
  };

  /* ================= INICIAR EDICIÓN ================= */
  const iniciarEdicion = (producto) => {
    setEditandoId(producto.id);
    setFormEdit({
      nombre: producto.nombre || "",
      precio: producto.precio || "",
      precio_antes: producto.precio_antes || "",
      descuento: producto.descuento || "",
      descripcion: producto.descripcion || "",
      categoria_id: producto.categoria_id || "",
      es_oferta: producto.es_oferta == 1,
      stock: producto.stock || 0,
      destacado: producto.destacado == 1,
      nuevo: producto.nuevo == 1,
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormEdit({
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
  };

  /* ================= ACTUALIZAR PRODUCTO ================= */
  const actualizarProducto = async (id) => {
    // Preparar payload solo con campos modificados
    const productoOriginal = productos.find((p) => p.id === id);
    const payload = {};

    // Solo incluir campos que hayan cambiado
    const campos = [
      "nombre",
      "precio",
      "precio_antes",
      "descuento",
      "descripcion",
      "categoria_id",
      "stock",
    ];
    campos.forEach((campo) => {
      if (formEdit[campo] != productoOriginal[campo]) {
        payload[campo] = formEdit[campo];
      }
    });

    // Campos booleanos
    if (formEdit.es_oferta != (productoOriginal.es_oferta == 1)) {
      payload.es_oferta = formEdit.es_oferta ? 1 : 0;
    }
    if (formEdit.destacado != (productoOriginal.destacado == 1)) {
      payload.destacado = formEdit.destacado ? 1 : 0;
    }
    if (formEdit.nuevo != (productoOriginal.nuevo == 1)) {
      payload.nuevo = formEdit.nuevo ? 1 : 0;
    }

    if (Object.keys(payload).length === 0) {
      alert("No hay cambios para guardar");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Error al actualizar");
      }

      // Actualizar lista localmente
      setProductos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...payload } : p))
      );

      setEditandoId(null);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: productos.length,
    conStock: productos.filter((p) => (p.stock || 0) > 0).length,
    enOferta: productos.filter((p) => p.es_oferta == 1).length,
    sinStock: productos.filter((p) => (p.stock || 0) <= 0).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Gestión de Productos
            </h1>
            <p className="text-gray-600">
              Administra, edita y elimina productos del catálogo
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-red-600/30 transition"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Con Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.conStock}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Oferta</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.enOferta}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Tag className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sin Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.sinStock}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* BÚSQUEDA */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* CATEGORÍA */}
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
            >
              <option value="todos">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* FILTRO DE ESTADO */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
            >
              <option value="todos">Todos los estados</option>
              <option value="oferta">En oferta</option>
              <option value="destacados">Destacados</option>
              <option value="sin_stock">Sin stock</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* ORDENAR */}
          <div className="relative">
            <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
            >
              <option value="nombre_asc">Nombre (A-Z)</option>
              <option value="nombre_desc">Nombre (Z-A)</option>
              <option value="precio_asc">Precio (menor a mayor)</option>
              <option value="precio_desc">Precio (mayor a menor)</option>
              <option value="stock_asc">Stock (menor a mayor)</option>
              <option value="stock_desc">Stock (mayor a menor)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay productos
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm ||
              selectedCategory !== "todos" ||
              statusFilter !== "todos"
                ? "No se encontraron productos con los filtros actuales"
                : "No hay productos en el catálogo. Agrega tu primer producto."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={16} />
                      Producto
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <Tag size={16} />
                      Categoría
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} />
                      Precio
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((producto) => (
                  <motion.tr
                    key={producto.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* PRODUCTO */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img
                            src={producto.imagen || "/imagenes/no-image.png"}
                            alt={producto.nombre}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                          />
                          {producto.destacado == 1 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                              <Star className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          {editandoId === producto.id ? (
                            <div className="space-y-3">
                              <input
                                value={formEdit.nombre}
                                onChange={(e) =>
                                  setFormEdit({
                                    ...formEdit,
                                    nombre: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                                placeholder="Nombre del producto"
                              />
                              <div className="relative">
                                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <textarea
                                  value={formEdit.descripcion}
                                  onChange={(e) =>
                                    setFormEdit({
                                      ...formEdit,
                                      descripcion: e.target.value,
                                    })
                                  }
                                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                                  placeholder="Descripción del producto"
                                  rows="3"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="font-semibold text-gray-900 mb-2">
                                {producto.nombre}
                              </p>
                              <div className="relative">
                                <p className="text-sm text-gray-600 mb-1 line-clamp-3">
                                  {producto.descripcion || "Sin descripción"}
                                </p>
                                {producto.descripcion &&
                                  producto.descripcion.length > 150 && (
                                    <button
                                      onClick={() =>
                                        setExpandedDesc(
                                          expandedDesc === producto.id
                                            ? null
                                            : producto.id
                                        )
                                      }
                                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                                    >
                                      {expandedDesc === producto.id
                                        ? "Ver menos"
                                        : "Ver más"}
                                    </button>
                                  )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* CATEGORÍA */}
                    <td className="px-6 py-4">
                      {editandoId === producto.id ? (
                        <select
                          value={formEdit.categoria_id}
                          onChange={(e) =>
                            setFormEdit({
                              ...formEdit,
                              categoria_id: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                        >
                          <option value="">Sin categoría</option>
                          {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.nombre}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Tag size={14} className="text-gray-400" />
                          {producto.categoria_nombre || "Sin categoría"}
                        </span>
                      )}
                    </td>

                    {/* PRECIO */}
                    <td className="px-6 py-4">
                      {editandoId === producto.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={formEdit.precio}
                            onChange={(e) =>
                              setFormEdit({
                                ...formEdit,
                                precio: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                            placeholder="Precio"
                          />
                          {formEdit.es_oferta && (
                            <input
                              type="text"
                              value={formEdit.precio_antes}
                              onChange={(e) =>
                                setFormEdit({
                                  ...formEdit,
                                  precio_antes: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                              placeholder="Precio anterior"
                            />
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-gray-900">
                            ${Number(producto.precio).toLocaleString()}
                          </p>
                          {producto.precio_antes &&
                            producto.precio_antes > producto.precio && (
                              <p className="text-sm text-gray-400 line-through">
                                $
                                {Number(producto.precio_antes).toLocaleString()}
                              </p>
                            )}
                        </div>
                      )}
                    </td>

                    {/* STOCK */}
                    <td className="px-6 py-4">
                      {editandoId === producto.id ? (
                        <input
                          type="number"
                          value={formEdit.stock}
                          onChange={(e) =>
                            setFormEdit({
                              ...formEdit,
                              stock: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                          min="0"
                        />
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                            (producto.stock || 0) > 10
                              ? "bg-green-100 text-green-800"
                              : (producto.stock || 0) > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {(producto.stock || 0) > 10
                            ? "✓"
                            : (producto.stock || 0) > 0
                            ? "⚠"
                            : "✗"}
                          {producto.stock || 0} unidades
                        </span>
                      )}
                    </td>

                    {/* ESTADO */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {producto.es_oferta == 1 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                            <Tag size={10} />
                            Oferta
                          </span>
                        )}
                        {producto.nuevo == 1 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                            Nuevo
                          </span>
                        )}
                        {editandoId === producto.id && (
                          <div className="space-y-1">
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={formEdit.es_oferta}
                                onChange={(e) =>
                                  setFormEdit({
                                    ...formEdit,
                                    es_oferta: e.target.checked,
                                  })
                                }
                                className="w-3 h-3"
                              />
                              Oferta
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={formEdit.nuevo}
                                onChange={(e) =>
                                  setFormEdit({
                                    ...formEdit,
                                    nuevo: e.target.checked,
                                  })
                                }
                                className="w-3 h-3"
                              />
                              Nuevo
                            </label>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ACCIONES */}
                    <td className="px-6 py-4">
                      {editandoId === producto.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => actualizarProducto(producto.id)}
                            disabled={saving}
                            className="p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-md disabled:opacity-50 transition"
                            title="Guardar"
                          >
                            {saving ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Save size={16} />
                            )}
                          </button>
                          <button
                            onClick={cancelarEdicion}
                            className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                            title="Cancelar"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => iniciarEdicion(producto)}
                            className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-md transition"
                            title="Editar"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => confirmarEliminacion(producto)}
                            className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-md transition"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <AnimatePresence>
        {showDeleteModal && productoToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => !deleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            >
              {/* HEADER */}
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
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>
              </div>

              {/* BODY */}
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={productoToDelete.imagen || "/imagenes/no-image.png"}
                    alt={productoToDelete.nombre}
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {productoToDelete.nombre}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      ID: {productoToDelete.id}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Categoría: {productoToDelete.categoria_nombre || "N/A"}
                    </p>
                    <p className="text-red-600 font-bold">
                      ${Number(productoToDelete.precio).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* DESCRIPCIÓN COMPLETA EN EL MODAL */}
                {productoToDelete.descripcion && (
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <FileText size={16} />
                      Descripción:
                    </h5>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                      <p className="text-gray-700 text-sm">
                        {productoToDelete.descripcion}
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">
                        ¿Estás seguro de eliminar este producto?
                      </p>
                      <p className="text-red-700 text-sm mt-1">
                        Todos los datos relacionados con este producto serán
                        eliminados permanentemente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
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

      {/* PAGINATION */}
      {productosFiltrados.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando{" "}
            <span className="font-semibold">{productosFiltrados.length}</span>{" "}
            de <span className="font-semibold">{productos.length}</span>{" "}
            productos
          </p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
              Anterior
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-xl">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
              Siguiente
            </button>
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
