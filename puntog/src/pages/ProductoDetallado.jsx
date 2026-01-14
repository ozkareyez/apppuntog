import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  Tag,
  Heart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Check,
  Package,
  Share2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { API_URL } from "@/config";
import { motion, AnimatePresence } from "framer-motion";

const ProductoDetallado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [producto, setProducto] = useState(null);
  const [recomendados, setRecomendados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("descripcion");

  const carruselRef = useRef(null);
  const imageGallery = [1, 2, 3, 4]; // Placeholder para múltiples imágenes

  /* ================= HELPERS ================= */
  const getImageSrc = (imagen) => {
    if (!imagen) return "/imagenes/no-image.png";
    if (imagen.startsWith("http://"))
      return imagen.replace("http://", "https://");
    if (imagen.startsWith("https://")) return imagen;
    return `${API_URL}/images/${imagen}`;
  };

  const scrollCarrusel = (direccion) => {
    if (!carruselRef.current) return;
    const ancho = carruselRef.current.offsetWidth;
    carruselRef.current.scrollBy({
      left: direccion === "left" ? -ancho : ancho,
      behavior: "smooth",
    });
  };

  const handleAddToCart = () => {
    Array.from({ length: cantidad }).forEach(() => addToCart(producto));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  /* ================= FETCH PRODUCTO ================= */
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

  /* ================= FETCH RECOMENDADOS ================= */
  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/api/productos-recomendados/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRecomendados(Array.isArray(data) ? data : []);
      })
      .catch(() => setRecomendados([]));
  }, [id]);

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto mb-6" />
          <p className="text-gray-600">Cargando detalles del producto...</p>
        </div>
      </div>
    );
  }

  /* ================= ERROR STATE ================= */
  if (error || !producto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tag className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Producto no encontrado
          </h2>
          <p className="text-gray-600 mb-8">
            El producto que buscas no está disponible o ha sido movido.
          </p>
          <button
            onClick={() => navigate("/productos")}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-600/30 transition"
          >
            Ver todos los productos
          </button>
        </div>
      </div>
    );
  }

  const precio = Number(producto.precio ?? 0);
  const precioAntes = Number(producto.precio_antes ?? 0);
  const esOferta = producto.es_oferta && precioAntes > precio;
  const descuento = esOferta ? Math.round((1 - precio / precioAntes) * 100) : 0;

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* BREADCRUMB */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-red-600 transition"
            >
              Inicio
            </button>
            <span className="text-gray-400">/</span>
            <button
              onClick={() => navigate("/productos")}
              className="text-gray-600 hover:text-red-600 transition"
            >
              Productos
            </button>
            <span className="text-gray-400">/</span>
            <button
              onClick={() =>
                navigate(`/productos?categoria=${producto.categoria_slug}`)
              }
              className="text-gray-600 hover:text-red-600 transition"
            >
              {producto.categoria_nombre}
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {producto.nombre}
            </span>
          </nav>
        </div>
      </div>

      {/* MAIN PRODUCT SECTION */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* IMAGE GALLERY */}
            <div className="space-y-4">
              {/* MAIN IMAGE */}
              <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 overflow-hidden h-[500px]">
                {esOferta && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-6 left-6 z-20"
                  >
                    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-red-600/30">
                      -{descuento}% OFF
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="absolute top-6 right-6 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg"
                >
                  <Heart
                    size={20}
                    className={
                      isWishlisted
                        ? "fill-red-600 text-red-600"
                        : "text-gray-600"
                    }
                  />
                </motion.button>

                <div className="absolute bottom-6 left-6 z-20">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-700">
                    📸 {selectedImage + 1} de {imageGallery.length}
                  </div>
                </div>

                <img
                  src={getImageSrc(producto.imagen)}
                  alt={producto.nombre}
                  className="w-full h-full object-contain p-8"
                />

                {/* IMAGE NAVIGATION */}
                <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform">
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform">
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* THUMBNAILS */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {imageGallery.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all ${
                      selectedImage === index
                        ? "border-red-600"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <img
                        src={getImageSrc(producto.imagen)}
                        alt={`Vista ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* PRODUCT INFO */}
            <div className="space-y-8">
              {/* HEADER */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    {producto.categoria_nombre}
                  </span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      (4.8 · 128 reseñas)
                    </span>
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {producto.nombre}
                </h1>

                <p className="text-gray-600 text-lg">
                  {producto.descripcion_breve ||
                    "Producto premium de alta calidad para momentos especiales"}
                </p>
              </div>

              {/* PRICING */}
              <div className="space-y-3">
                {esOferta && (
                  <div className="flex items-center gap-4">
                    <span className="text-2xl text-gray-400 line-through">
                      ${precioAntes.toLocaleString()}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded-full">
                      Ahorras ${(precioAntes - precio).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <span className="text-5xl font-bold text-red-600">
                    ${precio.toLocaleString()}
                  </span>
                  {esOferta && (
                    <span className="text-sm text-gray-500">IVA incluido</span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Disponibilidad:</span>
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <Check size={16} />
                    En stock ({producto.stock || 10} unidades)
                  </span>
                </div>
              </div>

              {/* QUANTITY & ACTIONS */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <span className="font-medium text-gray-900">Cantidad:</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        className="px-4 py-3 hover:bg-gray-100 transition"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="px-6 py-3 font-semibold text-lg min-w-[60px] text-center">
                        {cantidad}
                      </span>
                      <button
                        onClick={() => setCantidad(cantidad + 1)}
                        className="px-4 py-3 hover:bg-gray-100 transition"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <span className="text-gray-600">
                      Total:{" "}
                      <span className="font-bold text-red-600">
                        ${(precio * cantidad).toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/30"
                  >
                    {addedToCart ? (
                      <>
                        <Check size={20} />
                        ¡Agregado!
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Agregar al carrito
                      </>
                    )}
                  </motion.button>

                  <button className="px-8 py-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 transition">
                    Comprar ahora
                  </button>
                </div>

                <button className="w-full py-3 rounded-xl border border-gray-300 font-medium flex items-center justify-center gap-2 hover:border-red-600 hover:text-red-600 transition">
                  <Heart size={18} />
                  {isWishlisted ? "En favoritos" : "Agregar a favoritos"}
                </button>
              </div>

              {/* BENEFITS */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Truck className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">
                    Envío gratis
                  </p>
                  <p className="text-xs text-gray-600">Compra mínima $150K</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">
                    Pago seguro
                  </p>
                  <p className="text-xs text-gray-600">Datos encriptados</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <RefreshCw className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">
                    Devoluciones
                  </p>
                  <p className="text-xs text-gray-600">30 días garantía</p>
                </div>
              </div>

              {/* SHARE */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <span className="text-gray-700 font-medium">Compartir:</span>
                <div className="flex gap-2">
                  {["📱", "📧", "📘", "🐦"].map((icon, i) => (
                    <button
                      key={i}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DETAILS TABS */}
          <div className="mt-16">
            <div className="border-b border-gray-200">
              <nav className="flex gap-8">
                {["descripcion", "especificaciones", "envios", "resenas"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 font-medium text-lg relative ${
                        activeTab === tab
                          ? "text-red-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab === "descripcion" && "Descripción"}
                      {tab === "especificaciones" && "Especificaciones"}
                      {tab === "envios" && "Envíos y Devoluciones"}
                      {tab === "resenas" && "Reseñas"}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                        />
                      )}
                    </button>
                  )
                )}
              </nav>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="py-8"
              >
                {activeTab === "descripcion" && (
                  <div className="prose prose-lg max-w-none">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Detalles del producto
                    </h3>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                      <p>
                        {producto.descripcion ||
                          "Producto premium de alta calidad, diseñado para ofrecer la mejor experiencia. Fabricado con materiales cuidadosamente seleccionados y atención al detalle."}
                      </p>
                      <ul className="space-y-3">
                        {[
                          "Materiales de primera calidad",
                          "Diseño ergonómico y cómodo",
                          "Lavable y duradero",
                          "Empaque discreto",
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "especificaciones" && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Especificaciones técnicas
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { label: "Material", value: "Encaje francés" },
                        { label: "Color", value: "Rojo pasión" },
                        { label: "Tallas disponibles", value: "S, M, L" },
                        { label: "País de origen", value: "Colombia" },
                        { label: "Cuidados", value: "Lavable a mano" },
                        { label: "Garantía", value: "30 días" },
                      ].map((spec, i) => (
                        <div key={i} className="border-b border-gray-200 pb-3">
                          <span className="text-gray-600">{spec.label}:</span>
                          <span className="font-medium text-gray-900 ml-2">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {recomendados.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  También te puede interesar
                </h2>
                <p className="text-gray-600">
                  Productos relacionados que podrían gustarte
                </p>
              </div>
              <div className="hidden md:flex gap-3">
                <button
                  onClick={() => scrollCarrusel("left")}
                  className="p-3 rounded-full border border-gray-300 bg-white hover:border-red-600 hover:text-red-600 transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scrollCarrusel("right")}
                  className="p-3 rounded-full border border-gray-300 bg-white hover:border-red-600 hover:text-red-600 transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div
              ref={carruselRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-6 snap-x snap-mandatory scrollbar-hide"
            >
              {recomendados.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  onClick={() => navigate(`/productos/${p.id}`)}
                  className="snap-start min-w-[280px] max-w-[280px] bg-white rounded-2xl border border-gray-200 cursor-pointer overflow-hidden hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 group"
                >
                  <div className="relative h-64 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
                    {p.es_oferta && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                        OFERTA
                      </div>
                    )}
                    <img
                      src={getImageSrc(p.imagen)}
                      alt={p.nombre}
                      className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className="fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                      {p.nombre}
                    </h3>
                    <p className="text-red-600 text-xl font-bold mb-4">
                      ${Number(p.precio).toLocaleString()}
                    </p>
                    <button className="w-full py-2.5 rounded-xl font-medium border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 transition">
                      Ver producto
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-2">
                ¿Tienes preguntas sobre este producto?
              </h3>
              <p className="text-red-100">
                Nuestro equipo de asesores está listo para ayudarte
              </p>
            </div>
            <button className="px-8 py-3 bg-white text-red-600 font-semibold rounded-xl hover:bg-gray-100 transition whitespace-nowrap">
              Contactar asesor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetallado;

// import { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   ShoppingCart,
//   ArrowLeft,
//   Tag,
//   Heart,
//   Minus,
//   Plus,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { useCart } from "@/context/CartContext";
// import { API_URL } from "@/config";

// const ProductoDetallado = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { addToCart } = useCart();

//   const [producto, setProducto] = useState(null);
//   const [recomendados, setRecomendados] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [cantidad, setCantidad] = useState(1);
//   const [error, setError] = useState(null);

//   const carruselRef = useRef(null);

//   /* ================= HELPERS ================= */

//   const getImageSrc = (imagen) => {
//     if (!imagen) return "/imagenes/no-image.png";
//     if (imagen.startsWith("http://"))
//       return imagen.replace("http://", "https://");
//     if (imagen.startsWith("https://")) return imagen;
//     return `${API_URL}/images/${imagen}`;
//   };

//   const scrollCarrusel = (direccion) => {
//     if (!carruselRef.current) return;

//     const ancho = carruselRef.current.offsetWidth;
//     carruselRef.current.scrollBy({
//       left: direccion === "left" ? -ancho : ancho,
//       behavior: "smooth",
//     });
//   };

//   const renderDescripcion = (texto) => {
//     if (!texto) return null;

//     const partes = texto
//       .split("*")
//       .map((t) => t.trim())
//       .filter(Boolean);

//     return (
//       <div className="space-y-5 text-gray-700 leading-relaxed">
//         {partes[0] && (
//           <p>
//             {partes[0].split(",").map((frase, i) => (
//               <span key={i} className="block mb-2">
//                 {frase.trim()}.
//               </span>
//             ))}
//           </p>
//         )}

//         {partes.length > 1 && (
//           <ul className="space-y-3">
//             {partes.slice(1).map((item, i) => (
//               <li key={i} className="flex gap-3">
//                 <span className="text-red-600 font-bold">•</span>
//                 <span>{item}</span>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     );
//   };

//   /* ================= FETCH PRODUCTO ================= */

//   useEffect(() => {
//     setLoading(true);
//     setError(null);

//     fetch(`${API_URL}/api/productos/${id}`)
//       .then((res) => {
//         if (!res.ok) throw new Error("Producto no encontrado");
//         return res.json();
//       })
//       .then((data) => {
//         setProducto(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError(err.message);
//         setLoading(false);
//       });
//   }, [id]);

//   /* ================= FETCH RECOMENDADOS ================= */

//   useEffect(() => {
//     if (!id) return;

//     fetch(`${API_URL}/api/productos-recomendados/${id}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setRecomendados(Array.isArray(data) ? data : []);
//       })
//       .catch(() => setRecomendados([]));
//   }, [id]);

//   /* ================= ESTADOS ================= */

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="h-14 w-14 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
//       </div>
//     );
//   }

//   if (error || !producto) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-center">
//         <div>
//           <h2 className="text-3xl font-bold mb-4">Producto no encontrado</h2>
//           <button
//             onClick={() => navigate("/productos")}
//             className="bg-red-600 text-white px-8 py-3 rounded-xl"
//           >
//             Volver a productos
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const precio = Number(producto.precio ?? 0);
//   const precioAntes = Number(producto.precio_antes ?? 0);
//   const esOferta = producto.es_oferta && precioAntes > precio;

//   /* ================= RENDER ================= */

//   return (
//     <section className="bg-white py-12">
//       <div className="max-w-7xl mx-auto px-4">
//         {/* VOLVER */}
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 text-gray-600 hover:text-red-600 mb-8"
//         >
//           <ArrowLeft size={18} />
//           Volver
//         </button>

//         {/* PRODUCTO */}
//         <div className="grid md:grid-cols-2 gap-12">
//           <div className="relative bg-gray-50 rounded-2xl border flex items-center justify-center h-[500px]">
//             {esOferta && producto.descuento && (
//               <span className="absolute top-5 left-5 bg-red-600 text-white px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-bold">
//                 <Tag size={16} />
//                 {producto.descuento}% OFF
//               </span>
//             )}

//             <img
//               src={getImageSrc(producto.imagen)}
//               alt={producto.nombre}
//               className="max-h-full max-w-full object-contain"
//             />
//           </div>

//           <div className="flex flex-col justify-between">
//             <div className="space-y-6">
//               <h1 className="text-3xl font-bold">{producto.nombre}</h1>

//               <div className="bg-gray-50 p-6 rounded-xl border">
//                 {esOferta && (
//                   <p className="text-gray-400 line-through text-lg">
//                     ${precioAntes.toLocaleString()}
//                   </p>
//                 )}
//                 <p className="text-red-600 text-4xl font-bold">
//                   ${precio.toLocaleString()}
//                 </p>
//               </div>
//             </div>

//             <div className="space-y-5 mt-8">
//               <div className="flex items-center gap-4">
//                 <span className="font-semibold">Cantidad:</span>
//                 <div className="flex items-center border rounded-xl">
//                   <button
//                     onClick={() => setCantidad(Math.max(1, cantidad - 1))}
//                     className="px-4 py-2"
//                   >
//                     <Minus />
//                   </button>
//                   <span className="px-6 font-semibold">{cantidad}</span>
//                   <button
//                     onClick={() => setCantidad(cantidad + 1)}
//                     className="px-4 py-2"
//                   >
//                     <Plus />
//                   </button>
//                 </div>
//               </div>

//               <button
//                 onClick={() =>
//                   Array.from({ length: cantidad }).forEach(() =>
//                     addToCart(producto)
//                   )
//                 }
//                 className="w-full bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3"
//               >
//                 <ShoppingCart />
//                 Agregar al carrito
//               </button>

//               <button className="w-full border py-3 rounded-xl flex items-center justify-center gap-2">
//                 <Heart />
//                 Favoritos
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* DESCRIPCIÓN */}
//         {producto.descripcion && (
//           <div className="mt-14 bg-gray-50 rounded-2xl p-8 border">
//             <h2 className="text-2xl font-bold mb-6 text-red-600">
//               Descripción del producto
//             </h2>
//             {renderDescripcion(producto.descripcion)}
//           </div>
//         )}

//         {/* RECOMENDADOS */}
//         {recomendados.length > 0 && (
//           <section className="mt-24">
//             {/* HEADER */}
//             <div className="flex items-center justify-between mb-8 text-red-500">
//               <h2 className="text-2xl md:text-3xl font-bold">
//                 También te puede interesar
//               </h2>

//               <div className="hidden md:flex gap-3">
//                 <button
//                   onClick={() => scrollCarrusel("left")}
//                   className="p-2 rounded-full border bg-white hover:bg-gray-100 transition"
//                 >
//                   <ChevronLeft />
//                 </button>
//                 <button
//                   onClick={() => scrollCarrusel("right")}
//                   className="p-2 rounded-full border bg-white hover:bg-gray-100 transition"
//                 >
//                   <ChevronRight />
//                 </button>
//               </div>
//             </div>

//             {/* CARRUSEL */}
//             <div
//               ref={carruselRef}
//               className="flex gap-6 overflow-x-auto scroll-smooth pb-6 snap-x snap-mandatory scrollbar-hide"
//             >
//               {recomendados.map((p) => (
//                 <article
//                   key={p.id}
//                   onClick={() => navigate(`/productos/${p.id}`)}
//                   className="snap-start min-w-[240px] max-w-[240px] bg-white border rounded-2xl cursor-pointer
//                      hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
//                 >
//                   {/* IMAGEN */}
//                   <div className="relative h-48 bg-gray-50 rounded-t-2xl flex items-center justify-center overflow-hidden">
//                     <img
//                       src={getImageSrc(p.imagen)}
//                       alt={p.nombre}
//                       className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
//                     />
//                   </div>

//                   {/* INFO */}
//                   <div className="p-4 space-y-2">
//                     <p className="text-sm font-semibold line-clamp-2 min-h-[40px]">
//                       {p.nombre}
//                     </p>

//                     <p className="text-red-600 text-lg font-bold">
//                       ${Number(p.precio).toLocaleString()}
//                     </p>

//                     {/* CTA */}
//                     <span className="inline-block mt-2 text-sm font-medium text-red-600 opacity-0 group-hover:opacity-100 transition">
//                       Ver producto →
//                     </span>
//                   </div>
//                 </article>
//               ))}
//             </div>
//           </section>
//         )}
//       </div>
//     </section>
//   );
// };

// export default ProductoDetallado;
