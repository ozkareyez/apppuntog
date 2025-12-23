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
     IMÁGENES
     ========================= */
  const getImageSrc = (imagen) => {
    if (!imagen) return "/imagenes/no-image.png";
    if (imagen.startsWith("http://"))
      return imagen.replace("http://", "https://");
    if (imagen.startsWith("https://")) return imagen;
    return `${API_URL}/images/${imagen}`;
  };

  /* =========================
     CARGAR CATEGORÍAS
     ========================= */
  useEffect(() => {
    fetch(`${API_URL}/api/categorias`)
      .then((res) => res.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => setCategorias([]));
  }, []);

  /* =========================
     CARGAR PRODUCTOS
     ========================= */
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    let url = `${API_URL}/api/productos?`;
    if (categoriaActual !== "todas") url += `categoria=${categoriaActual}&`;
    if (filtroOferta) url += `es_oferta=true&`;

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setProductos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProductos([]);
        setLoading(false);
      });

    return () => controller.abort();
  }, [categoriaActual, filtroOferta]);

  /* =========================
     FILTROS
     ========================= */
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

  /* =========================
     LOADING
     ========================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-16 w-16 border-t-2 border-b-2 border-pink-500 rounded-full"></div>
      </div>
    );
  }

  /* =========================
     RENDER
     ========================= */
  return (
    <section className="min-h-screen bg-black py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl text-center text-pink-400 mb-8">
          Nuestros Productos
        </h1>

        {/* CATEGORÍAS */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <button
            onClick={() => cambiarCategoria("todas")}
            className={`px-4 py-2 rounded-xl font-semibold transition-all
              ${
                categoriaActual === "todas"
                  ? "bg-pink-500 text-white shadow-lg shadow-pink-500/40"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
          >
            Todas
          </button>

          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => cambiarCategoria(cat.slug)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all
                ${
                  categoriaActual === cat.slug
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/40"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* BOTÓN OFERTAS */}
        <div className="flex justify-center mb-8">
          <button
            onClick={toggleOferta}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all
              ${
                filtroOferta
                  ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/50"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
          >
            <Tag size={18} />
            {filtroOferta ? "Mostrando Ofertas" : "Ver Solo Ofertas"}
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((producto) => {
            const precio = Number(producto.precio || 0);
            const precioAntes = Number(producto.precio_antes || 0);
            const esOferta = Number(producto.es_oferta) === 1;

            return (
              <div
                key={producto.id}
                onClick={() => navigate(`/productos/${producto.id}`)}
                className={`relative group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300
                  ${
                    esOferta
                      ? "bg-gradient-to-b from-pink-500/10 to-transparent border border-pink-500 shadow-lg shadow-pink-500/40 hover:scale-[1.02]"
                      : "bg-[#1f1f1f] border border-white/10 hover:border-pink-400"
                  }`}
              >
                {/* ETIQUETA OFERTA */}
                {esOferta && (
                  <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                    🔥 OFERTA
                  </div>
                )}

                {/* IMAGEN */}
                <div className="h-54 w-full flex items-center justify-center overflow-hidden bg-black/10">
                  <img
                    src={getImageSrc(producto.imagen)}
                    alt={producto.nombre}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* INFO */}
                <div className="p-4 text-center">
                  <h3 className="text-white text-sm font-semibold line-clamp-2 mb-2">
                    {producto.nombre}
                  </h3>

                  {esOferta && precioAntes > 0 && (
                    <p className="text-gray-400 text-sm line-through mb-1">
                      Antes ${precioAntes.toLocaleString()}
                    </p>
                  )}

                  <p className="text-pink-400 text-xl font-bold mb-3">
                    ${precio.toLocaleString()}
                  </p>

                  {/* BOTÓN */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(producto);
                    }}
                    className={`w-full py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                      ${
                        esOferta
                          ? "bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-red-500 hover:to-pink-600 shadow-lg shadow-pink-500/40 animate-pulse"
                          : "bg-white text-black hover:bg-pink-500 hover:text-white"
                      }`}
                  >
                    <ShoppingCart size={16} />
                    {esOferta ? "🔥 Aprovecha esta oferta" : "Agregar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* SIN PRODUCTOS */}
        {productos.length === 0 && (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              No hay productos con estos filtros
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Productos;
