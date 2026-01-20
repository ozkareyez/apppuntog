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
  Database,
  Server,
  Globe,
  Eye,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "https://gleaming-motivation-production-4018.up.railway.app";

// Componente optimizado para manejar imágenes
const ProductoImagen = ({ src, alt, className = "w-16 h-16", onError }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Función para normalizar URL
  const normalizeImageUrl = useCallback((url) => {
    if (
      !url ||
      url === "null" ||
      url === "undefined" ||
      url === "http://null" ||
      url === "https://null"
    ) {
      return null;
    }

    // Si es una URL de Cloudinary que sabemos que no existe, devolver null
    const problematicImages = [
      "fdfifkqpzegbgyfsrrnd.jpg",
      "p4puk9ymkntqpuamlrlh.jpg",
      "suy42v9xtemxywo2fhov.jpg",
      "wfohwilzzyvw4yoxcs6y.jpg",
      "rvv0zhltrws0enfscvlc.jpg",
      "gk3gm0mlglhj9bd3ebwu.jpg",
      "z0pbd7dggiclp8t4jqlk.jpg",
      "y3vgyp4ewx3hdd8kwmat.jpg",
    ];

    const hasProblematicImage = problematicImages.some((problemImg) =>
      url.includes(problemImg),
    );

    if (hasProblematicImage) {
      console.log(`⚠️ Imagen problemática detectada: ${url}`);
      return null;
    }

    // Convertir http a https
    if (url.startsWith("http://")) {
      return url.replace("http://", "https://");
    }

    return url;
  }, []);

  const imageUrl = normalizeImageUrl(src);
  const finalSrc = error || !imageUrl ? "/imagenes/no-image.png" : imageUrl;

  return (
    <div className="relative">
      {/* Estado de carga */}
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Imagen */}
      <img
        src={finalSrc}
        alt={alt}
        className={`${className} rounded-lg object-cover border border-gray-200 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => {
          setLoading(false);
          setError(false);
        }}
        onError={(e) => {
          setError(true);
          setLoading(false);
          if (onError) onError(src, finalSrc);

          // Solo mostrar warning si no es la imagen por defecto
          if (finalSrc !== "/imagenes/no-image.png") {
            console.warn(`❌ Error cargando imagen: ${src} → ${finalSrc}`);
          }

          // Forzar cambio a imagen por defecto
          e.target.src = "/imagenes/no-image.png";
        }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* Indicador de error */}
      {error && !loading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex flex-col items-center justify-center p-2">
          <ImageOff className="w-4 h-4 text-gray-400 mb-1" />
          <span className="text-[10px] text-gray-500 text-center">
            Sin imagen
          </span>
        </div>
      )}

      {/* Indicador de imagen por defecto */}
      {!imageUrl && !loading && !error && (
        <div className="absolute inset-0 bg-gray-50 rounded-lg flex items-center justify-center">
          <span className="text-xs text-gray-400">Sin foto</span>
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

  // Estados para eliminación
  const [productoToDelete, setProductoToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [apiStatus, setApiStatus] = useState({
    online: false,
    responseTime: 0,
  });

  /* ================= CARGAR DATOS ================= */
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      console.log(`🔄 Cargando datos de: ${API_URL}`);

      // Verificar estado del API
      const startTime = Date.now();
      const testRes = await fetch(`${API_URL}/`, { method: "HEAD" });
      const responseTime = Date.now() - startTime;

      setApiStatus({
        online: testRes.ok,
        responseTime,
        status: testRes.status,
        timestamp: new Date().toISOString(),
      });

      if (!testRes.ok) {
        throw new Error(`API offline (${testRes.status})`);
      }

      // Cargar productos
      const productosRes = await fetch(`${API_URL}/api/productos`);

      if (!productosRes.ok) {
        throw new Error(`Error ${productosRes.status} cargando productos`);
      }

      const productosData = await productosRes.json();

      if (!Array.isArray(productosData)) {
        throw new Error("Formato de datos inválido");
      }

      // Limpiar y preparar productos
      const productosLimpios = productosData.map((producto) => {
        // Seleccionar la mejor imagen disponible
        const imagenesDisponibles = [
          producto.imagen_cloud1,
          producto.imagen_cloud2,
          producto.imagen_cloud3,
          producto.imagen,
        ].filter((img) => img && !img.includes("null"));

        // Usar primera imagen válida o null
        const imagenPrincipal =
          imagenesDisponibles.length > 0 ? imagenesDisponibles[0] : null;

        return {
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
          imagen: imagenPrincipal,
          imagenes: imagenesDisponibles,
          activo: producto.activo == 1,
          creado: producto.created_at || producto.fecha_creacion,
        };
      });

      setProductos(productosLimpios);
      console.log(`✅ ${productosLimpios.length} productos cargados`);

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

      setSuccessMessage(
        `✅ ${productosLimpios.length} productos cargados correctamente`,
      );
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
      setError(
        `Error: ${error.message}. Verifica la conexión con el servidor.`,
      );
      setProductos([]);
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
          (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
          p.categoria_nombre.toLowerCase().includes(term),
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
        case "stock_asc":
          return a.stock - b.stock;
        case "stock_desc":
          return b.stock - a.stock;
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

    try {
      const productoId = productoToDelete.id;

      console.log(`🗑️ Enviando DELETE para producto ID: ${productoId}`);

      const response = await fetch(`${API_URL}/api/productos/${productoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const responseText = await response.text();
      let data;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { ok: false, message: "Respuesta no válida" };
      }

      if (response.ok && data.ok) {
        // Éxito - eliminar del estado local
        setProductos((prev) => prev.filter((p) => p.id !== productoId));

        setSuccessMessage(
          `✅ Producto "${productoToDelete.nombre}" eliminado permanentemente de la base de datos`,
        );

        // Cerrar modal y resetear
        setShowDeleteModal(false);
        setProductoToDelete(null);

        // Auto-ocultar mensaje de éxito
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error(
          data.message || `Error ${response.status}: No se pudo eliminar`,
        );
      }
    } catch (error) {
      console.error("❌ Error eliminando producto:", error);
      setError(`Error al eliminar: ${error.message}`);

      // Auto-ocultar error
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeleting(false);
    }
  };

  /* ================= ESTADÍSTICAS ================= */
  const stats = {
    total: productos.length,
    conStock: productos.filter((p) => p.stock > 0).length,
    enOferta: productos.filter((p) => p.es_oferta).length,
    sinStock: productos.filter((p) => p.stock <= 0).length,
    destacados: productos.filter((p) => p.destacado).length,
  };

  /* ================= RENDER ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Cargando productos...</p>
          <p className="text-sm text-gray-500 mt-2">Conectando al servidor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Eliminar Productos
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Server
                  className={`w-4 h-4 ${apiStatus.online ? "text-green-500" : "text-red-500"}`}
                />
                <span className="text-sm text-gray-600">
                  {apiStatus.online ? "✅ Conectado" : "❌ Desconectado"}
                </span>
              </div>
              <span className="text-sm text-gray-500">|</span>
              <span className="text-sm text-gray-600">
                {productos.length} productos
              </span>
            </div>
          </div>

          <button
            onClick={cargarDatos}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>
        </div>

        {/* MENSAJES */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* ESTADÍSTICAS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            {
              label: "Total",
              value: stats.total,
              icon: Package,
              color: "bg-blue-100 text-blue-800",
            },
            {
              label: "Con Stock",
              value: stats.conStock,
              icon: CheckCircle,
              color: "bg-green-100 text-green-800",
            },
            {
              label: "En Oferta",
              value: stats.enOferta,
              icon: Tag,
              color: "bg-amber-100 text-amber-800",
            },
            {
              label: "Sin Stock",
              value: stats.sinStock,
              icon: XCircle,
              color: "bg-red-100 text-red-800",
            },
            {
              label: "Destacados",
              value: stats.destacados,
              icon: Star,
              color: "bg-purple-100 text-purple-800",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-gray-200 p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm appearance-none"
            >
              <option value="todos">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm appearance-none"
            >
              <option value="todos">Todos los estados</option>
              <option value="oferta">En oferta</option>
              <option value="destacados">Destacados</option>
              <option value="con_stock">Con stock</option>
              <option value="sin_stock">Sin stock</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm appearance-none"
            >
              <option value="id_desc">Más recientes</option>
              <option value="nombre_asc">Nombre A-Z</option>
              <option value="nombre_desc">Nombre Z-A</option>
              <option value="precio_asc">Precio menor</option>
              <option value="precio_desc">Precio mayor</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">No hay productos</p>
            <p className="text-gray-500 text-sm mt-1">
              {productos.length === 0
                ? "La base de datos está vacía"
                : "No hay resultados con los filtros actuales"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((producto) => (
                  <tr
                    key={producto.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductoImagen
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-12 h-12"
                        />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {producto.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {producto.id}
                          </p>
                          {producto.descripcion && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                              {producto.descripcion}
                            </p>
                          )}
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
                        {producto.precio_antes &&
                          producto.precio_antes > producto.precio && (
                            <p className="text-xs text-gray-400 line-through">
                              ${producto.precio_antes.toLocaleString()}
                            </p>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
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
                      <div className="flex gap-1 mt-1">
                        {producto.es_oferta && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-800 rounded">
                            Oferta
                          </span>
                        )}
                        {producto.destacado && (
                          <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                            Destacado
                          </span>
                        )}
                        {producto.nuevo && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                            Nuevo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => confirmarEliminacion(producto)}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition flex items-center gap-1"
                        title="Eliminar permanentemente"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINACIÓN */}
      {productosFiltrados.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {productosFiltrados.length} de {productos.length}{" "}
            productos
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Anterior
            </button>
            <span className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm">
              1
            </span>
            <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      <AnimatePresence>
        {showDeleteModal && productoToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-md"
            >
              {/* Header */}
              <div className="bg-red-600 p-4 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-white" />
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Eliminar Producto
                    </h3>
                    <p className="text-red-100 text-sm">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <ProductoImagen
                    src={productoToDelete.imagen}
                    alt={productoToDelete.nombre}
                    className="w-16 h-16"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {productoToDelete.nombre}
                    </h4>
                    <p className="text-sm text-gray-600">
                      ID: {productoToDelete.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      Categoría: {productoToDelete.categoria_nombre}
                    </p>
                    <p className="text-red-600 font-bold mt-1">
                      ${Number(productoToDelete.precio || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">
                        ¿Estás completamente seguro?
                      </p>
                      <ul className="text-red-700 text-sm mt-2 space-y-1">
                        <li>• El producto será eliminado PERMANENTEMENTE</li>
                        <li>• Se borrará de la base de datos</li>
                        <li>• Las imágenes se eliminarán de Cloudinary</li>
                        <li>• Esta acción NO se puede revertir</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProductoToDelete(null);
                  }}
                  disabled={deleting}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarProducto}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar Permanentemente"
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
