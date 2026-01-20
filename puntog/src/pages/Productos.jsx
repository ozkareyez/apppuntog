import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Tag,
  Filter,
  Star,
  Heart,
  Eye,
  TrendingUp,
  ChevronDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { API_URL } from "@/config";
import { motion, AnimatePresence } from "framer-motion";

const Productos = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [sortBy, setSortBy] = useState("recomendados");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);
  const [quickView, setQuickView] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const categoriaSlug = searchParams.get("categoria") || null;
  const filtroOferta = searchParams.get("filtro") === "ofertas";

  // Mapeo CORREGIDO basado en tus datos reales
  const MAPEO_CATEGORIAS = {
    categoria1: "Juguetes",
    categoria2: "Lencería",
    categoria3: "Lubricantes",
    categoria4: "Accesorios",
  };

  // Cargar categorías
  useEffect(() => {
    fetch(`${API_URL}/api/categorias`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Categorías cargadas del backend:", data);
        setCategorias(Array.isArray(data) ? data : []);
      })
      .catch(console.error);
  }, []);

  // Cargar productos
  useEffect(() => {
    setLoading(true);

    let url = `${API_URL}/api/productos`;
    const params = new URLSearchParams();

    // Si hay categoría seleccionada
    if (categoriaSlug) {
      // Determinar qué nombre enviar al backend
      let nombreParaBackend;

      if (categoriaSlug === "categoria1") nombreParaBackend = "Juguetes";
      else if (categoriaSlug === "categoria2") nombreParaBackend = "Lencería";
      else if (categoriaSlug === "categoria3")
        nombreParaBackend = "Lubricantes";
      else if (categoriaSlug === "categoria4") nombreParaBackend = "Accesorios";
      else nombreParaBackend = categoriaSlug;

      params.append("categoria", nombreParaBackend);
      console.log(`🎯 Filtro backend: categoria=${nombreParaBackend}`);
    }

    if (filtroOferta) {
      params.append("es_oferta", "true");
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log("📡 Fetching:", url);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log(`✅ ${data.length} productos recibidos`);
        setProductos(Array.isArray(data) ? data : []);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setProductos([]);
        setLoading(false);
      });
  }, [categoriaSlug, filtroOferta]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoriaSlug, filtroOferta, sortBy, priceRange]);

  // Funciones auxiliares
  const getNombreCategoria = (slug) => {
    return MAPEO_CATEGORIAS[slug] || "Categoría";
  };

  const getCategoriaActualNombre = () => {
    if (!categoriaSlug) return "Todos los productos";
    return getNombreCategoria(categoriaSlug);
  };

  const cambiarCategoria = (slug) => {
    const params = new URLSearchParams(searchParams);

    if (!slug || slug === "todas") {
      params.delete("categoria");
    } else {
      params.set("categoria", slug);
    }

    if (filtroOferta) {
      params.set("filtro", "ofertas");
    }

    setSearchParams(params);
  };

  const toggleOferta = () => {
    const params = new URLSearchParams(searchParams);

    if (filtroOferta) {
      params.delete("filtro");
    } else {
      params.set("filtro", "ofertas");
    }

    if (categoriaSlug) {
      params.set("categoria", categoriaSlug);
    }

    setSearchParams(params);
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const getImageSrc = (imagen) => {
    if (!imagen) return "/imagenes/no-image.png";
    if (imagen.startsWith("http://") || imagen.startsWith("https://")) {
      return imagen.replace("http://", "https://");
    }
    if (imagen.startsWith("/imagenes/")) return imagen;
    return `${API_URL}/images/${imagen}`;
  };

  // FUNCIÓN NUEVA: Determinar estado del producto
  const getEstadoProducto = (producto) => {
    // Verificar si está agotado usando diferentes criterios
    // 1. Si tiene campo 'agotado' explícito
    if (producto.agotado !== undefined && producto.agotado !== null) {
      return producto.agotado ? "Agotado" : "Disponible";
    }

    // 2. Si tiene stock definido
    if (producto.stock !== undefined && producto.stock !== null) {
      return Number(producto.stock) > 0 ? "Disponible" : "Agotado";
    }

    // 3. Si tiene campo 'activo'
    if (producto.activo !== undefined && producto.activo !== null) {
      return producto.activo ? "Disponible" : "Agotado";
    }

    // Por defecto
    return "Disponible";
  };

  // FUNCIÓN NUEVA: Obtener color según estado
  const getEstadoColor = (estado) => {
    if (estado === "Agotado") {
      return "bg-red-100 text-red-800 border-red-200";
    }
    return "bg-green-100 text-green-800 border-green-200";
  };

  // FUNCIÓN NUEVA: Obtener icono según estado
  const getEstadoIcono = (estado) => {
    if (estado === "Agotado") {
      return <XCircle className="w-3 h-3" />;
    }
    return <CheckCircle className="w-3 h-3" />;
  };

  // Ordenamiento y filtrado
  const sortedProductos = () => {
    let sorted = [...productos];

    // Primero filtrar por precio
    sorted = sorted.filter(
      (p) => p.precio >= priceRange[0] && p.precio <= priceRange[1],
    );

    // Luego ordenar
    switch (sortBy) {
      case "precio-asc":
        return sorted.sort((a, b) => (a.precio || 0) - (b.precio || 0));
      case "precio-desc":
        return sorted.sort((a, b) => (b.precio || 0) - (a.precio || 0));
      case "nuevos":
        return sorted.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        );
      default:
        return sorted;
    }
  };

  const filteredProductos = sortedProductos();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProductos = filteredProductos.slice(
    indexOfFirstItem,
    Math.min(indexOfLastItem, filteredProductos.length),
  );

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-xl h-36 md:h-40 mb-3" />
          <div className="h-3 bg-gray-200 rounded mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  );

  return (
    <section className="min-h-screen bg-linear-to-b from-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="text-center mb-6 pt-15">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          >
            {getCategoriaActualNombre()}
            <span className="text-red-600">.</span>
          </motion.h1>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            {categoriaSlug
              ? `${filteredProductos.length} productos encontrados`
              : "Productos premium seleccionados para momentos íntimos y especiales"}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Productos", value: filteredProductos.length, icon: "✨" },
            { label: "Categorías", value: categorias.length, icon: "🏷️" },
            {
              label: "En oferta",
              value: productos.filter((p) => p.es_oferta).length,
              icon: "🔥",
            },
            {
              label: "Disponibles",
              value: productos.filter(
                (p) => getEstadoProducto(p) === "Disponible",
              ).length,
              icon: "📦",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm"
            >
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-base font-bold text-gray-900">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString()
                  : stat.value}
              </div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="w-full md:w-auto">
            <div className="flex overflow-x-auto pb-2 md:pb-0 md:flex-wrap gap-2 scrollbar-hide">
              <button
                onClick={() => cambiarCategoria("todas")}
                className={`px-4 py-2 rounded-full font-medium border transition-all duration-300 flex items-center gap-1 text-sm whitespace-nowrap flex-shrink-0
                  ${
                    !categoriaSlug
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
                      : "bg-white text-gray-700 border-gray-300 hover:border-red-600 hover:text-red-600"
                  }`}
              >
                <Sparkles size={14} />
                Todas
              </button>

              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => cambiarCategoria(cat.slug)}
                  className={`px-4 py-2 rounded-full font-medium border transition-all duration-300 text-sm whitespace-nowrap flex-shrink-0
                    ${
                      categoriaSlug === cat.slug
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
                        : "bg-white text-gray-700 border-gray-300 hover:border-red-600 hover:text-red-600"
                    }`}
                >
                  {MAPEO_CATEGORIAS[cat.slug] || cat.nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              <div className="relative flex-shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-full md:w-auto"
                >
                  <option value="recomendados">Recomendados</option>
                  <option value="nuevos">Más nuevos</option>
                  <option value="precio-asc">Precio: menor</option>
                  <option value="precio-desc">Precio: mayor</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>

              <button
                onClick={toggleOferta}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-300 text-sm whitespace-nowrap flex-shrink-0
                  ${
                    filtroOferta
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-red-600 hover:text-red-600"
                  }`}
              >
                <Tag size={14} />
                <span className="hidden sm:inline">Ofertas</span>
                <span className="sm:hidden">Ofertas</span>
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:border-red-600 hover:text-red-600 transition text-sm whitespace-nowrap flex-shrink-0"
              >
                <Filter size={14} />
                <span className="hidden sm:inline">Filtros</span>
                <span className="sm:hidden">Filtros</span>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-4 mb-6 overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <TrendingUp size={16} />
                    Rango de precio
                  </h3>
                  <div className="px-3">
                    <input
                      type="range"
                      min="0"
                      max="500000"
                      step="10000"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>${priceRange[0].toLocaleString()}</span>
                      <span>${priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                    Características
                  </h3>
                  <div className="space-y-2">
                    {[
                      "Envío gratis",
                      "Nuevo",
                      "Más vendido",
                      "Edición limitada",
                    ].map((feature) => (
                      <label
                        key={feature}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        <span className="text-gray-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && filteredProductos.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Mostrando {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredProductos.length)} de{" "}
            {filteredProductos.length} productos
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {currentProductos.map((producto) => {
              const precio = Number(producto.precio || 0);
              const precioAntes = Number(producto.precio_antes || 0);
              const esOferta = Boolean(producto.es_oferta);
              const imagenUrl = getImageSrc(producto.imagen);
              const isWishlisted = wishlist.includes(producto.id);

              // NUEVO: Obtener estado del producto
              const estadoProducto = getEstadoProducto(producto);
              const estaDisponible = estadoProducto === "Disponible";
              const estadoColor = getEstadoColor(estadoProducto);
              const estadoIcono = getEstadoIcono(estadoProducto);

              return (
                <motion.div
                  key={producto.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-red-200 transition-all duration-300 hover:shadow-lg ${
                    !estaDisponible ? "opacity-80" : ""
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(producto.id);
                    }}
                    className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:scale-110 transition-transform"
                  >
                    <Heart
                      size={16}
                      className={
                        isWishlisted
                          ? "fill-red-600 text-red-600"
                          : "text-gray-400"
                      }
                    />
                  </button>

                  <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                    {esOferta && precioAntes > 0 && (
                      <span className="px-2 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full shadow-md">
                        -{Math.round((1 - precio / precioAntes) * 100)}%
                      </span>
                    )}
                    {producto.stock < 10 &&
                      producto.stock > 0 &&
                      estaDisponible && (
                        <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                          Últimas
                        </span>
                      )}
                    {/* NUEVO: Badge de estado Disponible/Agotado */}
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full border ${estadoColor} flex items-center gap-1`}
                    >
                      {estadoIcono}
                      {estadoProducto}
                    </span>
                  </div>

                  <div
                    onClick={() => navigate(`/productos/${producto.id}`)}
                    className={`relative h-36 md:h-40 bg-gradient-to-br from-gray-50 to-white overflow-hidden cursor-pointer ${
                      !estaDisponible ? "grayscale" : ""
                    }`}
                  >
                    <img
                      src={imagenUrl}
                      alt={producto.nombre}
                      className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => (e.target.src = "/imagenes/no-image.png")}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-70 sm:opacity-0 sm:group-hover:opacity-70 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickView(producto);
                        }}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full font-medium flex items-center gap-1 hover:scale-105 transition-transform text-xs"
                      >
                        <Eye size={12} />
                        Vista rápida
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 md:p-3">
                    <h3
                      onClick={() => navigate(`/productos/${producto.id}`)}
                      className={`font-semibold text-gray-900 mb-2 line-clamp-2 h-10 text-sm cursor-pointer hover:text-red-600 transition ${
                        !estaDisponible ? "text-gray-500" : ""
                      }`}
                    >
                      {producto.nombre}
                    </h3>

                    <div className="flex items-center justify-between mb-2">
                      <div>
                        {esOferta && precioAntes > 0 && (
                          <p className="text-gray-400 text-xs line-through">
                            ${precioAntes.toLocaleString()}
                          </p>
                        )}
                        <p
                          className={`text-base md:text-lg font-bold ${
                            !estaDisponible ? "text-gray-500" : "text-red-600"
                          }`}
                        >
                          ${precio.toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs ${
                          !estaDisponible ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {producto.stock || 0} unid.
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (estaDisponible) {
                            addToCart(producto);
                          }
                        }}
                        disabled={!estaDisponible}
                        className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all shadow-md text-xs md:text-sm px-1 md:px-2 ${
                          estaDisponible
                            ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="truncate">
                          {estaDisponible ? "Agregar" : "Agotado"}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/productos/${producto.id}`);
                        }}
                        className="px-2 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 transition text-xs"
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && filteredProductos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {categoriaSlug
                ? `No hay productos en "${getCategoriaActualNombre()}"`
                : "No encontramos productos"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
              {categoriaSlug
                ? "Prueba con otra categoría o ajusta los filtros de precio"
                : "Intenta con otros filtros o vuelve más tarde"}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => cambiarCategoria("todas")}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:shadow-lg transition text-sm"
              >
                Ver todos los productos
              </button>
              {categoriaSlug && (
                <button
                  onClick={() => setPriceRange([0, 500000])}
                  className="px-6 py-2.5 border border-gray-300 font-medium rounded-lg hover:border-red-600 hover:text-red-600 transition text-sm"
                >
                  Limpiar filtros de precio
                </button>
              )}
            </div>
          </motion.div>
        )}

        {filteredProductos.length > itemsPerPage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages} • {filteredProductos.length}{" "}
              productos
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-10 h-10 rounded-md font-medium transition text-sm
                  ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed border border-gray-200"
                      : "border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 hover:shadow-sm"
                  }`}
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers().map((pageNumber, index) =>
                pageNumber === "..." ? (
                  <span
                    key={`dots-${index}`}
                    className="w-10 h-10 flex items-center justify-center text-gray-400"
                  >
                    <MoreHorizontal size={16} />
                  </span>
                ) : (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`w-10 h-10 rounded-md font-medium transition text-sm
                      ${
                        currentPage === pageNumber
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md"
                          : "border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 hover:shadow-sm"
                      }`}
                  >
                    {pageNumber}
                  </button>
                ),
              )}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-10 h-10 rounded-md font-medium transition text-sm
                  ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed border border-gray-200"
                      : "border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 hover:shadow-sm"
                  }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Mostrar:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
              >
                <option value={12}>12 productos</option>
                <option value={20}>20 productos</option>
                <option value={32}>32 productos</option>
                <option value={48}>48 productos</option>
              </select>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {quickView && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
              onClick={() => setQuickView(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="grid md:grid-cols-2">
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                    <img
                      src={getImageSrc(quickView.imagen)}
                      alt={quickView.nombre}
                      className="w-full h-48 object-contain"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">
                          {quickView.nombre}
                        </h2>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star
                              size={12}
                              className="fill-amber-400 text-amber-400"
                            />
                            <span className="font-medium text-sm">4.8</span>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-bold rounded-full ${
                              getEstadoProducto(quickView) === "Disponible"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {getEstadoProducto(quickView)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setQuickView(null)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      {quickView.descripcion?.substring(0, 150) ||
                        "Producto premium de alta calidad con materiales cuidadosamente seleccionados."}
                    </p>

                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl font-bold text-red-600">
                          ${Number(quickView.precio).toLocaleString()}
                        </span>
                        {quickView.precio_antes > 0 && (
                          <span className="text-gray-400 line-through text-sm">
                            ${Number(quickView.precio_antes).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (getEstadoProducto(quickView) === "Disponible") {
                            addToCart(quickView);
                            setQuickView(null);
                          }
                        }}
                        disabled={getEstadoProducto(quickView) === "Agotado"}
                        className={`flex-1 py-2.5 font-medium rounded-lg transition text-sm ${
                          getEstadoProducto(quickView) === "Disponible"
                            ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {getEstadoProducto(quickView) === "Disponible"
                          ? "Agregar al carrito"
                          : "Producto agotado"}
                      </button>
                      <button
                        onClick={() => {
                          navigate(`/productos/${quickView.id}`);
                          setQuickView(null);
                        }}
                        className="px-4 py-2.5 border border-gray-300 font-medium rounded-lg hover:border-red-600 hover:text-red-600 transition text-sm"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Productos;

// import { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import {
//   ShoppingCart,
//   Tag,
//   Filter,
//   Star,
//   Heart,
//   Eye,
//   TrendingUp,
//   ChevronDown,
//   Sparkles,
//   ChevronLeft,
//   ChevronRight,
//   MoreHorizontal,
// } from "lucide-react";
// import { useCart } from "@/context/CartContext";
// import { API_URL } from "@/config";
// import { motion, AnimatePresence } from "framer-motion";

// const Productos = () => {
//   const { addToCart } = useCart();
//   const navigate = useNavigate();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const [productos, setProductos] = useState([]);
//   const [categorias, setCategorias] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [wishlist, setWishlist] = useState([]);
//   const [sortBy, setSortBy] = useState("recomendados");
//   const [priceRange, setPriceRange] = useState([0, 500000]);
//   const [showFilters, setShowFilters] = useState(false);
//   const [quickView, setQuickView] = useState(null);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(20);
//   const [totalPages, setTotalPages] = useState(1);

//   const categoriaSlug = searchParams.get("categoria") || null;
//   const filtroOferta = searchParams.get("filtro") === "ofertas";

//   // Mapeo CORREGIDO basado en tus datos reales
//   const MAPEO_CATEGORIAS = {
//     categoria1: "Juguetes",
//     categoria2: "Lencería",
//     categoria3: "Lubricantes",
//     categoria4: "Accesorios",
//   };

//   // Cargar categorías
//   useEffect(() => {
//     fetch(`${API_URL}/api/categorias`)
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("✅ Categorías cargadas del backend:", data);
//         setCategorias(Array.isArray(data) ? data : []);
//       })
//       .catch(console.error);
//   }, []);

//   // Cargar productos
//   useEffect(() => {
//     setLoading(true);

//     let url = `${API_URL}/api/productos`;
//     const params = new URLSearchParams();

//     // Si hay categoría seleccionada
//     if (categoriaSlug) {
//       // Determinar qué nombre enviar al backend
//       let nombreParaBackend;

//       if (categoriaSlug === "categoria1") nombreParaBackend = "Juguetes";
//       else if (categoriaSlug === "categoria2") nombreParaBackend = "Lencería";
//       else if (categoriaSlug === "categoria3")
//         nombreParaBackend = "Lubricantes";
//       else if (categoriaSlug === "categoria4") nombreParaBackend = "Accesorios";
//       else nombreParaBackend = categoriaSlug;

//       params.append("categoria", nombreParaBackend);
//       console.log(`🎯 Filtro backend: categoria=${nombreParaBackend}`);
//     }

//     if (filtroOferta) {
//       params.append("es_oferta", "true");
//     }

//     if (params.toString()) {
//       url += `?${params.toString()}`;
//     }

//     console.log("📡 Fetching:", url);

//     fetch(url)
//       .then((res) => res.json())
//       .then((data) => {
//         console.log(`✅ ${data.length} productos recibidos`);
//         setProductos(Array.isArray(data) ? data : []);
//         setTotalPages(Math.ceil(data.length / itemsPerPage));
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//         setProductos([]);
//         setLoading(false);
//       });
//   }, [categoriaSlug, filtroOferta]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [categoriaSlug, filtroOferta, sortBy, priceRange]);

//   // Funciones auxiliares
//   const getNombreCategoria = (slug) => {
//     return MAPEO_CATEGORIAS[slug] || "Categoría";
//   };

//   const getCategoriaActualNombre = () => {
//     if (!categoriaSlug) return "Todos los productos";
//     return getNombreCategoria(categoriaSlug);
//   };

//   const cambiarCategoria = (slug) => {
//     const params = new URLSearchParams(searchParams);

//     if (!slug || slug === "todas") {
//       params.delete("categoria");
//     } else {
//       params.set("categoria", slug);
//     }

//     if (filtroOferta) {
//       params.set("filtro", "ofertas");
//     }

//     setSearchParams(params);
//   };

//   const toggleOferta = () => {
//     const params = new URLSearchParams(searchParams);

//     if (filtroOferta) {
//       params.delete("filtro");
//     } else {
//       params.set("filtro", "ofertas");
//     }

//     if (categoriaSlug) {
//       params.set("categoria", categoriaSlug);
//     }

//     setSearchParams(params);
//   };

//   const toggleWishlist = (id) => {
//     setWishlist((prev) =>
//       prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
//     );
//   };

//   const getImageSrc = (imagen) => {
//     if (!imagen) return "/imagenes/no-image.png";
//     if (imagen.startsWith("http://") || imagen.startsWith("https://")) {
//       return imagen.replace("http://", "https://");
//     }
//     if (imagen.startsWith("/imagenes/")) return imagen;
//     return `${API_URL}/images/${imagen}`;
//   };

//   // Ordenamiento y filtrado
//   const sortedProductos = () => {
//     let sorted = [...productos];

//     // Primero filtrar por precio
//     sorted = sorted.filter(
//       (p) => p.precio >= priceRange[0] && p.precio <= priceRange[1],
//     );

//     // Luego ordenar
//     switch (sortBy) {
//       case "precio-asc":
//         return sorted.sort((a, b) => (a.precio || 0) - (b.precio || 0));
//       case "precio-desc":
//         return sorted.sort((a, b) => (b.precio || 0) - (a.precio || 0));
//       case "nuevos":
//         return sorted.sort(
//           (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
//         );
//       default:
//         return sorted;
//     }
//   };

//   const filteredProductos = sortedProductos();
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentProductos = filteredProductos.slice(
//     indexOfFirstItem,
//     Math.min(indexOfLastItem, filteredProductos.length),
//   );

//   const paginate = (pageNumber) => {
//     if (pageNumber < 1 || pageNumber > totalPages) return;
//     setCurrentPage(pageNumber);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxVisiblePages = 5;

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) {
//         pageNumbers.push(i);
//       }
//     } else {
//       if (currentPage <= 3) {
//         for (let i = 1; i <= 5; i++) {
//           pageNumbers.push(i);
//         }
//         pageNumbers.push("...");
//         pageNumbers.push(totalPages);
//       } else if (currentPage >= totalPages - 2) {
//         pageNumbers.push(1);
//         pageNumbers.push("...");
//         for (let i = totalPages - 4; i <= totalPages; i++) {
//           pageNumbers.push(i);
//         }
//       } else {
//         pageNumbers.push(1);
//         pageNumbers.push("...");
//         for (let i = currentPage - 1; i <= currentPage + 1; i++) {
//           pageNumbers.push(i);
//         }
//         pageNumbers.push("...");
//         pageNumbers.push(totalPages);
//       }
//     }

//     return pageNumbers;
//   };

//   const LoadingSkeleton = () => (
//     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
//       {[...Array(8)].map((_, i) => (
//         <div key={i} className="animate-pulse">
//           <div className="bg-gray-200 rounded-xl h-36 md:h-40 mb-3" />
//           <div className="h-3 bg-gray-200 rounded mb-2" />
//           <div className="h-3 bg-gray-200 rounded w-2/3" />
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <section className="min-h-screen bg-linear-to-b from-white to-gray-50 py-12">
//       <div className="max-w-7xl mx-auto px-4 mb-8">
//         <div className="text-center mb-6 pt-15">
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
//           >
//             {getCategoriaActualNombre()}
//             <span className="text-red-600">.</span>
//           </motion.h1>
//           <p className="text-gray-600 text-sm max-w-2xl mx-auto">
//             {categoriaSlug
//               ? `${filteredProductos.length} productos encontrados`
//               : "Productos premium seleccionados para momentos íntimos y especiales"}
//           </p>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
//           {[
//             { label: "Productos", value: filteredProductos.length, icon: "✨" },
//             { label: "Categorías", value: categorias.length, icon: "🏷️" },
//             {
//               label: "En oferta",
//               value: productos.filter((p) => p.es_oferta).length,
//               icon: "🔥",
//             },
//             {
//               label: "Stock",
//               value: productos.reduce((sum, p) => sum + (p.stock || 0), 0),
//               icon: "📦",
//             },
//           ].map((stat, idx) => (
//             <div
//               key={idx}
//               className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm"
//             >
//               <div className="text-xl mb-1">{stat.icon}</div>
//               <div className="text-base font-bold text-gray-900">
//                 {typeof stat.value === "number"
//                   ? stat.value.toLocaleString()
//                   : stat.value}
//               </div>
//               <div className="text-xs text-gray-600">{stat.label}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4">
//         <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//           <div className="w-full md:w-auto">
//             <div className="flex overflow-x-auto pb-2 md:pb-0 md:flex-wrap gap-2 scrollbar-hide">
//               <button
//                 onClick={() => cambiarCategoria("todas")}
//                 className={`px-4 py-2 rounded-full font-medium border transition-all duration-300 flex items-center gap-1 text-sm whitespace-nowrap flex-shrink-0
//                   ${
//                     !categoriaSlug
//                       ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
//                       : "bg-white text-gray-700 border-gray-300 hover:border-red-600 hover:text-red-600"
//                   }`}
//               >
//                 <Sparkles size={14} />
//                 Todas
//               </button>

//               {categorias.map((cat) => (
//                 <button
//                   key={cat.id}
//                   onClick={() => cambiarCategoria(cat.slug)}
//                   className={`px-4 py-2 rounded-full font-medium border transition-all duration-300 text-sm whitespace-nowrap flex-shrink-0
//                     ${
//                       categoriaSlug === cat.slug
//                         ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
//                         : "bg-white text-gray-700 border-gray-300 hover:border-red-600 hover:text-red-600"
//                     }`}
//                 >
//                   {MAPEO_CATEGORIAS[cat.slug] || cat.nombre}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="w-full md:w-auto">
//             <div className="flex flex-wrap gap-2 justify-center md:justify-end">
//               <div className="relative flex-shrink-0">
//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value)}
//                   className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-full md:w-auto"
//                 >
//                   <option value="recomendados">Recomendados</option>
//                   <option value="nuevos">Más nuevos</option>
//                   <option value="precio-asc">Precio: menor</option>
//                   <option value="precio-desc">Precio: mayor</option>
//                 </select>
//                 <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
//               </div>

//               <button
//                 onClick={toggleOferta}
//                 className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-300 text-sm whitespace-nowrap flex-shrink-0
//                   ${
//                     filtroOferta
//                       ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
//                       : "bg-white text-gray-700 border border-gray-300 hover:border-red-600 hover:text-red-600"
//                   }`}
//               >
//                 <Tag size={14} />
//                 <span className="hidden sm:inline">Ofertas</span>
//                 <span className="sm:hidden">Ofertas</span>
//               </button>

//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:border-red-600 hover:text-red-600 transition text-sm whitespace-nowrap flex-shrink-0"
//               >
//                 <Filter size={14} />
//                 <span className="hidden sm:inline">Filtros</span>
//                 <span className="sm:hidden">Filtros</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         <AnimatePresence>
//           {showFilters && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               className="bg-white rounded-xl border border-gray-200 p-4 mb-6 overflow-hidden"
//             >
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
//                     <TrendingUp size={16} />
//                     Rango de precio
//                   </h3>
//                   <div className="px-3">
//                     <input
//                       type="range"
//                       min="0"
//                       max="500000"
//                       step="10000"
//                       value={priceRange[1]}
//                       onChange={(e) =>
//                         setPriceRange([priceRange[0], parseInt(e.target.value)])
//                       }
//                       className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                     />
//                     <div className="flex justify-between text-xs text-gray-600 mt-2">
//                       <span>${priceRange[0].toLocaleString()}</span>
//                       <span>${priceRange[1].toLocaleString()}</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-3 text-sm">
//                     Características
//                   </h3>
//                   <div className="space-y-2">
//                     {[
//                       "Envío gratis",
//                       "Nuevo",
//                       "Más vendido",
//                       "Edición limitada",
//                     ].map((feature) => (
//                       <label
//                         key={feature}
//                         className="flex items-center gap-2 cursor-pointer text-sm"
//                       >
//                         <input
//                           type="checkbox"
//                           className="rounded text-red-600 focus:ring-red-500"
//                         />
//                         <span className="text-gray-700">{feature}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {!loading && filteredProductos.length > 0 && (
//           <div className="mb-4 text-sm text-gray-600">
//             Mostrando {indexOfFirstItem + 1}-
//             {Math.min(indexOfLastItem, filteredProductos.length)} de{" "}
//             {filteredProductos.length} productos
//           </div>
//         )}

//         {loading ? (
//           <LoadingSkeleton />
//         ) : (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
//             {currentProductos.map((producto) => {
//               const precio = Number(producto.precio || 0);
//               const precioAntes = Number(producto.precio_antes || 0);
//               const esOferta = Boolean(producto.es_oferta);
//               const imagenUrl = getImageSrc(producto.imagen);
//               const isWishlisted = wishlist.includes(producto.id);

//               return (
//                 <motion.div
//                   key={producto.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-red-200 transition-all duration-300 hover:shadow-lg"
//                 >
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       toggleWishlist(producto.id);
//                     }}
//                     className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:scale-110 transition-transform"
//                   >
//                     <Heart
//                       size={16}
//                       className={
//                         isWishlisted
//                           ? "fill-red-600 text-red-600"
//                           : "text-gray-400"
//                       }
//                     />
//                   </button>

//                   <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
//                     {esOferta && precioAntes > 0 && (
//                       <span className="px-2 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full shadow-md">
//                         -{Math.round((1 - precio / precioAntes) * 100)}%
//                       </span>
//                     )}
//                     {producto.stock < 10 && producto.stock > 0 && (
//                       <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
//                         Últimas
//                       </span>
//                     )}
//                   </div>

//                   <div
//                     onClick={() => navigate(`/productos/${producto.id}`)}
//                     className="relative h-36 md:h-40 bg-gradient-to-br from-gray-50 to-white overflow-hidden cursor-pointer"
//                   >
//                     <img
//                       src={imagenUrl}
//                       alt={producto.nombre}
//                       className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
//                       onError={(e) => (e.target.src = "/imagenes/no-image.png")}
//                     />

//                     <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-70 sm:opacity-0 sm:group-hover:opacity-70 transition-opacity duration-300">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setQuickView(producto);
//                         }}
//                         className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full font-medium flex items-center gap-1 hover:scale-105 transition-transform text-xs"
//                       >
//                         <Eye size={12} />
//                         Vista rápida
//                       </button>
//                     </div>
//                   </div>

//                   <div className="p-2.5 md:p-3">
//                     <h3
//                       onClick={() => navigate(`/productos/${producto.id}`)}
//                       className="font-semibold text-gray-900 mb-2 line-clamp-2 h-10 text-sm cursor-pointer hover:text-red-600 transition"
//                     >
//                       {producto.nombre}
//                     </h3>

//                     <div className="flex items-center justify-between mb-2">
//                       <div>
//                         {esOferta && precioAntes > 0 && (
//                           <p className="text-gray-400 text-xs line-through">
//                             ${precioAntes.toLocaleString()}
//                           </p>
//                         )}
//                         <p className="text-base md:text-lg font-bold text-red-600">
//                           ${precio.toLocaleString()}
//                         </p>
//                       </div>
//                       <span className="text-xs text-gray-500">
//                         {producto.stock} unid.
//                       </span>
//                     </div>

//                     <div className="flex gap-1.5">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           addToCart(producto);
//                         }}
//                         className="flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all shadow-md text-xs md:text-sm px-1 md:px-2"
//                       >
//                         <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
//                         <span className="truncate">Agregar</span>
//                       </button>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           navigate(`/productos/${producto.id}`);
//                         }}
//                         className="px-2 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 transition text-xs"
//                       >
//                         Ver
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </div>
//         )}

//         {!loading && filteredProductos.length === 0 && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="text-center py-12"
//           >
//             <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Filter className="w-8 h-8 text-red-400" />
//             </div>
//             <h3 className="text-lg font-bold text-gray-900 mb-2">
//               {categoriaSlug
//                 ? `No hay productos en "${getCategoriaActualNombre()}"`
//                 : "No encontramos productos"}
//             </h3>
//             <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
//               {categoriaSlug
//                 ? "Prueba con otra categoría o ajusta los filtros de precio"
//                 : "Intenta con otros filtros o vuelve más tarde"}
//             </p>
//             <div className="flex gap-3 justify-center">
//               <button
//                 onClick={() => cambiarCategoria("todas")}
//                 className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:shadow-lg transition text-sm"
//               >
//                 Ver todos los productos
//               </button>
//               {categoriaSlug && (
//                 <button
//                   onClick={() => setPriceRange([0, 500000])}
//                   className="px-6 py-2.5 border border-gray-300 font-medium rounded-lg hover:border-red-600 hover:text-red-600 transition text-sm"
//                 >
//                   Limpiar filtros de precio
//                 </button>
//               )}
//             </div>
//           </motion.div>
//         )}

//         {filteredProductos.length > itemsPerPage && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mt-12 flex flex-col items-center gap-4"
//           >
//             <div className="text-sm text-gray-600">
//               Página {currentPage} de {totalPages} • {filteredProductos.length}{" "}
//               productos
//             </div>

//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => paginate(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className={`flex items-center justify-center w-10 h-10 rounded-md font-medium transition text-sm
//                   ${
//                     currentPage === 1
//                       ? "text-gray-400 cursor-not-allowed border border-gray-200"
//                       : "border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 hover:shadow-sm"
//                   }`}
//               >
//                 <ChevronLeft size={16} />
//               </button>

//               {getPageNumbers().map((pageNumber, index) =>
//                 pageNumber === "..." ? (
//                   <span
//                     key={`dots-${index}`}
//                     className="w-10 h-10 flex items-center justify-center text-gray-400"
//                   >
//                     <MoreHorizontal size={16} />
//                   </span>
//                 ) : (
//                   <button
//                     key={pageNumber}
//                     onClick={() => paginate(pageNumber)}
//                     className={`w-10 h-10 rounded-md font-medium transition text-sm
//                       ${
//                         currentPage === pageNumber
//                           ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md"
//                           : "border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 hover:shadow-sm"
//                       }`}
//                   >
//                     {pageNumber}
//                   </button>
//                 ),
//               )}

//               <button
//                 onClick={() => paginate(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className={`flex items-center justify-center w-10 h-10 rounded-md font-medium transition text-sm
//                   ${
//                     currentPage === totalPages
//                       ? "text-gray-400 cursor-not-allowed border border-gray-200"
//                       : "border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 hover:shadow-sm"
//                   }`}
//               >
//                 <ChevronRight size={16} />
//               </button>
//             </div>

//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <span>Mostrar:</span>
//               <select
//                 value={itemsPerPage}
//                 onChange={(e) => {
//                   setItemsPerPage(Number(e.target.value));
//                   setCurrentPage(1);
//                 }}
//                 className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
//               >
//                 <option value={12}>12 productos</option>
//                 <option value={20}>20 productos</option>
//                 <option value={32}>32 productos</option>
//                 <option value={48}>48 productos</option>
//               </select>
//             </div>
//           </motion.div>
//         )}

//         <AnimatePresence>
//           {quickView && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
//               onClick={() => setQuickView(null)}
//             >
//               <motion.div
//                 initial={{ scale: 0.9, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 exit={{ scale: 0.9, opacity: 0 }}
//                 onClick={(e) => e.stopPropagation()}
//                 className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
//               >
//                 <div className="grid md:grid-cols-2">
//                   <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
//                     <img
//                       src={getImageSrc(quickView.imagen)}
//                       alt={quickView.nombre}
//                       className="w-full h-48 object-contain"
//                     />
//                   </div>
//                   <div className="p-6">
//                     <div className="flex justify-between items-start mb-4">
//                       <div>
//                         <h2 className="text-lg font-bold text-gray-900 mb-1">
//                           {quickView.nombre}
//                         </h2>
//                         <div className="flex items-center gap-3">
//                           <div className="flex items-center gap-1">
//                             <Star
//                               size={12}
//                               className="fill-amber-400 text-amber-400"
//                             />
//                             <span className="font-medium text-sm">4.8</span>
//                           </div>
//                           <span className="text-green-600 font-medium text-sm">
//                             En stock
//                           </span>
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => setQuickView(null)}
//                         className="p-1 hover:bg-gray-100 rounded-full"
//                       >
//                         ✕
//                       </button>
//                     </div>

//                     <p className="text-gray-600 text-sm mb-4">
//                       {quickView.descripcion?.substring(0, 150) ||
//                         "Producto premium de alta calidad con materiales cuidadosamente seleccionados."}
//                     </p>

//                     <div className="mb-4">
//                       <div className="flex items-center gap-3 mb-3">
//                         <span className="text-xl font-bold text-red-600">
//                           ${Number(quickView.precio).toLocaleString()}
//                         </span>
//                         {quickView.precio_antes > 0 && (
//                           <span className="text-gray-400 line-through text-sm">
//                             ${Number(quickView.precio_antes).toLocaleString()}
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex gap-3">
//                       <button
//                         onClick={() => {
//                           addToCart(quickView);
//                           setQuickView(null);
//                         }}
//                         className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:shadow-lg transition text-sm"
//                       >
//                         Agregar al carrito
//                       </button>
//                       <button
//                         onClick={() => {
//                           navigate(`/productos/${quickView.id}`);
//                           setQuickView(null);
//                         }}
//                         className="px-4 py-2.5 border border-gray-300 font-medium rounded-lg hover:border-red-600 hover:text-red-600 transition text-sm"
//                       >
//                         Ver detalles
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </section>
//   );
// };

// export default Productos;

// import { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import {
//   ShoppingCart,
//   Tag,
//   Filter,
//   Star,
//   Heart,
//   Eye,
//   TrendingUp,
//   ChevronDown,
//   Sparkles,
//   ChevronLeft,
//   ChevronRight,
//   MoreHorizontal,
// } from "lucide-react";
// import { useCart } from "@/context/CartContext";
// import { API_URL } from "@/config";
// import { motion, AnimatePresence } from "framer-motion";

// const Productos = () => {
//   const { addToCart } = useCart();
//   const navigate = useNavigate();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const [productos, setProductos] = useState([]);
//   const [categorias, setCategorias] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [wishlist, setWishlist] = useState([]);
//   const [sortBy, setSortBy] = useState("recomendados");
//   const [priceRange, setPriceRange] = useState([0, 500000]);
//   const [showFilters, setShowFilters] = useState(false);
//   const [quickView, setQuickView] = useState(null);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(20);
//   const [totalPages, setTotalPages] = useState(1);

//   const categoriaSlug = searchParams.get("categoria") || null;
//   const filtroOferta = searchParams.get("filtro") === "ofertas";

//   // Mapeo CORREGIDO basado en tus datos reales
//   const MAPEO_CATEGORIAS = {
//     // Slug -> Nombre para mostrar
//     categoria1: "Juguetes",
//     categoria2: "Lencería",
//     categoria3: "Lubricantes",
//     categoria4: "Accesorios",

//     // Slug -> Nombre para backend (puede ser diferente)
//     backend_categoria1: "Juguetes",
//     backend_categoria2: "Lencería",
//     backend_categoria3: "Lubricantes",
//     backend_categoria4: "Accesorios",
//   };

//   // Cargar categorías
//   useEffect(() => {
//     fetch(`${API_URL}/api/categorias`)
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("✅ Categorías cargadas del backend:", data);
//         setCategorias(Array.isArray(data) ? data : []);
//       })
//       .catch(console.error);
//   }, []);

//   // Cargar productos
//   useEffect(() => {
//     setLoading(true);

//     let url = `${API_URL}/api/productos`;
//     const params = new URLSearchParams();

//     // Si hay categoría seleccionada
//     if (categoriaSlug) {
//       // Determinar qué nombre enviar al backend
//       let nombreParaBackend;

//       if (categoriaSlug === "categoria1") nombreParaBackend = "Juguetes";
//       else if (categoriaSlug === "categoria2") nombreParaBackend = "Lencería";
//       else if (categoriaSlug === "categoria3")
//         nombreParaBackend = "Lubricantes";
//       else if (categoriaSlug === "categoria4") nombreParaBackend = "Accesorios";
//       else nombreParaBackend = categoriaSlug;

//       params.append("categoria", nombreParaBackend);
//       console.log(`🎯 Filtro backend: categoria=${nombreParaBackend}`);
//     }

//     if (filtroOferta) {
//       params.append("es_oferta", "true");
//     }

//     if (params.toString()) {
//       url += `?${params.toString()}`;
//     }

//     console.log("📡 Fetching:", url);

//     fetch(url)
//       .then((res) => res.json())
//       .then((data) => {
//         console.log(`✅ ${data.length} productos recibidos`);
//         setProductos(Array.isArray(data) ? data : []);
//         setTotalPages(Math.ceil(data.length / itemsPerPage));
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//         setProductos([]);
//         setLoading(false);
//       });
//   }, [categoriaSlug, filtroOferta]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [categoriaSlug, filtroOferta, sortBy, priceRange]);

//   // Funciones auxiliares
//   const getNombreCategoria = (slug) => {
//     return MAPEO_CATEGORIAS[slug] || "Categoría";
//   };

//   const getCategoriaActualNombre = () => {
//     if (!categoriaSlug) return "Todos los productos";
//     return getNombreCategoria(categoriaSlug);
//   };

//   const cambiarCategoria = (slug) => {
//     const params = new URLSearchParams(searchParams);

//     if (!slug || slug === "todas") {
//       params.delete("categoria");
//     } else {
//       params.set("categoria", slug);
//     }

//     if (filtroOferta) {
//       params.set("filtro", "ofertas");
//     }

//     setSearchParams(params);
//   };

//   const toggleOferta = () => {
//     const params = new URLSearchParams(searchParams);

//     if (filtroOferta) {
//       params.delete("filtro");
//     } else {
//       params.set("filtro", "ofertas");
//     }

//     if (categoriaSlug) {
//       params.set("categoria", categoriaSlug);
//     }

//     setSearchParams(params);
//   };

//   const getImageSrc = (imagen) => {
//     if (!imagen) return "/imagenes/no-image.png";
//     if (imagen.startsWith("http")) {
//       return imagen.replace("http://", "https://");
//     }
//     return `${API_URL}/images/${imagen}`;
//   };

//   // Ordenamiento y filtrado
//   const sortedProductos = () => {
//     let sorted = [...productos].filter(
//       (p) => p.precio >= priceRange[0] && p.precio <= priceRange[1],
//     );

//     switch (sortBy) {
//       case "precio-asc":
//         return sorted.sort((a, b) => a.precio - b.precio);
//       case "precio-desc":
//         return sorted.sort((a, b) => b.precio - a.precio);
//       case "nuevos":
//         return sorted.sort(
//           (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
//         );
//       default:
//         return sorted;
//     }
//   };

//   const filteredProductos = sortedProductos();
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentProductos = filteredProductos.slice(
//     indexOfFirstItem,
//     indexOfLastItem,
//   );

//   // Renderizado
//   return (
//     <section className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
//       <div className="max-w-7xl mx-auto px-4">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
//             {getCategoriaActualNombre()}
//             <span className="text-red-600">.</span>
//           </h1>
//           <p className="text-gray-600">
//             {filteredProductos.length} productos encontrados
//           </p>
//         </div>

//         {/* Controles */}
//         <div className="flex flex-col md:flex-row gap-4 mb-6">
//           {/* Categorías */}
//           <div className="flex-1">
//             <div className="flex flex-wrap gap-2">
//               <button
//                 onClick={() => cambiarCategoria("todas")}
//                 className={`px-4 py-2 rounded-full border ${
//                   !categoriaSlug
//                     ? "bg-red-600 text-white border-red-600"
//                     : "bg-white border-gray-300 hover:border-red-600"
//                 }`}
//               >
//                 Todas
//               </button>

//               {categorias.map((cat) => (
//                 <button
//                   key={cat.id}
//                   onClick={() => cambiarCategoria(cat.slug)}
//                   className={`px-4 py-2 rounded-full border ${
//                     categoriaSlug === cat.slug
//                       ? "bg-red-600 text-white border-red-600"
//                       : "bg-white border-gray-300 hover:border-red-600"
//                   }`}
//                 >
//                   {getNombreCategoria(cat.slug)}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Filtros derecho */}
//           <div className="flex gap-2">
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="border rounded-lg px-3 py-2"
//             >
//               <option value="recomendados">Recomendados</option>
//               <option value="nuevos">Nuevos</option>
//               <option value="precio-asc">Precio: menor</option>
//               <option value="precio-desc">Precio: mayor</option>
//             </select>

//             <button
//               onClick={toggleOferta}
//               className={`px-4 py-2 rounded-lg border ${
//                 filtroOferta
//                   ? "bg-red-600 text-white border-red-600"
//                   : "bg-white border-gray-300 hover:border-red-600"
//               }`}
//             >
//               Ofertas
//             </button>
//           </div>
//         </div>

//         {/* Productos */}
//         {loading ? (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {[...Array(8)].map((_, i) => (
//               <div key={i} className="animate-pulse">
//                 <div className="bg-gray-200 rounded-lg h-48 mb-2"></div>
//                 <div className="h-4 bg-gray-200 rounded mb-2"></div>
//                 <div className="h-4 bg-gray-200 rounded w-2/3"></div>
//               </div>
//             ))}
//           </div>
//         ) : filteredProductos.length > 0 ? (
//           <>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//               {currentProductos.map((producto) => (
//                 <div
//                   key={producto.id}
//                   className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
//                 >
//                   {/* Imagen */}
//                   <div
//                     className="h-48 bg-gray-100 relative cursor-pointer"
//                     onClick={() => navigate(`/productos/${producto.id}`)}
//                   >
//                     <img
//                       src={getImageSrc(producto.imagen)}
//                       alt={producto.nombre}
//                       className="w-full h-full object-contain p-4"
//                       onError={(e) => (e.target.src = "/imagenes/no-image.png")}
//                     />
//                     {producto.es_oferta && (
//                       <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs">
//                         Oferta
//                       </div>
//                     )}
//                   </div>

//                   {/* Info */}
//                   <div className="p-4">
//                     <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
//                       {producto.nombre}
//                     </h3>

//                     <div className="flex justify-between items-center mb-3">
//                       <div>
//                         <p className="text-lg font-bold text-red-600">
//                           ${Number(producto.precio).toLocaleString()}
//                         </p>
//                         {producto.precio_antes && (
//                           <p className="text-sm text-gray-400 line-through">
//                             ${Number(producto.precio_antes).toLocaleString()}
//                           </p>
//                         )}
//                       </div>
//                       <span className="text-sm text-gray-500">
//                         {producto.stock || 0} unid.
//                       </span>
//                     </div>

//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => addToCart(producto)}
//                         className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
//                       >
//                         Agregar
//                       </button>
//                       <button
//                         onClick={() => navigate(`/productos/${producto.id}`)}
//                         className="px-4 py-2 border border-gray-300 rounded-lg hover:border-red-600"
//                       >
//                         Ver
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Paginación */}
//             {filteredProductos.length > itemsPerPage && (
//               <div className="mt-8 flex justify-center">
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                     disabled={currentPage === 1}
//                     className="px-4 py-2 border rounded disabled:opacity-50"
//                   >
//                     Anterior
//                   </button>

//                   {[...Array(totalPages)].map((_, i) => (
//                     <button
//                       key={i}
//                       onClick={() => setCurrentPage(i + 1)}
//                       className={`px-4 py-2 border rounded ${
//                         currentPage === i + 1
//                           ? "bg-red-600 text-white border-red-600"
//                           : "border-gray-300"
//                       }`}
//                     >
//                       {i + 1}
//                     </button>
//                   ))}

//                   <button
//                     onClick={() =>
//                       setCurrentPage((p) => Math.min(totalPages, p + 1))
//                     }
//                     disabled={currentPage === totalPages}
//                     className="px-4 py-2 border rounded disabled:opacity-50"
//                   >
//                     Siguiente
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         ) : (
//           <div className="text-center py-12">
//             <p className="text-gray-600">No hay productos en esta categoría</p>
//             <button
//               onClick={() => cambiarCategoria("todas")}
//               className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg"
//             >
//               Ver todos los productos
//             </button>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default Productos;
