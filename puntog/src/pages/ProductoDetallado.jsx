// src/pages/Productos.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Tag, Filter } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { API_URL } from "@/config";

const Productos = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  const categoriaActual = searchParams.get("categoria") || "todas";
  const filtroOferta = searchParams.get("filtro") === "ofertas";

  /* =========================
     🖼️ OBTENER RUTA DE IMAGEN
     ========================= */
  const getImageSrc = (imagen) => {
    if (!imagen) return "/imagenes/no-image.png";

    // Si ya es URL completa con http/https
    if (imagen.startsWith("http://"))
      return imagen.replace("http://", "https://");
    if (imagen.startsWith("https://")) return imagen;

    // ⭐ Si es solo el nombre del archivo, construye URL del backend
    // Ejemplo: "producto1.jpg" → "https://tu-backend.railway.app/images/producto1.jpg"
    return `${API_URL}/images/${imagen}`;
  };

  /* =========================
     CARGAR CATEGORÍAS
     ========================= */
  useEffect(() => {
    fetch(`${API_URL}/api/categorias`)
      .then((res) => res.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch((err) => console.error("❌ Error cargando categorías:", err));
  }, []);

  /* =========================
     CARGAR PRODUCTOS (CORREGIDO) ⭐
     ========================= */
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    let url = `${API_URL}/api/productos?`;
    if (categoriaActual !== "todas") url += `categoria=${categoriaActual}&`;
    if (filtroOferta) url += `es_oferta=true&`;

    console.log("🔍 Cargando productos desde:", url);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        // ⭐ Verifica si la respuesta es exitosa ANTES de parsear
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Productos recibidos:", data);
        setProductos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("❌ Error cargando productos:", err);
          setProductos([]); // ⭐ Limpia productos en caso de error
          setLoading(false); // ⭐ CRÍTICO: siempre desactiva loading
        }
      });

    return () => controller.abort();
  }, [categoriaActual, filtroOferta]);

  /* =========================
     FILTROS
     ========================= */
  const cambiarCategoria = (slug) => {
    const params = new URLSearchParams(searchParams);
    if (slug === "todas") {
      params.delete("categoria");
    } else {
      params.set("categoria", slug);
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
    setSearchParams(params);
  };

  /* =========================
     LOADING
     ========================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Cargando productos...</p>
        </div>
      </div>
    );
  }

  /* =========================
     RENDER
     ========================= */
  return (
    <section className="min-h-screen bg-black py-10">
      <div className="max-w-7xl mx-auto p-4">
        {/* TÍTULO */}
        <h1 className="text-4xl text-center text-pink-400 mb-8">
          {categoriaActual !== "todas"
            ? categorias.find((c) => c.slug === categoriaActual)?.nombre ||
              "Productos"
            : "Nuestros Productos"}
        </h1>

        {/* FILTRO OFERTAS */}
        <div className="flex justify-center mb-6">
          <button
            onClick={toggleOferta}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
              filtroOferta
                ? "bg-pink-500 text-white shadow-lg shadow-pink-500/50"
                : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
            }`}
          >
            <Tag size={18} />
            {filtroOferta ? "Mostrando Ofertas" : "Ver Solo Ofertas"}
          </button>
        </div>

        {/* FILTRO CATEGORÍAS */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => cambiarCategoria("todas")}
            className={`px-5 py-2 rounded-xl font-semibold transition-all ${
              categoriaActual === "todas"
                ? "bg-pink-500 text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Todas
          </button>

          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => cambiarCategoria(cat.slug)}
              className={`px-5 py-2 rounded-xl font-semibold transition-all ${
                categoriaActual === cat.slug
                  ? "bg-pink-500 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* CONTADOR */}
        <p className="text-center text-gray-400 mb-6">
          {productos.length} producto{productos.length !== 1 ? "s" : ""}{" "}
          encontrado{productos.length !== 1 ? "s" : ""}
        </p>

        {/* GRID DE PRODUCTOS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {productos.map((producto) => {
            const precio = Number(producto.precio ?? 0);
            const precioAntes = Number(producto.precio_antes ?? 0);
            const esOferta = producto.es_oferta && precioAntes > precio;

            return (
              <div
                key={producto.id}
                onClick={() => navigate(`/productos/${producto.id}`)}
                className={`group bg-[#1f1f1f] border rounded-2xl overflow-hidden relative transition-all hover:shadow-lg cursor-pointer ${
                  esOferta
                    ? "border-pink-500/50 hover:border-pink-400 hover:shadow-pink-500/30"
                    : "border-white/10 hover:border-pink-400 hover:shadow-pink-500/20"
                }`}
              >
                {/* BADGE DE OFERTA */}
                {esOferta && producto.descuento && (
                  <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
                    <Tag size={12} />
                    {producto.descuento}% OFF
                  </div>
                )}

                {/* IMAGEN */}
                <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
                  <img
                    src={getImageSrc(producto.imagen)}
                    alt={producto.nombre}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* INFO DEL PRODUCTO */}
                <div className="p-3 sm:p-4 text-center">
                  <h3 className="text-white text-sm sm:text-base font-semibold line-clamp-2 mb-2 min-h-[2.5rem]">
                    {producto.nombre}
                  </h3>

                  {/* PRECIOS */}
                  <div className="mt-2 mb-3">
                    {esOferta ? (
                      <div className="space-y-1">
                        <p className="text-gray-400 text-sm line-through">
                          ${precioAntes.toFixed(2)}
                        </p>
                        <p className="text-pink-400 text-xl sm:text-2xl font-bold">
                          ${precio.toFixed(2)}
                        </p>
                        <p className="text-green-400 text-xs sm:text-sm font-medium">
                          Ahorras ${(precioAntes - precio).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-pink-400 text-lg sm:text-xl font-bold">
                        ${precio.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* BOTÓN AGREGAR */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que se active el click de la card
                      addToCart(producto);
                    }}
                    className={`w-full py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      esOferta
                        ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 shadow-md hover:shadow-pink-500/50"
                        : "bg-white text-black hover:bg-pink-500 hover:text-white"
                    }`}
                  >
                    <ShoppingCart size={16} />
                    {esOferta ? "¡Aprovechar!" : "Agregar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* MENSAJE SI NO HAY PRODUCTOS */}
        {productos.length === 0 && (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              No hay productos disponibles con estos filtros
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Productos;
