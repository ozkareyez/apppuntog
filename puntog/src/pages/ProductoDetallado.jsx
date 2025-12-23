// src/pages/ProductoDetallado.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Tag, Heart, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { API_URL } from "@/config";

const ProductoDetallado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

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
     FORMATEAR DESCRIPCIÓN
     ========================= */
  const renderDescripcion = (texto) => {
    if (!texto) return null;

    const partes = texto
      .split("*")
      .map((p) => p.trim())
      .filter(Boolean);

    return (
      <div className="space-y-6">
        {/* Texto principal */}
        {partes[0] && (
          <p className="text-gray-300 text-lg leading-relaxed">
            {partes[0].split(",").map((frase, i) => (
              <span key={i} className="block mb-2">
                {frase.trim()}.
              </span>
            ))}
          </p>
        )}

        {/* Referencias */}
        {partes.length > 1 && (
          <ul className="space-y-3">
            {partes.slice(1).map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-gray-300 text-lg"
              >
                <span className="text-pink-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  /* =========================
     CARGAR PRODUCTO
     ========================= */
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/productos/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Producto no encontrado");
        return res.json();
      })
      .then((data) => {
        setProducto(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  /* =========================
     AGREGAR AL CARRITO
     ========================= */
  const handleAgregarCarrito = () => {
    if (!producto) return;
    for (let i = 0; i < cantidad; i++) {
      addToCart(producto);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-center p-8">
        <div>
          <h2 className="text-white text-3xl mb-4">Producto no encontrado</h2>
          <button
            onClick={() => navigate("/productos")}
            className="bg-pink-500 text-white px-8 py-3 rounded-xl"
          >
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

  return (
    <section className="min-h-screen bg-black py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* VOLVER */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white mb-6"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          {/* IMAGEN */}
          {/* <div className="relative bg-[#1f1f1f] rounded-2xl overflow-hidden border border-white/10">
            {esOferta && producto.descuento && (
              <div className="absolute top-6 left-6 bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Tag size={18} />
                {producto.descuento}% OFF
              </div>
            )}
            <img
              src={getImageSrc(producto.imagen)}
              alt={producto.nombre}
              className="w-full h-[500px] object-cover"
              onError={(e) => (e.target.src = "/imagenes/no-image.png")}
            />
          </div> */}
          <div className="relative bg-[#1f1f1f] rounded-2xl overflow-hidden border border-white/10 h-[500px] flex items-center justify-center">
            {esOferta && producto.descuento && (
              <div className="absolute top-6 left-6 bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 z-10">
                <Tag size={18} />
                {producto.descuento}% OFF
              </div>
            )}

            <img
              src={getImageSrc(producto.imagen)}
              alt={producto.nombre}
              className="max-w-full max-h-full object-contain"
              onError={(e) => (e.currentTarget.src = "/imagenes/no-image.png")}
            />
          </div>

          {/* INFO */}
          <div className="flex flex-col justify-between">
            <div className="space-y-6">
              <h1 className="text-4xl text-white font-bold">
                {producto.nombre}
              </h1>

              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                {esOferta && (
                  <p className="text-gray-400 line-through text-xl">
                    ${precioAntes.toFixed(2)}
                  </p>
                )}
                <p className="text-pink-400 text-5xl font-bold">
                  ${precio.toFixed(2)}
                </p>
              </div>

              <p
                className={`font-semibold ${
                  tieneStock ? "text-green-400" : "text-red-400"
                }`}
              >
                {tieneStock ? "Disponible" : "Agotado"}
              </p>
            </div>

            {/* ACCIONES */}
            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-4">
                <span className="text-white font-semibold">Cantidad:</span>
                <div className="flex items-center gap-3 bg-white/10 p-2 rounded-xl">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    disabled={!tieneStock}
                    className="bg-white/10 w-10 h-10 rounded-lg"
                  >
                    <Minus />
                  </button>
                  <span className="text-white text-xl w-12 text-center">
                    {cantidad}
                  </span>
                  <button
                    onClick={() => setCantidad(cantidad + 1)}
                    disabled={!tieneStock}
                    className="bg-white/10 w-10 h-10 rounded-lg"
                  >
                    <Plus />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAgregarCarrito}
                disabled={!tieneStock}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-xl text-xl font-bold flex items-center justify-center gap-3"
              >
                <ShoppingCart />
                Agregar al carrito
              </button>

              <button className="w-full border border-white/20 py-3 rounded-xl text-white flex items-center justify-center gap-2">
                <Heart />
                Favoritos
              </button>
            </div>
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        {producto.descripcion && (
          <div className="mt-12 bg-[#1f1f1f] rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl text-white font-bold mb-6">
              Descripción del producto
            </h2>
            {renderDescripcion(producto.descripcion)}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductoDetallado;
