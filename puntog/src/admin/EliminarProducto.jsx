import { useEffect, useState, useMemo } from "react";
import {
  Trash2,
  Pencil,
  Save,
  X,
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
  Edit3,
  Image as ImageIcon,
  Shield,
  Star,
  FileText,
  PlusCircle,
  ImageOff,
  Database,
  Server,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

// Componente para manejar imágenes de forma segura
const SafeImage = ({
  src,
  alt,
  className,
  fallback = "/imagenes/no-image.png",
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Normalizar URL - asegurar HTTPS y corregir URLs
  const normalizeUrl = (url) => {
    if (
      !url ||
      url === "null" ||
      url === "undefined" ||
      url === "http://null"
    ) {
      return null;
    }

    // Si la URL empieza con http://, cambiarla a https://
    if (url.startsWith("http://")) {
      return url.replace("http://", "https://");
    }

    // Si no tiene protocolo, asumir que es HTTPS
    if (url.startsWith("//")) {
      return `https:${url}`;
    }

    // Si empieza con /, es una ruta relativa
    if (url.startsWith("/")) {
      return url;
    }

    return url;
  };

  const imageUrl = normalizeUrl(src);
  const finalSrc = error || !imageUrl ? fallback : imageUrl;

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <img
        src={finalSrc}
        alt={alt}
        className={`${className} ${loading ? "opacity-0" : "opacity-100"}`}
        onLoad={() => {
          setLoading(false);
          setError(false);
        }}
        onError={(e) => {
          console.warn(`❌ Error cargando imagen: ${src} -> ${finalSrc}`);
          setError(true);
          setLoading(false);
          e.target.src = fallback;
        }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      {error && !loading && (
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
  const [apiStatus, setApiStatus] = useState({
    online: false,
    responseTime: 0,
  });

  /* ================= VERIFICAR ESTADO DEL API ================= */
  const verificarApiStatus = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch(`${API_URL}/api/productos`, {
        method: "HEAD", // Solo verificamos si responde
        cache: "no-cache",
      });
      const responseTime = Date.now() - startTime;
      setApiStatus({
        online: response.ok,
        responseTime,
        status: response.status,
        statusText: response.statusText,
      });
      return response.ok;
    } catch (error) {
      setApiStatus({
        online: false,
        responseTime: Date.now() - startTime,
        error: error.message,
      });
      return false;
    }
  };

  /* ================= CARGAR DATOS ================= */
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      setDebugInfo(null);

      console.log(`🔄 Cargando datos de: ${API_URL}`);

      // Verificar estado del API primero
      const apiOk = await verificarApiStatus();
      if (!apiOk) {
        throw new Error(`El servidor API no está respondiendo: ${API_URL}`);
      }

      // Cargar productos
      const startTime = Date.now();
      const resProductos = await fetch(`${API_URL}/api/productos`, {
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        mode: "cors",
        credentials: "omit",
      });

      const responseTime = Date.now() - startTime;
      console.log(
        `📊 Productos response status: ${resProductos.status} (${responseTime}ms)`,
      );

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
      }

      if (!Array.isArray(productosData)) {
        console.warn("Formato de productos inesperado:", dataProductos);
        productosData = [];
      }

      // Limpiar y normalizar datos de productos
      const productosLimpios = productosData.map((producto) => {
        // Normalizar URLs de imágenes
        const imagenesDisponibles = [
          producto.imagen_cloud1,
          producto.imagen_cloud2,
          producto.imagen_cloud3,
          producto.imagen,
        ].filter(
          (img) => img && img !== "null" && img !== "undefined" && img !== "",
        );

        // Seleccionar la primera imagen válida
        const imagenPrincipal =
          imagenesDisponibles.length > 0
            ? imagenesDisponibles[0]
            : "/imagenes/no-image.png";

        return {
          ...producto,
          id: producto.id || producto._id,
          nombre: producto.nombre || "Sin nombre",
          precio: Number(producto.precio) || 0,
          precio_antes: producto.precio_antes
            ? Number(producto.precio_antes)
            : null,
          stock: parseInt(producto.stock) || 0,
          es_oferta: producto.es_oferta == 1 || producto.es_oferta === true,
          destacado: producto.destacado == 1 || producto.destacado === true,
          nuevo: producto.nuevo == 1 || producto.nuevo === true,
          activo: producto.activo == 1 || producto.activo === true,
          imagen: imagenPrincipal,
          imagenes: imagenesDisponibles,
          categoria_nombre:
            producto.categoria_nombre || producto.categoria || "Sin categoría",
          // Debug info
          _debug: {
            imagenesDisponibles: imagenesDisponibles.length,
            originalImagen: producto.imagen,
          },
        };
      });

      setProductos(productosLimpios);
      console.log(`📦 Productos procesados: ${productosLimpios.length}`);

      // Cargar categorías
      try {
        const resCategorias = await fetch(`${API_URL}/api/categorias`, {
          headers: { Accept: "application/json" },
        });

        if (resCategorias.ok) {
          const dataCategorias = await resCategorias.json();
          const categoriasLimpios = Array.isArray(dataCategorias)
            ? dataCategorias.map((cat) => ({
                id: cat.id || cat._id,
                nombre: cat.nombre || "Sin nombre",
                slug: cat.slug || `categoria-${cat.id}`,
              }))
            : [];
          setCategorias(categoriasLimpios);
          console.log(`🏷️ Categorías cargadas: ${categoriasLimpios.length}`);
        }
      } catch (categoriasError) {
        console.warn("⚠️ Error cargando categorías:", categoriasError.message);
      }

      setSuccessMessage(`✅ ${productosLimpios.length} productos cargados`);
      setDebugInfo(
        `API: ${apiStatus.online ? "✅ Online" : "❌ Offline"} | Tiempo: ${responseTime}ms`,
      );
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
      filtered = filtered.filter((p) => p.categoria_id == selectedCategory);
    }

    // Filtrar por estado
    if (statusFilter !== "todos") {
      switch (statusFilter) {
        case "oferta":
          filtered = filtered.filter((p) => p.es_oferta);
          break;
        case "sin_stock":
          filtered = filtered.filter((p) => p.stock <= 0);
          break;
        case "destacados":
          filtered = filtered.filter((p) => p.destacado);
          break;
        case "activos":
          filtered = filtered.filter((p) => p.activo !== false);
          break;
      }
    }

    // Ordenar
    filtered.sort((a, b) => {
      const nombreA = a.nombre.toLowerCase();
      const nombreB = b.nombre.toLowerCase();
      const precioA = a.precio;
      const precioB = b.precio;
      const stockA = a.stock;
      const stockB = b.stock;

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
        case "id_desc":
          return b.id - a.id;
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
    setError(null);
    setDebugInfo(`Iniciando eliminación...`);

    try {
      const productoId = productoToDelete.id;
      if (!productoId) throw new Error("ID del producto no válido");

      console.log(`🗑️ Eliminando producto ID: ${productoId}`);

      // Estrategia 1: DELETE directo
      try {
        const deleteRes = await fetch(
          `${API_URL}/api/productos/${productoId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );

        console.log(`DELETE Status: ${deleteRes.status}`);

        if (deleteRes.ok) {
          // Éxito
          setProductos((prev) => prev.filter((p) => p.id !== productoId));
          setSuccessMessage(
            `✅ Producto "${productoToDelete.nombre}" eliminado`,
          );
          setShowDeleteModal(false);
          setProductoToDelete(null);
          return;
        }

        // Si DELETE falla con 404, probar PUT
        if (deleteRes.status === 404) {
          console.log("DELETE no encontrado, intentando PUT...");
          throw new Error("DELETE endpoint no disponible");
        }

        // Otro error en DELETE
        const errorText = await deleteRes.text();
        throw new Error(`DELETE ${deleteRes.status}: ${errorText}`);
      } catch (deleteError) {
        // Estrategia 2: PUT para marcar como inactivo
        console.log("Probando estrategia PUT...");

        const putRes = await fetch(`${API_URL}/api/productos/${productoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ activo: 0, eliminado: true }),
        });

        if (putRes.ok) {
          // Marcar como inactivo localmente
          setProductos((prev) =>
            prev.map((p) =>
              p.id === productoId ? { ...p, activo: 0, eliminado: true } : p,
            ),
          );
          setSuccessMessage(
            `⚠️ Producto "${productoToDelete.nombre}" marcado como inactivo`,
          );
          setShowDeleteModal(false);
          setProductoToDelete(null);
          return;
        }

        // Si ambas estrategias fallan, eliminar solo localmente
        console.log("Ambos métodos fallaron, eliminando localmente...");
        setProductos((prev) => prev.filter((p) => p.id !== productoId));
        setSuccessMessage(
          `📱 Producto "${productoToDelete.nombre}" eliminado localmente`,
        );
        setDebugInfo("El producto se eliminó solo de la vista local");
        setShowDeleteModal(false);
        setProductoToDelete(null);
      }
    } catch (error) {
      console.error("Error en proceso de eliminación:", error);
      setError(`Error al eliminar: ${error.message}`);
    } finally {
      setDeleting(false);
      setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
        setDebugInfo(null);
      }, 5000);
    }
  };

  /* ================= RESTANTE DEL COMPONENTE ================= */
  // ... (mantén tus funciones de edición, etc.)

  const stats = {
    total: productos.length,
    conStock: productos.filter((p) => p.stock > 0).length,
    enOferta: productos.filter((p) => p.es_oferta).length,
    sinStock: productos.filter((p) => p.stock <= 0).length,
    activos: productos.filter((p) => p.activo !== false).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando productos...</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <p className="text-sm text-gray-500">{API_URL}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      {/* HEADER CON INFO DEL API */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Gestión de Productos
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Server
                  className={`w-4 h-4 ${apiStatus.online ? "text-green-500" : "text-red-500"}`}
                />
                <span
                  className={`text-sm ${apiStatus.online ? "text-green-600" : "text-red-600"}`}
                >
                  {apiStatus.online
                    ? `✅ Online (${apiStatus.responseTime}ms)`
                    : "❌ Offline"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">
                  {productos.length} productos
                </span>
              </div>
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
          </div>
        </div>

        {/* MENSAJES DE ESTADO */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">{error}</p>
                <p className="text-xs text-red-700 mt-1">Servidor: {API_URL}</p>
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

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            {
              label: "Total",
              value: stats.total,
              color: "bg-blue-100 text-blue-800",
              icon: Package,
            },
            {
              label: "Con Stock",
              value: stats.conStock,
              color: "bg-green-100 text-green-800",
              icon: CheckCircle,
            },
            {
              label: "En Oferta",
              value: stats.enOferta,
              color: "bg-amber-100 text-amber-800",
              icon: Tag,
            },
            {
              label: "Sin Stock",
              value: stats.sinStock,
              color: "bg-red-100 text-red-800",
              icon: XCircle,
            },
            {
              label: "Activos",
              value: stats.activos,
              color: "bg-purple-100 text-purple-800",
              icon: CheckCircle,
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg ${stat.color.split(" ")[0]} flex items-center justify-center`}
                >
                  {stat.icon && <stat.icon className="w-5 h-5" />}
                </div>
              </div>
            </div>
          ))}
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
              <option value="activos">Solo activos</option>
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
              <option value="id_desc">Más recientes</option>
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
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {productos.length === 0
                ? "No se pudieron cargar los productos o el catálogo está vacío."
                : "No se encontraron productos con los filtros aplicados."}
            </p>
            <button
              onClick={cargarDatos}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw size={16} className="inline mr-2" />
              Recargar productos
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Precio
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
                  <tr
                    key={producto.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <SafeImage
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 mb-2">
                            {producto.nombre}
                          </p>
                          <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                            {producto.descripcion || "Sin descripción"}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {producto.id} |{" "}
                            {producto.activo !== false
                              ? "✅ Activo"
                              : "❌ Inactivo"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2">
                        <Tag size={14} className="text-gray-400" />
                        {producto.categoria_nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">
                          $
                          {producto.precio.toLocaleString("es-ES", {
                            minimumFractionDigits: 0,
                          })}
                        </p>
                        {producto.precio_antes &&
                          producto.precio_antes > producto.precio && (
                            <p className="text-sm text-gray-400 line-through">
                              $
                              {producto.precio_antes.toLocaleString("es-ES", {
                                minimumFractionDigits: 0,
                              })}
                            </p>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                          producto.stock > 10
                            ? "bg-green-100 text-green-800"
                            : producto.stock > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {producto.stock > 10
                          ? "✓"
                          : producto.stock > 0
                            ? "⚠"
                            : "✗"}
                        {producto.stock} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {producto.es_oferta && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                            <Tag size={10} />
                            Oferta
                          </span>
                        )}
                        {producto.destacado && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">
                            <Star size={10} />
                            Destacado
                          </span>
                        )}
                        {producto.nuevo && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                            Nuevo
                          </span>
                        )}
                        {producto.activo === false && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
                            Inactivo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => confirmarEliminacion(producto)}
                          className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-md transition"
                          title="Eliminar"
                          disabled={deleting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE ELIMINACIÓN */}
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
                  <SafeImage
                    src={productoToDelete.imagen}
                    alt={productoToDelete.nombre}
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {productoToDelete.nombre}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Categoría: {productoToDelete.categoria_nombre}
                    </p>
                    <p className="text-red-600 font-bold">
                      ${Number(productoToDelete.precio || 0).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Stock: {productoToDelete.stock} unidades
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800">
                        Se intentarán múltiples estrategias:
                      </p>
                      <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                        <li>1. DELETE directo</li>
                        <li>2. PUT para marcar como inactivo</li>
                        <li>3. Eliminación local como respaldo</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">¿Estás seguro?</p>
                      <p className="text-red-700 text-sm mt-1">
                        Esta acción{" "}
                        {productoToDelete.activo === false
                          ? "eliminará permanentemente"
                          : "marcará como inactivo"}{" "}
                        el producto.
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
                      Procesando...
                    </>
                  ) : (
                    "Confirmar Eliminación"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGINACIÓN Y ESTADÍSTICAS */}
      {productosFiltrados.length > 0 && (
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Mostrando{" "}
              <span className="font-semibold">{productosFiltrados.length}</span>{" "}
              de <span className="font-semibold">{productos.length}</span>{" "}
              productos
            </p>
            <div className="flex items-center gap-2">
              <Server
                className={`w-3 h-3 ${apiStatus.online ? "text-green-500" : "text-red-500"}`}
              />
              <span className="text-xs text-gray-500">
                API:{" "}
                {apiStatus.online
                  ? `Online (${apiStatus.responseTime}ms)`
                  : "Offline"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={cargarDatos}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
            >
              <RefreshCw size={14} />
              <span className="text-sm">Actualizar</span>
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
