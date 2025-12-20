// src/pages/ProductoDetallado.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Tag, Heart, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { API_URL } from "@/config";

const ProductoDetallado = () => {
  console.log("🚀 COMPONENTE PRODUCTO DETALLADO SE ESTÁ RENDERIZANDO");

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  console.log("📦 ID del producto desde URL:", id);

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState(null);

  /* =========================
     OBTENER RUTA DE IMAGEN
     ========================= */
  const getImageSrc = (imagen) => {
    if (!imagen) return "/imagenes/no-image.png";
    if (imagen.startsWith("http://"))
      return imagen.replace("http://", "https://");
    if (imagen.startsWith("https://")) return imagen;
    return `${API_URL}/images/${imagen}`;
  };

  /* =========================
     CARGAR PRODUCTO
     ========================= */
  useEffect(() => {
    console.log("🔍 Cargando producto con ID:", id);
    setLoading(true);
    setError(null);

    const url = `${API_URL}/api/productos/${id}`;
    console.log("📡 URL de la petición:", url);

    fetch(url)
      .then((res) => {
        console.log("📥 Respuesta recibida, status:", res.status);
        if (!res.ok) {
          throw new Error(`Producto no encontrado (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Producto cargado:", data);
        setProducto(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error cargando producto:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  /* =========================
     AGREGAR AL CARRITO
     ========================= */
  const handleAgregarCarrito = () => {
    if (!producto) return;

    console.log(`🛒 Agregando ${cantidad} producto(s) al carrito`);

    // Agregar con cantidad personalizada
    for (let i = 0; i < cantidad; i++) {
      addToCart(producto);
    }
  };

  /* =========================
     LOADING
     ========================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Cargando producto...</p>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR / NO ENCONTRADO
     ========================= */
  if (error || !producto) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-white text-3xl mb-2">Producto no encontrado</h2>
          <p className="text-gray-400 mb-6">
            {error || "No pudimos encontrar este producto"}
          </p>
          <button
            onClick={() => navigate("/productos")}
            className="bg-pink-500 text-white px-8 py-3 rounded-xl hover:bg-pink-600 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  const precio = Number(producto.precio ?? 0);
  const precioAntes = Number(producto.precio_antes ?? 0);
  const esOferta = producto.es_oferta && precioAntes > precio;
  const tieneStock = producto.stock === undefined || producto.stock > 0;

  /* =========================
     RENDER
     ========================= */
  return (
    <section className="min-h-screen bg-black py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* BOTÓN VOLVER */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-pink-400 transition-colors mb-6 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium">Volver</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* COLUMNA IZQUIERDA - IMAGEN */}
          <div className="relative bg-[#1f1f1f] rounded-2xl overflow-hidden border border-white/10">
            {/* BADGE DE OFERTA */}
            {esOferta && producto.descuento && (
              <div className="absolute top-6 left-6 z-10 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-base font-bold px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
                <Tag size={18} />
                {producto.descuento}% OFF
              </div>
            )}

            {/* IMAGEN PRINCIPAL */}
            <div className="aspect-square md:aspect-auto md:h-[400px] lg:h-[550px]">
              <img
                src={getImageSrc(producto.imagen)}
                alt={producto.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("❌ Error cargando imagen:", e);
                  e.target.src = "/imagenes/no-image.png";
                }}
              />
            </div>
          </div>

          {/* COLUMNA DERECHA - INFORMACIÓN */}
          <div className="flex flex-col justify-between">
            <div className="space-y-6">
              {/* CATEGORÍA */}
              {producto.categoria && (
                <div className="inline-block">
                  <span className="text-pink-400 text-sm font-semibold bg-pink-400/10 px-4 py-1.5 rounded-full border border-pink-400/20">
                    {producto.categoria}
                  </span>
                </div>
              )}

              {/* NOMBRE */}
              <h1 className="text-4xl lg:text-5xl text-white font-bold leading-tight">
                {producto.nombre}
              </h1>

              {/* DESCRIPCIÓN */}
              {/* {producto.descripcion && (
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {producto.descripcion}
                  </p>
                </div>
              )} */}

              {/* PRECIOS */}
              <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl p-6 border border-pink-500/20">
                {esOferta ? (
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-3">
                      <span className="text-gray-400 text-xl line-through">
                        ${precioAntes.toFixed(2)}
                      </span>
                      <span className="text-green-400 text-base font-semibold bg-green-400/10 px-3 py-1 rounded-full">
                        Ahorra ${(precioAntes - precio).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-pink-400 text-6xl font-bold">
                      ${precio.toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="text-pink-400 text-6xl font-bold">
                    ${precio.toFixed(2)}
                  </p>
                )}
              </div>

              {/* STOCK */}
              <div className="flex items-center gap-2">
                {tieneStock ? (
                  <>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">
                      {producto.stock !== undefined
                        ? `Disponible (${producto.stock} en stock)`
                        : "Disponible"}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-red-400 font-medium">Agotado</span>
                  </>
                )}
              </div>
            </div>

            {/* ACCIONES */}
            <div className="space-y-4 mt-8">
              {/* SELECTOR DE CANTIDAD */}
              <div className="flex items-center gap-4">
                <label className="text-white font-semibold text-lg">
                  Cantidad:
                </label>
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-2 border border-white/20">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    disabled={!tieneStock}
                    className="bg-white/10 text-white w-10 h-10 rounded-lg hover:bg-white/20 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-white text-2xl font-bold w-16 text-center">
                    {cantidad}
                  </span>
                  <button
                    onClick={() => setCantidad(cantidad + 1)}
                    disabled={!tieneStock}
                    className="bg-white/10 text-white w-10 h-10 rounded-lg hover:bg-white/20 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* BOTÓN AGREGAR AL CARRITO */}
              <button
                onClick={handleAgregarCarrito}
                disabled={!tieneStock}
                className={`w-full py-5 rounded-xl font-bold text-xl transition-all flex items-center justify-center gap-3 ${
                  !tieneStock
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : esOferta
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 shadow-lg hover:shadow-pink-500/50 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-white text-black hover:bg-pink-500 hover:text-white shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                <ShoppingCart size={24} />
                {!tieneStock
                  ? "Agotado"
                  : esOferta
                  ? "¡Agregar al Carrito!"
                  : "Agregar al Carrito"}
              </button>

              {/* BOTÓN FAVORITOS */}
              <button className="w-full py-4 rounded-xl border-2 border-white/20 text-white hover:border-pink-400 hover:text-pink-400 hover:bg-pink-400/5 transition-all flex items-center justify-center gap-2 font-semibold">
                <Heart size={20} />
                Agregar a Favoritos
              </button>
            </div>
          </div>
        </div>

        {/* SECCIÓN ADICIONAL - INFORMACIÓN EXTRA */}

        {producto.descripcion && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <p className="text-gray-300 text-lg leading-relaxed">
              {producto.descripcion}
            </p>
          </div>
        )}
        {/* {producto.descripcion && (
          <div className="mt-12 bg-[#1f1f1f] rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl text-white font-bold mb-4">
              Detalles del Producto
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-pink-400 font-semibold mb-2">
                  Características:
                </h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Material de alta calidad</li>
                  <li>• Fácil de limpiar</li>
                  <li>• Empaque discreto</li>
                  <li>• Envío rápido y seguro</li>
                </ul>
              </div>
              <div>
                <h3 className="text-pink-400 font-semibold mb-2">Garantía:</h3>
                <p className="text-gray-300">
                  Este producto cuenta con garantía de satisfacción. Si no estás
                  completamente satisfecho, contáctanos dentro de los primeros
                  30 días.
                </p>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </section>
  );
};

export default ProductoDetallado;
