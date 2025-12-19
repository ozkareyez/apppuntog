// src/pages/Productos.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShoppingCart, Tag, Filter } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { API_URL } from "@/config";

const Productos = () => {
  const { addToCart } = useCart();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Obtener filtros de la URL
  const categoriaActual = searchParams.get("categoria") || "todas";
  const filtroOferta = searchParams.get("filtro") === "ofertas";

  useEffect(() => {
    // Cargar categorías
    fetch(`${API_URL}/api/categorias`)
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((err) => console.error("Error:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    // Construir URL de filtros
    let url = `${API_URL}/api/productos?`;

    if (categoriaActual !== "todas") {
      url += `categoria=${categoriaActual}&`;
    }

    if (filtroOferta) {
      url += `es_oferta=true&`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, [categoriaActual, filtroOferta]);

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

  // ⭐ FUNCIÓN QUE FALTABA
  const handleImgError = (e) => {
    e.target.src = "/imagen/placeholder.png";
  };

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

  return (
    <section className="min-h-screen bg-black py-10">
      <div className="max-w-7xl mx-auto p-4">
        {/* Título */}
        <h1 className="text-4xl text-center text-pink-400 mb-8">
          {categoriaActual !== "todas"
            ? `${
                categorias.find((c) => c.slug === categoriaActual)?.nombre ||
                "Productos"
              }`
            : "Nuestros Productos"}
        </h1>

        {/* Filtros */}
        <div className="mb-8 space-y-4">
          {/* Filtro de ofertas */}
          <div className="flex justify-center">
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

          {/* Filtro de categorías */}
          <div className="flex flex-wrap justify-center gap-3">
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
        </div>

        {/* Contador de productos */}
        <p className="text-center text-gray-400 mb-6">
          {productos.length} producto{productos.length !== 1 ? "s" : ""}{" "}
          encontrado{productos.length !== 1 ? "s" : ""}
        </p>

        {/* Grid de productos */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className={`group bg-[#1f1f1f] border rounded-2xl overflow-hidden relative
              transition hover:shadow-lg ${
                producto.es_oferta
                  ? "border-pink-500/50 hover:border-pink-400 hover:shadow-pink-500/30"
                  : "border-white/10 hover:border-pink-400 hover:shadow-pink-500/20"
              }`}
            >
              {/* Badge de Oferta */}
              {producto.es_oferta && (
                <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
                  <Tag size={12} />
                  {producto.descuento}% OFF
                </div>
              )}

              <div className="relative w-full h-48 sm:h-64 lg:h-72 overflow-hidden">
                <img
                  src={`/imagen/${producto.imagen}`}
                  alt={producto.nombre}
                  onError={handleImgError}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-3 sm:p-5 text-center">
                <h3 className="text-white text-sm sm:text-base font-semibold line-clamp-2 min-h-[2.5rem]">
                  {producto.nombre}
                </h3>

                {/* Sistema de Precios */}
                <div className="mt-2 sm:mt-3">
                  {producto.es_oferta && producto.precio_antes ? (
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm sm:text-base line-through">
                        ${producto.precio_antes.toFixed(2)}
                      </p>
                      <p className="text-pink-400 text-xl sm:text-2xl font-bold">
                        ${producto.precio.toFixed(2)}
                      </p>
                      <p className="text-green-400 text-xs sm:text-sm font-medium">
                        Ahorras $
                        {(producto.precio_antes - producto.precio).toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-pink-400 text-lg sm:text-xl font-bold">
                      ${producto.precio?.toFixed(2)}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => addToCart(producto)}
                  className={`mt-3 w-full py-2 rounded-xl font-semibold
                  transition flex items-center justify-center gap-2 ${
                    producto.es_oferta
                      ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 shadow-md hover:shadow-pink-500/50"
                      : "bg-white text-black hover:bg-pink-500 hover:text-white"
                  }`}
                >
                  <ShoppingCart size={16} />
                  {producto.es_oferta ? "¡Aprovechar!" : "Agregar"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje si no hay productos */}
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
