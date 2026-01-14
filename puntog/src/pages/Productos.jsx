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

  const categoriaActual = searchParams.get("categoria") || "todas";
  const filtroOferta = searchParams.get("filtro") === "ofertas";

  // 🔥 FUNCIÓN MEJORADA PARA OBTENER IMÁGENES
  const getImageSrc = (imagen) => {
    if (!imagen) return "/imagenes/no-image.png";
    if (imagen.startsWith("http://") || imagen.startsWith("https://")) {
      return imagen.replace("http://", "https://");
    }
    if (imagen.startsWith("/imagenes/")) return imagen;
    return `${API_URL}/images/${imagen}`;
  };

  useEffect(() => {
    fetch(`${API_URL}/api/categorias`)
      .then((res) => res.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = `${API_URL}/api/productos?`;
    if (categoriaActual !== "todas") url += `categoria=${categoriaActual}&`;
    if (filtroOferta) url += `es_oferta=true&`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProductos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProductos([]);
        setLoading(false);
      });
  }, [categoriaActual, filtroOferta]);

  const cambiarCategoria = (slug) => {
    const params = new URLSearchParams(searchParams);
    slug === "todas"
      ? params.delete("categoria")
      : params.set("categoria", slug);
    setSearchParams(params);
  };

  const toggleOferta = () => {
    const params = new URLSearchParams(searchParams);
    filtroOferta ? params.delete("filtro") : params.set("filtro", "ofertas");
    setSearchParams(params);
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const sortedProductos = () => {
    let sorted = [...productos];
    switch (sortBy) {
      case "precio-asc":
        return sorted.sort((a, b) => a.precio - b.precio);
      case "precio-desc":
        return sorted.sort((a, b) => b.precio - a.precio);
      case "nuevos":
        return sorted.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      default:
        return sorted;
    }
  };

  const filteredProductos = sortedProductos().filter(
    (p) => p.precio >= priceRange[0] && p.precio <= priceRange[1]
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-xl h-48 mb-3" />
          <div className="h-3 bg-gray-200 rounded mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  );

  return (
    <section className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      {/* HERO SECTION - Más compacto */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="text-center mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          >
            Descubre la <span className="text-red-600">elegancia</span> sensual
          </motion.h1>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            Productos premium seleccionados para momentos íntimos y especiales
          </p>
        </div>

        {/* STATS - Más compacto */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Productos", value: productos.length, icon: "✨" },
            { label: "Categorías", value: categorias.length, icon: "🏷️" },
            { label: "Clientes", value: "10K+", icon: "❤️" },
            { label: "Envíos", value: "50+", icon: "🚚" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm"
            >
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-base font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4">
        {/* FILTERS BAR - Más compacto */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => cambiarCategoria("todas")}
              className={`px-4 py-2 rounded-full font-medium border transition-all duration-300 flex items-center gap-1 text-sm
                ${
                  categoriaActual === "todas"
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
                className={`px-4 py-2 rounded-full font-medium border transition-all duration-300 text-sm
                  ${
                    categoriaActual === cat.slug
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
                      : "bg-white text-gray-700 border-gray-300 hover:border-red-600 hover:text-red-600"
                  }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-3 md:mt-0">
            {/* SORT */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              >
                <option value="recomendados">Recomendados</option>
                <option value="nuevos">Más nuevos</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
            </div>

            {/* OFFERS FILTER */}
            <button
              onClick={toggleOferta}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm
                ${
                  filtroOferta
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-red-600 hover:text-red-600"
                }`}
            >
              <Tag size={14} />
              {filtroOferta ? "Ofertas" : "Ofertas"}
            </button>

            {/* FILTERS TOGGLE */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:border-red-600 hover:text-red-600 transition text-sm"
            >
              <Filter size={14} />
              Filtros
            </button>
          </div>
        </div>

        {/* FILTERS PANEL - Más compacto */}
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

        {/* PRODUCTS GRID - Tarjetas más compactas */}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProductos.map((producto) => {
              const precio = Number(producto.precio || 0);
              const precioAntes = Number(producto.precio_antes || 0);
              const esOferta = Number(producto.es_oferta) === 1;
              const imagenUrl = getImageSrc(producto.imagen);
              const isWishlisted = wishlist.includes(producto.id);

              return (
                <motion.div
                  key={producto.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-red-200 transition-all duration-300 hover:shadow-lg"
                >
                  {/* WISHLIST BUTTON */}
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

                  {/* BADGES */}
                  <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                    {esOferta && (
                      <span className="px-2 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full shadow-md">
                        -{Math.round((1 - precio / precioAntes) * 100)}%
                      </span>
                    )}
                    {producto.stock < 10 && producto.stock > 0 && (
                      <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                        Últimas
                      </span>
                    )}
                  </div>

                  {/* PRODUCT IMAGE */}
                  <div
                    onClick={() => navigate(`/productos/${producto.id}`)}
                    className="relative h-40 bg-gradient-to-br from-gray-50 to-white overflow-hidden cursor-pointer"
                  >
                    <img
                      src={imagenUrl}
                      alt={producto.nombre}
                      className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => (e.target.src = "/imagenes/no-image.png")}
                    />

                    {/* QUICK VIEW OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickView(producto);
                        }}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full font-medium flex items-center gap-1 hover:scale-105 transition-transform text-xs"
                      >
                        <Eye size={12} />
                        Vista rápida
                      </button>
                    </div>
                  </div>

                  {/* PRODUCT INFO */}
                  <div className="p-3">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className="fill-amber-400 text-amber-400"
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">4.8</span>
                    </div>

                    <h3
                      onClick={() => navigate(`/productos/${producto.id}`)}
                      className="font-semibold text-gray-900 mb-1 line-clamp-1 cursor-pointer hover:text-red-600 transition text-sm"
                    >
                      {producto.nombre}
                    </h3>

                    <p className="text-gray-600 text-xs mb-2 line-clamp-2 h-8">
                      {producto.descripcion?.substring(0, 60) ||
                        "Producto premium de alta calidad"}
                    </p>

                    {/* PRICE */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        {esOferta && precioAntes > 0 && (
                          <p className="text-gray-400 text-xs line-through">
                            ${precioAntes.toLocaleString()}
                          </p>
                        )}
                        <p className="text-base font-bold text-red-600">
                          ${precio.toLocaleString()}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {producto.stock || 10} unid.
                      </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(producto);
                        }}
                        className="flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-1 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all shadow-md text-xs"
                      >
                        <ShoppingCart size={12} />
                        Agregar
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

        {/* NO PRODUCTS - Más compacto */}
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
              No encontramos productos
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
              Intenta con otros filtros o vuelve más tarde
            </p>
            <button
              onClick={() => {
                cambiarCategoria("todas");
                setPriceRange([0, 500000]);
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:shadow-lg transition text-sm"
            >
              Ver todos los productos
            </button>
          </motion.div>
        )}

        {/* QUICK VIEW MODAL - Más compacto */}
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
                            <span className="text-gray-500 text-xs">
                              (128 reseñas)
                            </span>
                          </div>
                          <span className="text-green-600 font-medium text-sm">
                            En stock
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
                          addToCart(quickView);
                          setQuickView(null);
                        }}
                        className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:shadow-lg transition text-sm"
                      >
                        Agregar al carrito
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

        {/* PAGINATION - Más compacto */}
        {filteredProductos.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`w-8 h-8 rounded-md font-medium transition text-sm
                    ${
                      page === 1
                        ? "bg-red-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
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

//   const categoriaActual = searchParams.get("categoria") || "todas";
//   const filtroOferta = searchParams.get("filtro") === "ofertas";

//   // 🔥 FUNCIÓN MEJORADA PARA OBTENER IMÁGENES
//   const getImageSrc = (imagen) => {
//     if (!imagen) return "/imagenes/no-image.png";
//     if (imagen.startsWith("http://") || imagen.startsWith("https://")) {
//       return imagen.replace("http://", "https://");
//     }
//     if (imagen.startsWith("/imagenes/")) return imagen;
//     return `${API_URL}/images/${imagen}`;
//   };

//   useEffect(() => {
//     fetch(`${API_URL}/api/categorias`)
//       .then((res) => res.json())
//       .then((data) => setCategorias(Array.isArray(data) ? data : []))
//       .catch(() => setCategorias([]));
//   }, []);

//   useEffect(() => {
//     setLoading(true);
//     let url = `${API_URL}/api/productos?`;
//     if (categoriaActual !== "todas") url += `categoria=${categoriaActual}&`;
//     if (filtroOferta) url += `es_oferta=true&`;

//     fetch(url)
//       .then((res) => res.json())
//       .then((data) => {
//         setProductos(Array.isArray(data) ? data : []);
//         setLoading(false);
//       })
//       .catch(() => {
//         setProductos([]);
//         setLoading(false);
//       });
//   }, [categoriaActual, filtroOferta]);

//   const cambiarCategoria = (slug) => {
//     const params = new URLSearchParams(searchParams);
//     slug === "todas"
//       ? params.delete("categoria")
//       : params.set("categoria", slug);
//     setSearchParams(params);
//   };

//   const toggleOferta = () => {
//     const params = new URLSearchParams(searchParams);
//     filtroOferta ? params.delete("filtro") : params.set("filtro", "ofertas");
//     setSearchParams(params);
//   };

//   const toggleWishlist = (id) => {
//     setWishlist((prev) =>
//       prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
//     );
//   };

//   const sortedProductos = () => {
//     let sorted = [...productos];
//     switch (sortBy) {
//       case "precio-asc":
//         return sorted.sort((a, b) => a.precio - b.precio);
//       case "precio-desc":
//         return sorted.sort((a, b) => b.precio - a.precio);
//       case "nuevos":
//         return sorted.sort(
//           (a, b) => new Date(b.created_at) - new Date(a.created_at)
//         );
//       default:
//         return sorted;
//     }
//   };

//   const filteredProductos = sortedProductos().filter(
//     (p) => p.precio >= priceRange[0] && p.precio <= priceRange[1]
//   );

//   const LoadingSkeleton = () => (
//     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
//       {[...Array(8)].map((_, i) => (
//         <div key={i} className="animate-pulse">
//           <div className="bg-gray-200 rounded-2xl h-64 mb-4" />
//           <div className="h-4 bg-gray-200 rounded mb-2" />
//           <div className="h-4 bg-gray-200 rounded w-2/3" />
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <section className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-20">
//       {/* HERO SECTION */}
//       <div className="max-w-7xl mx-auto px-4 mb-12">
//         <div className="text-center mb-10">
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-5xl md:text-6xl font-bold text-gray-900 mb-4"
//           >
//             Descubre la <span className="text-red-600">elegancia</span> sensual
//           </motion.h1>
//           <p className="text-gray-600 text-lg max-w-2xl mx-auto">
//             Productos premium seleccionados para momentos íntimos y especiales
//           </p>
//         </div>

//         {/* STATS */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
//           {[
//             { label: "Productos", value: productos.length, icon: "✨" },
//             { label: "Categorías", value: categorias.length, icon: "🏷️" },
//             { label: "Clientes felices", value: "10K+", icon: "❤️" },
//             { label: "Envíos diarios", value: "50+", icon: "🚚" },
//           ].map((stat, idx) => (
//             <div
//               key={idx}
//               className="bg-white p-6 rounded-2xl border border-gray-200 text-center shadow-sm"
//             >
//               <div className="text-3xl mb-2">{stat.icon}</div>
//               <div className="text-2xl font-bold text-gray-900">
//                 {stat.value}
//               </div>
//               <div className="text-sm text-gray-600">{stat.label}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="max-w-7xl mx-auto px-4">
//         {/* FILTERS BAR */}
//         <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm">
//           <div className="flex flex-wrap gap-3">
//             <button
//               onClick={() => cambiarCategoria("todas")}
//               className={`px-5 py-2.5 rounded-full font-medium border transition-all duration-300 flex items-center gap-2
//                 ${
//                   categoriaActual === "todas"
//                     ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
//                     : "bg-white text-gray-700 border-gray-300 hover:border-red-600 hover:text-red-600"
//                 }`}
//             >
//               <Sparkles size={16} />
//               Todas
//             </button>

//             {categorias.map((cat) => (
//               <button
//                 key={cat.id}
//                 onClick={() => cambiarCategoria(cat.slug)}
//                 className={`px-5 py-2.5 rounded-full font-medium border transition-all duration-300
//                   ${
//                     categoriaActual === cat.slug
//                       ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
//                       : "bg-white text-gray-700 border-gray-300 hover:border-red-600 hover:text-red-600"
//                   }`}
//               >
//                 {cat.nombre}
//               </button>
//             ))}
//           </div>

//           <div className="flex items-center gap-4">
//             {/* SORT */}
//             <div className="relative">
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//               >
//                 <option value="recomendados">Recomendados</option>
//                 <option value="nuevos">Más nuevos</option>
//                 <option value="precio-asc">Precio: menor a mayor</option>
//                 <option value="precio-desc">Precio: mayor a menor</option>
//               </select>
//               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             </div>

//             {/* OFFERS FILTER */}
//             <button
//               onClick={toggleOferta}
//               className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300
//                 ${
//                   filtroOferta
//                     ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
//                     : "bg-white text-gray-700 border border-gray-300 hover:border-red-600 hover:text-red-600"
//                 }`}
//             >
//               <Tag size={18} />
//               {filtroOferta ? "Ofertas activas" : "Ver ofertas"}
//             </button>

//             {/* FILTERS TOGGLE */}
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 hover:border-red-600 hover:text-red-600 transition"
//             >
//               <Filter size={18} />
//               Filtros
//             </button>
//           </div>
//         </div>

//         {/* FILTERS PANEL */}
//         <AnimatePresence>
//           {showFilters && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               className="bg-white rounded-2xl border border-gray-200 p-6 mb-10 overflow-hidden"
//             >
//               <div className="grid md:grid-cols-2 gap-8">
//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                     <TrendingUp size={18} />
//                     Rango de precio
//                   </h3>
//                   <div className="px-4">
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
//                     <div className="flex justify-between text-sm text-gray-600 mt-2">
//                       <span>${priceRange[0].toLocaleString()}</span>
//                       <span>${priceRange[1].toLocaleString()}</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-4">
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
//                         className="flex items-center gap-2 cursor-pointer"
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

//         {/* PRODUCTS GRID */}
//         {loading ? (
//           <LoadingSkeleton />
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//             {filteredProductos.map((producto) => {
//               const precio = Number(producto.precio || 0);
//               const precioAntes = Number(producto.precio_antes || 0);
//               const esOferta = Number(producto.es_oferta) === 1;
//               const imagenUrl = getImageSrc(producto.imagen);
//               const isWishlisted = wishlist.includes(producto.id);

//               return (
//                 <motion.div
//                   key={producto.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-red-200 transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/10"
//                 >
//                   {/* WISHLIST BUTTON */}
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       toggleWishlist(producto.id);
//                     }}
//                     className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform"
//                   >
//                     <Heart
//                       size={20}
//                       className={
//                         isWishlisted
//                           ? "fill-red-600 text-red-600"
//                           : "text-gray-400"
//                       }
//                     />
//                   </button>

//                   {/* BADGES */}
//                   <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
//                     {esOferta && (
//                       <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full shadow-lg">
//                         -{Math.round((1 - precio / precioAntes) * 100)}%
//                       </span>
//                     )}
//                     {producto.stock < 10 && producto.stock > 0 && (
//                       <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
//                         Últimas unidades
//                       </span>
//                     )}
//                   </div>

//                   {/* PRODUCT IMAGE */}
//                   <div
//                     onClick={() => navigate(`/productos/${producto.id}`)}
//                     className="relative h-72 bg-gradient-to-br from-gray-50 to-white overflow-hidden cursor-pointer"
//                   >
//                     <img
//                       src={imagenUrl}
//                       alt={producto.nombre}
//                       className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
//                       onError={(e) => (e.target.src = "/imagenes/no-image.png")}
//                     />

//                     {/* QUICK VIEW OVERLAY */}
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setQuickView(producto);
//                         }}
//                         className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-white/90 backdrop-blur-sm rounded-full font-medium flex items-center gap-2 hover:scale-105 transition-transform"
//                       >
//                         <Eye size={16} />
//                         Vista rápida
//                       </button>
//                     </div>
//                   </div>

//                   {/* PRODUCT INFO */}
//                   <div className="p-6">
//                     <div className="flex items-center gap-1 mb-2">
//                       {[...Array(5)].map((_, i) => (
//                         <Star
//                           key={i}
//                           size={14}
//                           className="fill-amber-400 text-amber-400"
//                         />
//                       ))}
//                       <span className="text-sm text-gray-600 ml-2">4.8</span>
//                     </div>

//                     <h3
//                       onClick={() => navigate(`/productos/${producto.id}`)}
//                       className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 cursor-pointer hover:text-red-600 transition"
//                     >
//                       {producto.nombre}
//                     </h3>

//                     <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
//                       {producto.descripcion ||
//                         "Producto premium de alta calidad"}
//                     </p>

//                     {/* PRICE */}
//                     <div className="flex items-center justify-between mb-6">
//                       <div>
//                         {esOferta && precioAntes > 0 && (
//                           <p className="text-gray-400 text-sm line-through">
//                             ${precioAntes.toLocaleString()}
//                           </p>
//                         )}
//                         <p className="text-2xl font-bold text-red-600">
//                           ${precio.toLocaleString()}
//                         </p>
//                       </div>
//                       <span className="text-sm text-gray-500">
//                         {producto.stock || 10} disponibles
//                       </span>
//                     </div>

//                     {/* ACTIONS */}
//                     <div className="flex gap-3">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           addToCart(producto);
//                         }}
//                         className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/30 hover:shadow-red-600/40"
//                       >
//                         <ShoppingCart size={18} />
//                         Agregar
//                       </button>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           navigate(`/productos/${producto.id}`);
//                         }}
//                         className="px-4 py-3 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 transition"
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

//         {/* NO PRODUCTS */}
//         {!loading && filteredProductos.length === 0 && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="text-center py-20"
//           >
//             <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Filter className="w-12 h-12 text-red-400" />
//             </div>
//             <h3 className="text-2xl font-bold text-gray-900 mb-2">
//               No encontramos productos
//             </h3>
//             <p className="text-gray-600 mb-8 max-w-md mx-auto">
//               Intenta con otros filtros o vuelve más tarde
//             </p>
//             <button
//               onClick={() => {
//                 cambiarCategoria("todas");
//                 setPriceRange([0, 500000]);
//               }}
//               className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-600/30 transition"
//             >
//               Ver todos los productos
//             </button>
//           </motion.div>
//         )}

//         {/* QUICK VIEW MODAL */}
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
//                 className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
//               >
//                 <div className="grid md:grid-cols-2">
//                   <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
//                     <img
//                       src={getImageSrc(quickView.imagen)}
//                       alt={quickView.nombre}
//                       className="w-full h-96 object-contain"
//                     />
//                   </div>
//                   <div className="p-8">
//                     <div className="flex justify-between items-start mb-6">
//                       <div>
//                         <h2 className="text-2xl font-bold text-gray-900 mb-2">
//                           {quickView.nombre}
//                         </h2>
//                         <div className="flex items-center gap-4">
//                           <div className="flex items-center gap-1">
//                             <Star
//                               size={16}
//                               className="fill-amber-400 text-amber-400"
//                             />
//                             <span className="font-medium">4.8</span>
//                             <span className="text-gray-500 text-sm">
//                               (128 reseñas)
//                             </span>
//                           </div>
//                           <span className="text-green-600 font-medium">
//                             En stock
//                           </span>
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => setQuickView(null)}
//                         className="p-2 hover:bg-gray-100 rounded-full"
//                       >
//                         ✕
//                       </button>
//                     </div>

//                     <p className="text-gray-600 mb-6">
//                       {quickView.descripcion ||
//                         "Producto premium de alta calidad con materiales cuidadosamente seleccionados."}
//                     </p>

//                     <div className="mb-6">
//                       <div className="flex items-center gap-4 mb-4">
//                         <span className="text-3xl font-bold text-red-600">
//                           ${Number(quickView.precio).toLocaleString()}
//                         </span>
//                         {quickView.precio_antes > 0 && (
//                           <span className="text-gray-400 line-through">
//                             ${Number(quickView.precio_antes).toLocaleString()}
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex gap-4">
//                       <button
//                         onClick={() => {
//                           addToCart(quickView);
//                           setQuickView(null);
//                         }}
//                         className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg transition"
//                       >
//                         Agregar al carrito
//                       </button>
//                       <button
//                         onClick={() => {
//                           navigate(`/productos/${quickView.id}`);
//                           setQuickView(null);
//                         }}
//                         className="px-8 py-3 border border-gray-300 font-semibold rounded-xl hover:border-red-600 hover:text-red-600 transition"
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

//         {/* PAGINATION (Placeholder) */}
//         {filteredProductos.length > 0 && (
//           <div className="mt-16 flex justify-center">
//             <div className="flex items-center gap-2">
//               {[1, 2, 3, 4, 5].map((page) => (
//                 <button
//                   key={page}
//                   className={`w-10 h-10 rounded-lg font-medium transition
//                     ${
//                       page === 1
//                         ? "bg-red-600 text-white"
//                         : "border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600"
//                     }`}
//                 >
//                   {page}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default Productos;

// import { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { ShoppingCart, Tag, Filter } from "lucide-react";
// import { useCart } from "@/context/CartContext";
// import { API_URL } from "@/config";

// const Productos = () => {
//   const { addToCart } = useCart();
//   const navigate = useNavigate();

//   const [productos, setProductos] = useState([]);
//   const [categorias, setCategorias] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [searchParams, setSearchParams] = useSearchParams();

//   const categoriaActual = searchParams.get("categoria") || "todas";
//   const filtroOferta = searchParams.get("filtro") === "ofertas";

//   // 🔥 FUNCIÓN MEJORADA PARA OBTENER IMÁGENES
//   const getImageSrc = (imagen) => {
//     if (!imagen) {
//       return "/imagenes/no-image.png";
//     }

//     // Si ya es una URL completa (Cloudinary o cualquier CDN)
//     if (imagen.startsWith("http://") || imagen.startsWith("https://")) {
//       return imagen.replace("http://", "https://");
//     }

//     // Si es un path relativo antiguo
//     if (imagen.startsWith("/imagenes/")) {
//       return imagen;
//     }

//     // Si es nombre de archivo del sistema antiguo (Railway)
//     return `${API_URL}/images/${imagen}`;
//   };

//   useEffect(() => {
//     fetch(`${API_URL}/api/categorias`)
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("📂 Categorías cargadas:", data);
//         setCategorias(Array.isArray(data) ? data : []);
//       })
//       .catch((err) => {
//         console.error("❌ Error al cargar categorías:", err);
//         setCategorias([]);
//       });
//   }, []);

//   useEffect(() => {
//     setLoading(true);
//     let url = `${API_URL}/api/productos?`;
//     if (categoriaActual !== "todas") url += `categoria=${categoriaActual}&`;
//     if (filtroOferta) url += `es_oferta=true&`;

//     console.log("🔍 Cargando productos desde:", url);

//     fetch(url)
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("📦 Productos recibidos:", data);

//         // Debug de imágenes
//         if (data.length > 0) {
//           console.log("🖼️ Ejemplo de imagen:", {
//             original: data[0].imagen,
//             procesada: getImageSrc(data[0].imagen),
//           });
//         }

//         setProductos(Array.isArray(data) ? data : []);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("❌ Error al cargar productos:", err);
//         setProductos([]);
//         setLoading(false);
//       });
//   }, [categoriaActual, filtroOferta]);

//   const cambiarCategoria = (slug) => {
//     const params = new URLSearchParams(searchParams);
//     slug === "todas"
//       ? params.delete("categoria")
//       : params.set("categoria", slug);
//     setSearchParams(params);
//   };

//   const toggleOferta = () => {
//     const params = new URLSearchParams(searchParams);
//     filtroOferta ? params.delete("filtro") : params.set("filtro", "ofertas");
//     setSearchParams(params);
//   };

//   /* LOADING */
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white">
//         <div className="h-14 w-14 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
//       </div>
//     );
//   }

//   return (
//     <section className="bg-white py-14">
//       <div className="max-w-7xl mx-auto px-4">
//         {/* TÍTULO */}
//         <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
//           <span className="text-red-600">Nuestros Productos</span>
//         </h1>

//         {/* CATEGORÍAS */}
//         <div className="flex flex-wrap justify-center gap-3 mb-8">
//           <button
//             onClick={() => cambiarCategoria("todas")}
//             className={`px-4 py-2 rounded-full font-medium border transition
//               ${
//                 categoriaActual === "todas"
//                   ? "bg-red-600 text-white border-red-600"
//                   : "bg-white text-gray-700 border-gray-300 hover:border-red-600 hover:text-red-600"
//               }`}
//           >
//             Todas
//           </button>

//           {categorias.map((cat) => (
//             <button
//               key={cat.id}
//               onClick={() => cambiarCategoria(cat.slug)}
//               className={`px-4 py-2 rounded-full font-medium border transition
//                 ${
//                   categoriaActual === cat.slug
//                     ? "bg-red-600 text-white border-red-600"
//                     : "bg-white text-gray-700 border-gray-300 hover:border-red-600 hover:text-red-600"
//                 }`}
//             >
//               {cat.nombre}
//             </button>
//           ))}
//         </div>

//         {/* OFERTAS */}
//         <div className="flex justify-center mb-10">
//           <button
//             onClick={toggleOferta}
//             className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition
//               ${
//                 filtroOferta
//                   ? "bg-red-600 text-white"
//                   : "bg-white text-gray-700 border border-gray-300 hover:border-red-600 hover:text-red-600"
//               }`}
//           >
//             <Tag size={18} />
//             {filtroOferta ? "Mostrando ofertas" : "Ver solo ofertas"}
//           </button>
//         </div>

//         {/* GRID */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//           {productos.map((producto) => {
//             const precio = Number(producto.precio || 0);
//             const precioAntes = Number(producto.precio_antes || 0);
//             const esOferta = Number(producto.es_oferta) === 1;
//             const imagenUrl = getImageSrc(producto.imagen);

//             return (
//               <div
//                 key={producto.id}
//                 onClick={() => navigate(`/productos/${producto.id}`)}
//                 className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition"
//               >
//                 {esOferta && (
//                   <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
//                     OFERTA
//                   </span>
//                 )}

//                 <div className="h-48 flex items-center justify-center bg-gray-50 relative">
//                   <img
//                     src={imagenUrl}
//                     alt={producto.nombre}
//                     className="max-h-full max-w-full object-contain"
//                     onError={(e) => {
//                       console.error("❌ Error cargando imagen:", {
//                         producto: producto.nombre,
//                         imagenOriginal: producto.imagen,
//                         urlProcesada: imagenUrl,
//                       });
//                       e.target.src = "/imagenes/no-image.png";
//                     }}
//                     onLoad={() => {
//                       console.log("✅ Imagen cargada:", producto.nombre);
//                     }}
//                   />
//                 </div>

//                 <div className="p-4 text-center">
//                   <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">
//                     {producto.nombre}
//                   </h3>

//                   {esOferta && precioAntes > 0 && (
//                     <p className="text-gray-400 text-sm line-through">
//                       ${precioAntes.toLocaleString()}
//                     </p>
//                   )}

//                   <p className="text-red-600 text-xl font-bold mb-4">
//                     ${precio.toLocaleString()}
//                   </p>

//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       addToCart(producto);
//                     }}
//                     className="w-full py-2 rounded-xl font-semibold flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 transition"
//                   >
//                     Agregar <ShoppingCart size={16} />
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* SIN PRODUCTOS */}
//         {productos.length === 0 && (
//           <div className="text-center py-20">
//             <Filter className="w-14 h-14 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500 text-lg">
//               No hay productos con estos filtros
//             </p>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default Productos;
