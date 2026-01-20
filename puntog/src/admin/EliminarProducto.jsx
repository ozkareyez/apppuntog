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
  PlusCircle,
  ShoppingBag,
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

  /* ================= CARGAR DATOS ================= */
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      console.log("Cargando datos de:", API_URL);

      // Cargar productos - usando try/catch separado para no fallar completamente
      let productosData = [];
      try {
        const resProductos = await fetch(`${API_URL}/api/productos`, {
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        });

        console.log("Productos response status:", resProductos.status);

        if (resProductos.ok) {
          const contentTypeProductos = resProductos.headers.get("content-type");
          if (
            contentTypeProductos &&
            contentTypeProductos.includes("application/json")
          ) {
            const dataProductos = await resProductos.json();

            // Manejar diferentes estructuras de respuesta
            if (Array.isArray(dataProductos)) {
              productosData = dataProductos;
            } else if (dataProductos && Array.isArray(dataProductos.results)) {
              productosData = dataProductos.results;
            } else if (dataProductos && Array.isArray(dataProductos.data)) {
              productosData = dataProductos.data;
            } else if (
              dataProductos &&
              Array.isArray(dataProductos.productos)
            ) {
              productosData = dataProductos.productos;
            } else if (dataProductos && typeof dataProductos === "object") {
              // Buscar cualquier array en el objeto
              const arrayKeys = Object.keys(dataProductos).filter((key) =>
                Array.isArray(dataProductos[key]),
              );
              if (arrayKeys.length > 0) {
                productosData = dataProductos[arrayKeys[0]];
              }
            }
          }
        } else {
          console.warn("Error cargando productos:", resProductos.status);
        }
      } catch (productosError) {
        console.error("Error específico productos:", productosError);
      }

      // Si no conseguimos datos, usar array vacío
      if (!Array.isArray(productosData)) {
        productosData = [];
      }

      setProductos(productosData);
      console.log("Productos cargados:", productosData.length);

      // Cargar categorías
      let categoriasData = [];
      try {
        const resCategorias = await fetch(`${API_URL}/api/categorias`, {
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        });

        if (resCategorias.ok) {
          const contentTypeCategorias =
            resCategorias.headers.get("content-type");
          if (
            contentTypeCategorias &&
            contentTypeCategorias.includes("application/json")
          ) {
            const dataCategorias = await resCategorias.json();

            if (Array.isArray(dataCategorias)) {
              categoriasData = dataCategorias;
            } else if (
              dataCategorias &&
              Array.isArray(dataCategorias.results)
            ) {
              categoriasData = dataCategorias.results;
            } else if (dataCategorias && Array.isArray(dataCategorias.data)) {
              categoriasData = dataCategorias.data;
            }
          }
        }
      } catch (categoriasError) {
        console.error("Error cargando categorías:", categoriasError);
      }

      setCategorias(categoriasData);

      if (productosData.length > 0) {
        setSuccessMessage(`${productosData.length} productos cargados`);
      } else {
        setError("No se pudieron cargar los productos");
      }

      setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000);
    } catch (error) {
      console.error("Error general cargando datos:", error);
      setError("Error al conectar con el servidor. Verifica la conexión.");
      setProductos([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  /* ================= FILTRADO Y ORDENACIÓN ================= */
  const productosFiltrados = useMemo(() => {
    let filtered = [...productos];

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          (p.nombre && p.nombre.toLowerCase().includes(term)) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
          (p.categoria_nombre &&
            p.categoria_nombre.toLowerCase().includes(term)),
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== "todos") {
      filtered = filtered.filter(
        (p) =>
          p.categoria_id == selectedCategory ||
          (p.categoria_nombre &&
            p.categoria_nombre.toLowerCase() ===
              selectedCategory.toLowerCase()),
      );
    }

    // Filtrar por estado
    if (statusFilter !== "todos") {
      switch (statusFilter) {
        case "oferta":
          filtered = filtered.filter(
            (p) => p.es_oferta == 1 || p.es_oferta === true,
          );
          break;
        case "sin_stock":
          filtered = filtered.filter((p) => (parseInt(p.stock) || 0) <= 0);
          break;
        case "destacados":
          filtered = filtered.filter(
            (p) => p.destacado == 1 || p.destacado === true,
          );
          break;
      }
    }

    // Ordenar
    filtered.sort((a, b) => {
      const nombreA = (a.nombre || "").toString().toLowerCase();
      const nombreB = (b.nombre || "").toString().toLowerCase();
      const precioA = parseFloat(a.precio) || 0;
      const precioB = parseFloat(b.precio) || 0;
      const stockA = parseInt(a.stock) || 0;
      const stockB = parseInt(b.stock) || 0;

      switch (sortBy) {
        case "nombre_asc":
          return nombreA.localeCompare(nombreB);
        case "nombre_desc":
          return nombreB.localeCompare(nombreA);
        case "precio_asc":
          return precioA - precioB;
        case "precio_desc":
          return precioB - precioA;
        case "stock_asc":
          return stockA - stockB;
        case "stock_desc":
          return stockB - stockA;
        default:
          return 0;
      }
    });

    return filtered;
  }, [productos, searchTerm, selectedCategory, statusFilter, sortBy]);

  /* ================= ELIMINAR PRODUCTO (Solución alternativas) ================= */
  const confirmarEliminacion = (producto) => {
    setProductoToDelete(producto);
    setShowDeleteModal(true);
  };

  const eliminarProducto = async () => {
    if (!productoToDelete) return;

    setDeleting(true);
    setError(null);

    try {
      const productoId = productoToDelete.id || productoToDelete._id;
      if (!productoId) {
        throw new Error("ID del producto no encontrado");
      }

      console.log(`Intentando eliminar producto ID: ${productoId}`);

      // PRIMERA ALTERNATIVA: DELETE estándar
      try {
        const res = await fetch(`${API_URL}/api/productos/${productoId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        console.log("DELETE Status:", res.status, "OK:", res.ok);

        if (res.ok) {
          // Eliminar producto de la lista local
          setProductos((prev) =>
            prev.filter(
              (p) =>
                (p.id || p._id) !==
                (productoToDelete.id || productoToDelete._id),
            ),
          );

          setSuccessMessage(
            `Producto "${productoToDelete.nombre}" eliminado correctamente`,
          );
          setShowDeleteModal(false);
          setProductoToDelete(null);
          return;
        }
      } catch (deleteError) {
        console.warn(
          "DELETE falló, intentando método alternativo:",
          deleteError,
        );
      }

      // SEGUNDA ALTERNATIVA: Si DELETE falla, intentar con PUT para desactivar
      try {
        const res = await fetch(`${API_URL}/api/productos/${productoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ activo: false, eliminado: true }),
        });

        if (res.ok) {
          setProductos((prev) =>
            prev.filter(
              (p) =>
                (p.id || p._id) !==
                (productoToDelete.id || productoToDelete._id),
            ),
          );

          setSuccessMessage(
            `Producto "${productoToDelete.nombre}" marcado como eliminado`,
          );
          setShowDeleteModal(false);
          setProductoToDelete(null);
          return;
        }
      } catch (putError) {
        console.warn("PUT también falló:", putError);
      }

      // TERCERA ALTERNATIVA: Si los endpoints no funcionan, eliminar solo localmente
      setProductos((prev) =>
        prev.filter(
          (p) =>
            (p.id || p._id) !== (productoToDelete.id || productoToDelete._id),
        ),
      );

      setSuccessMessage(
        `Producto "${productoToDelete.nombre}" eliminado localmente. Recarga la página para sincronizar con el servidor.`,
      );
      setShowDeleteModal(false);
      setProductoToDelete(null);
    } catch (error) {
      console.error("Error eliminando producto:", error);
      setError(
        `Error: ${error.message}. El producto se eliminó solo localmente.`,
      );
    } finally {
      setDeleting(false);
      setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
    }
  };

  /* ================= INICIAR EDICIÓN ================= */
  const iniciarEdicion = (producto) => {
    setEditandoId(producto.id || producto._id);
    setFormEdit({
      nombre: producto.nombre || "",
      precio: producto.precio || "",
      precio_antes: producto.precio_antes || "",
      descuento: producto.descuento || "",
      descripcion: producto.descripcion || "",
      categoria_id: producto.categoria_id || "",
      es_oferta: producto.es_oferta == 1 || producto.es_oferta === true,
      stock: parseInt(producto.stock) || 0,
      destacado: producto.destacado == 1 || producto.destacado === true,
      nuevo: producto.nuevo == 1 || producto.nuevo === true,
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
    if (!id) {
      setError("ID del producto no válido");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const productoOriginal = productos.find((p) => (p.id || p._id) === id);

      if (!productoOriginal) {
        throw new Error("Producto no encontrado");
      }

      // Preparar payload
      const payload = {};

      // Campos básicos
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
        const nuevoValor = formEdit[campo];
        const valorOriginal = productoOriginal[campo];

        if (
          campo === "precio" ||
          campo === "precio_antes" ||
          campo === "descuento"
        ) {
          if (parseFloat(nuevoValor) !== parseFloat(valorOriginal || 0)) {
            payload[campo] = nuevoValor;
          }
        } else if (campo === "stock") {
          if (parseInt(nuevoValor) !== parseInt(valorOriginal || 0)) {
            payload[campo] = parseInt(nuevoValor);
          }
        } else if (nuevoValor !== valorOriginal) {
          payload[campo] = nuevoValor;
        }
      });

      // Campos booleanos
      const booleanFields = ["es_oferta", "destacado", "nuevo"];
      booleanFields.forEach((field) => {
        const nuevoValor = formEdit[field] ? 1 : 0;
        const valorOriginal =
          productoOriginal[field] == 1 || productoOriginal[field] === true
            ? 1
            : 0;
        if (nuevoValor !== valorOriginal) {
          payload[field] = nuevoValor;
        }
      });

      if (Object.keys(payload).length === 0) {
        setError("No hay cambios para guardar");
        return;
      }

      console.log("Actualizando producto ID:", id, "Payload:", payload);

      // Intentar PUT estándar
      try {
        const res = await fetch(`${API_URL}/api/productos/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          // Actualizar lista localmente
          setProductos((prev) =>
            prev.map((p) =>
              (p.id || p._id) === id
                ? {
                    ...p,
                    ...payload,
                    categoria_nombre: p.categoria_nombre,
                    nombre:
                      payload.nombre !== undefined ? payload.nombre : p.nombre,
                  }
                : p,
            ),
          );

          setSuccessMessage(
            `✅ Producto "${formEdit.nombre}" actualizado correctamente`,
          );
          setEditandoId(null);

          setTimeout(() => setSuccessMessage(null), 3000);
          return;
        } else {
          console.warn("PUT falló, intentando actualización local");
        }
      } catch (putError) {
        console.warn("Error en PUT, actualizando localmente:", putError);
      }

      // Si el PUT falla, actualizar localmente
      setProductos((prev) =>
        prev.map((p) =>
          (p.id || p._id) === id
            ? {
                ...p,
                ...payload,
                categoria_nombre: p.categoria_nombre,
                nombre:
                  payload.nombre !== undefined ? payload.nombre : p.nombre,
              }
            : p,
        ),
      );

      setSuccessMessage(
        `⚠️ Producto "${formEdit.nombre}" actualizado localmente. Los cambios no se guardaron en el servidor.`,
      );
      setEditandoId(null);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error actualizando producto:", error);
      setError(
        `Error: ${error.message}. Los cambios se aplicaron solo localmente.`,
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */
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

  const stats = {
    total: productos.length,
    conStock: productos.filter((p) => (parseInt(p.stock) || 0) > 0).length,
    enOferta: productos.filter((p) => p.es_oferta == 1 || p.es_oferta === true)
      .length,
    sinStock: productos.filter((p) => (parseInt(p.stock) || 0) <= 0).length,
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
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                API: {API_URL}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                Productos: {productos.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={cargarDatos}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-600/30 transition"
            >
              <RefreshCw size={18} />
              Recargar
            </button>
            <a
              href="/admin/crear-producto"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-600/30 transition"
            >
              <PlusCircle size={18} />
              Nuevo Producto
            </a>
          </div>
        </div>

        {/* MENSAJES DE ESTADO */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{error}</p>
                <p className="text-xs text-red-700 mt-1">
                  Los cambios pueden estar aplicados solo localmente.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl"
          >
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          </motion.div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
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
          <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
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
          <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
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
          <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
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
                <option key={cat.id || cat._id} value={cat.id || cat._id}>
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
              {productos.length === 0
                ? "No hay productos"
                : "No hay resultados"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {productos.length === 0
                ? "No se pudieron cargar los productos o el catálogo está vacío."
                : "No se encontraron productos con los filtros aplicados."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={cargarDatos}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <RefreshCw size={16} className="inline mr-2" />
                Recargar
              </button>
              <a
                href="/admin/crear-producto"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <PlusCircle size={16} className="inline mr-2" />
                Crear Producto
              </a>
            </div>
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
                    key={producto.id || producto._id}
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
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200 bg-gray-100"
                            onError={(e) => {
                              e.target.src = "/imagenes/no-image.png";
                              e.target.onerror = null;
                            }}
                          />
                          {(producto.destacado == 1 ||
                            producto.destacado === true) && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                              <Star className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          {editandoId === (producto.id || producto._id) ? (
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
                                {producto.nombre || "Sin nombre"}
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
                                          expandedDesc ===
                                            (producto.id || producto._id)
                                            ? null
                                            : producto.id || producto._id,
                                        )
                                      }
                                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                                    >
                                      {expandedDesc ===
                                      (producto.id || producto._id)
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
                      {editandoId === (producto.id || producto._id) ? (
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
                            <option
                              key={cat.id || cat._id}
                              value={cat.id || cat._id}
                            >
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
                      {editandoId === (producto.id || producto._id) ? (
                        <div className="space-y-2">
                          <input
                            type="number"
                            step="0.01"
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
                              type="number"
                              step="0.01"
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
                            $
                            {Number(producto.precio || 0).toLocaleString(
                              "es-ES",
                              {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </p>
                          {producto.precio_antes &&
                            parseFloat(producto.precio_antes) >
                              parseFloat(producto.precio || 0) && (
                              <p className="text-sm text-gray-400 line-through">
                                $
                                {Number(producto.precio_antes).toLocaleString(
                                  "es-ES",
                                  {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2,
                                  },
                                )}
                              </p>
                            )}
                        </div>
                      )}
                    </td>

                    {/* STOCK */}
                    <td className="px-6 py-4">
                      {editandoId === (producto.id || producto._id) ? (
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
                        {(producto.es_oferta == 1 ||
                          producto.es_oferta === true) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                            <Tag size={10} />
                            Oferta
                          </span>
                        )}
                        {(producto.nuevo == 1 || producto.nuevo === true) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                            Nuevo
                          </span>
                        )}
                        {editandoId === (producto.id || producto._id) && (
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
                      {editandoId === (producto.id || producto._id) ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              actualizarProducto(producto.id || producto._id)
                            }
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
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200 bg-gray-100"
                    onError={(e) => {
                      e.target.src = "/imagenes/no-image.png";
                      e.target.onerror = null;
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {productoToDelete.nombre}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      ID: {productoToDelete.id || productoToDelete._id}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Categoría: {productoToDelete.categoria_nombre || "N/A"}
                    </p>
                    <p className="text-red-600 font-bold">
                      ${Number(productoToDelete.precio || 0).toLocaleString()}
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
                        {deleting
                          ? "Eliminando producto..."
                          : "Esta acción eliminará permanentemente el producto del catálogo."}
                      </p>
                      <p className="text-xs text-red-600 mt-2 font-medium">
                        ⚠️ Nota: El endpoint DELETE parece no estar disponible.
                        Se intentará eliminar localmente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductoToDelete(null);
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

      {/* PAGINATION */}
      {productosFiltrados.length > 0 && (
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
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
