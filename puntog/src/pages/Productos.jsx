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

  const categoriaActual = searchParams.get("categoria") || "todas";
  const filtroOferta = searchParams.get("filtro") === "ofertas";

  useEffect(() => {
    fetch(`${API_URL}/api/categorias`)
      .then((res) => res.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : []))
      .catch(console.error);
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
      .catch((err) => {
        console.error(err);
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

  const handleImgError = (e) => {
    e.target.src = "/imagen/placeholder.png";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Cargando productos...</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-black py-10">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-4xl text-center text-pink-400 mb-8">
          {categoriaActual !== "todas"
            ? categorias.find((c) => c.slug === categoriaActual)?.nombre ||
              "Productos"
            : "Nuestros Productos"}
        </h1>

        {/* Filtro ofertas */}
        <div className="flex justify-center mb-6">
          <button
            onClick={toggleOferta}
            className={`px-6 py-2 rounded-xl font-semibold ${
              filtroOferta ? "bg-pink-500 text-white" : "bg-white/10 text-white"
            }`}
          >
            <Tag size={16} className="inline mr-2" />
            {filtroOferta ? "Mostrando Ofertas" : "Ver Solo Ofertas"}
          </button>
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => cambiarCategoria("todas")}
            className={`px-5 py-2 rounded-xl ${
              categoriaActual === "todas"
                ? "bg-pink-500 text-white"
                : "bg-white/10 text-white"
            }`}
          >
            Todas
          </button>

          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => cambiarCategoria(cat.slug)}
              className={`px-5 py-2 rounded-xl ${
                categoriaActual === cat.slug
                  ? "bg-pink-500 text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((producto) => {
            // 🔒 NORMALIZACIÓN (ANTI-ERROR DEFINITIVO)
            const precio = Number(producto?.precio ?? 0);
            const precioAntes = Number(
              producto?.precio_antes ?? producto?.precio ?? 0
            );
            const ahorro = Math.max(precioAntes - precio, 0);

            return (
              <div
                key={producto.id}
                className="bg-[#1f1f1f] border border-white/10 rounded-2xl overflow-hidden"
              >
                {producto.es_oferta && (
                  <div className="absolute m-3 bg-pink-500 text-white text-xs px-3 py-1 rounded-lg">
                    {producto.descuento}% OFF
                  </div>
                )}

                <img
                  src={`/imagen/${producto.imagen}`}
                  alt={producto.nombre}
                  onError={handleImgError}
                  className="w-full h-56 object-cover"
                />

                <div className="p-4 text-center">
                  <h3 className="text-white font-semibold mb-2 line-clamp-2">
                    {producto.nombre}
                  </h3>

                  {precioAntes > precio ? (
                    <>
                      <p className="text-gray-400 line-through">
                        ${precioAntes.toFixed(2)}
                      </p>
                      <p className="text-pink-400 text-xl font-bold">
                        ${precio.toFixed(2)}
                      </p>
                      <p className="text-green-400 text-sm">
                        Ahorras ${ahorro.toFixed(2)}
                      </p>
                    </>
                  ) : (
                    <p className="text-pink-400 text-xl font-bold">
                      ${precio.toFixed(2)}
                    </p>
                  )}

                  <button
                    onClick={() => addToCart(producto)}
                    className="mt-3 w-full py-2 bg-pink-500 text-white rounded-xl"
                  >
                    <ShoppingCart size={16} className="inline mr-2" />
                    Agregar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {productos.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Filter className="mx-auto mb-4" size={48} />
            No hay productos con estos filtros
          </div>
        )}
      </div>
    </section>
  );
};

export default Productos;
