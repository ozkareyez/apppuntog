import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
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
  Maximize2,
  ZoomIn,
  X,
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const carruselRef = useRef(null);

  /* ================= FUNCIÓN SIMPLIFICADA PARA OBTENER IMÁGENES ================= */
  const getImages = () => {
    if (!producto) {
      return ["/imagenes/no-image.png"];
    }

    console.log("🔍 Buscando imágenes en producto...");

    // Opción 1: Usar array imagenes si existe
    if (
      producto.imagenes &&
      Array.isArray(producto.imagenes) &&
      producto.imagenes.length > 0
    ) {
      console.log(
        `✅ Usando array 'imagenes' con ${producto.imagenes.length} imágenes`,
      );
      return producto.imagenes.filter((img) => img && img !== "null");
    }

    // Opción 2: Buscar en campos individuales
    console.log("🔍 Buscando en campos individuales...");
    const images = [];

    const campos = [
      { nombre: "imagen_cloud1", valor: producto.imagen_cloud1 },
      { nombre: "imagen_cloud2", valor: producto.imagen_cloud2 },
      { nombre: "imagen_cloud3", valor: producto.imagen_cloud3 },
      { nombre: "imagen", valor: producto.imagen },
    ];

    campos.forEach(({ nombre, valor }) => {
      if (valor && valor !== "null" && valor !== "") {
        images.push(valor);
        console.log(`✅ Encontrado en ${nombre}: ${valor.substring(0, 50)}...`);
      }
    });

    if (images.length > 0) {
      console.log(`📸 ${images.length} imágenes encontradas`);
      return images;
    }

    // Opción 3: Placeholder
    console.log("⚠️ No hay imágenes, usando placeholder");
    return ["/imagenes/no-image.png"];
  };

  const scrollCarrusel = (direccion) => {
    if (!carruselRef.current) return;
    const ancho = carruselRef.current.offsetWidth;
    carruselRef.current.scrollBy({
      left: direccion === "left" ? -ancho : ancho,
      behavior: "smooth",
    });
  };

  /* ================= handleAddToCart CORREGIDA ================= */
  const handleAddToCart = () => {
    if (!producto) {
      console.error("❌ No hay producto para agregar al carrito");
      return;
    }

    console.log("🛒 Agregando producto al carrito:", producto.nombre);

    // Agregar la cantidad especificada
    for (let i = 0; i < cantidad; i++) {
      addToCart({
        ...producto,
        precio: Number(producto.precio) || 0,
        imagenes: getImages(),
      });
    }

    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  const nextImage = () => {
    const images = getImages();
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getImages();
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const openFullscreen = (index) => {
    setSelectedImage(index);
    setIsFullscreen(true);
    document.body.style.overflow = "hidden";
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    document.body.style.overflow = "auto";
  };

  /* ================= FETCH PRODUCTO ================= */
  useEffect(() => {
    const fetchProducto = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`🔍 Fetching producto ID: ${id}`);
        const res = await fetch(`${API_URL}/api/productos/${id}`);

        if (!res.ok) {
          throw new Error("Producto no encontrado");
        }

        const data = await res.json();

        console.log("=".repeat(60));
        console.log("📦 PRODUCTO RECIBIDO DEL BACKEND:");
        console.log("- ID:", data.id);
        console.log("- Nombre:", data.nombre);
        console.log("- ¿Tiene array 'imagenes'?:", "imagenes" in data);
        console.log("- Tipo de 'imagenes':", typeof data.imagenes);
        console.log("- Es array?:", Array.isArray(data.imagenes));

        if (Array.isArray(data.imagenes)) {
          console.log(
            `- Cantidad de imágenes en array: ${data.imagenes.length}`,
          );
          data.imagenes.forEach((img, i) => {
            console.log(`  Imagen ${i}: ${img?.substring(0, 70)}...`);
          });
        } else {
          console.log("- Array 'imagenes' NO está definido o no es array");
        }

        console.log("- Campos individuales:");
        console.log("  imagen_cloud1:", data.imagen_cloud1);
        console.log("  imagen_cloud2:", data.imagen_cloud2);
        console.log("  imagen_cloud3:", data.imagen_cloud3);
        console.log("  imagen:", data.imagen);
        console.log("=".repeat(60));

        setProducto(data);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error al cargar producto:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id]);

  /* ================= FETCH RECOMENDADOS ================= */
  useEffect(() => {
    if (!id) return;

    const fetchRecomendados = async () => {
      try {
        const res = await fetch(`${API_URL}/api/productos-recomendados/${id}`);
        const data = await res.json();
        setRecomendados(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error al cargar recomendados:", err);
        setRecomendados([]);
      }
    };

    fetchRecomendados();
  }, [id]);

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

  if (error || !producto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Producto no encontrado
          </h2>
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

  const images = getImages();
  console.log("🖼️ Imágenes finales para mostrar:", images);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* MODAL DE IMAGEN A PANTALLA COMPLETA */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
            onClick={closeFullscreen}
          >
            <button
              onClick={closeFullscreen}
              className="absolute top-6 right-6 z-10 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <motion.img
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={images[selectedImage]}
              alt={`${producto.nombre} - Imagen ${selectedImage + 1}`}
              className="max-w-full max-h-[90vh] object-contain cursor-zoom-out"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white text-center">
              <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <ZoomIn className="w-4 h-4" />
                <span className="text-sm">
                  {selectedImage + 1} / {images.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              {/* DEBUG INFO */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-800 font-medium">
                    📊 Información del producto:
                  </span>
                </div>
                <div className="text-sm">
                  <div className="mb-1">
                    <span className="font-medium">ID:</span> {producto.id}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Total de imágenes:</span>{" "}
                    {images.length}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Categoría:</span>{" "}
                    {producto.categoria_nombre}
                  </div>
                  <div>
                    <span className="font-medium">Estado:</span>{" "}
                    {producto.activo ? "✅ Activo" : "❌ Inactivo"}
                  </div>
                </div>
              </div>

              {/* MAIN IMAGE */}
              <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 overflow-hidden h-[500px] group">
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
                  className="absolute top-6 right-14 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg"
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

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openFullscreen(selectedImage)}
                  className="absolute top-6 right-6 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Maximize2 size={20} className="text-gray-600" />
                </motion.button>

                {images.length > 1 && (
                  <div className="absolute bottom-6 left-6 z-20">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-700">
                      📸 {selectedImage + 1} de {images.length}
                    </div>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.img
                    key={images[selectedImage]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    src={images[selectedImage]}
                    alt={`${producto.nombre} - Imagen ${selectedImage + 1}`}
                    className="w-full h-full object-contain p-8 cursor-zoom-in"
                    onClick={() => openFullscreen(selectedImage)}
                    onError={(e) => {
                      console.error(
                        `❌ Error cargando imagen: ${images[selectedImage]}`,
                      );
                      e.target.src = "/imagenes/no-image.png";
                    }}
                  />
                </AnimatePresence>

                {/* IMAGE NAVIGATION */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}
              </div>

              {/* THUMBNAILS */}
              {images.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-800">
                      Imágenes ({images.length})
                    </h4>
                    {images.length > 1 && (
                      <div className="flex gap-1">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              selectedImage === index
                                ? "bg-red-600 scale-125"
                                : "bg-gray-300 hover:bg-gray-400"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-shrink-0 w-24 h-24 rounded-xl border-2 overflow-hidden transition-all relative ${
                          selectedImage === index
                            ? "border-red-600 shadow-lg shadow-red-600/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center relative group">
                          <img
                            src={img}
                            alt={`Vista ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(
                                `❌ Error cargando thumbnail: ${img}`,
                              );
                              e.target.src = "/imagenes/no-image.png";
                            }}
                          />
                        </div>
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-black/70 text-white text-xs rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCT INFO */}
            <div className="space-y-8">
              {/* HEADER */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    {producto.categoria_nombre}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" />
                    {images.length}{" "}
                    {images.length === 1 ? "imagen" : "imágenes"}
                  </span>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {producto.nombre}
                </h1>
                <p className="text-gray-600 text-lg">
                  {producto.descripcion || "Producto premium de alta calidad"}
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

                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="w-full py-3 rounded-xl border border-gray-300 font-medium flex items-center justify-center gap-2 hover:border-red-600 hover:text-red-600 transition"
                >
                  <Heart
                    size={18}
                    className={isWishlisted ? "fill-red-600 text-red-600" : ""}
                  />
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
            </div>
          </div>
        </div>
      </section>
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
//   Star,
//   Truck,
//   Shield,
//   RefreshCw,
//   Check,
//   Package,
//   Share2,
//   Maximize2,
//   ZoomIn,
//   X,
// } from "lucide-react";
// import { useCart } from "@/context/CartContext";
// import { API_URL } from "@/config";
// import { motion, AnimatePresence } from "framer-motion";

// const ProductoDetallado = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { addToCart } = useCart();

//   const [producto, setProducto] = useState(null);
//   const [recomendados, setRecomendados] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [cantidad, setCantidad] = useState(1);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [isWishlisted, setIsWishlisted] = useState(false);
//   const [addedToCart, setAddedToCart] = useState(false);
//   const [activeTab, setActiveTab] = useState("descripcion");
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [autoPlay, setAutoPlay] = useState(false);

//   const carruselRef = useRef(null);
//   const autoPlayRef = useRef(null);

//   /* ================= FUNCIÓN MEJORADA PARA OBTENER IMÁGENES ================= */
//   const getImages = () => {
//     if (!producto) {
//       console.log("❌ No hay producto disponible");
//       return ["/imagenes/no-image.png"];
//     }

//     console.log("🔍 PRODUCTO RECIBIDO:", producto);
//     console.log("🔍 Campos de imágenes del producto:", {
//       imagenes: producto.imagenes,
//       imagen_cloud1: producto.imagen_cloud1,
//       imagen_cloud2: producto.imagen_cloud2,
//       imagen_cloud3: producto.imagen_cloud3,
//       imagen: producto.imagen,
//     });

//     const images = [];

//     // 1. PRIMERO: Buscar en el array 'imagenes' si existe y tiene elementos
//     if (producto.imagenes && Array.isArray(producto.imagenes)) {
//       console.log("📦 Array 'imagenes' encontrado:", producto.imagenes);

//       producto.imagenes.forEach((img, index) => {
//         if (img) {
//           if (typeof img === "object" && img !== null) {
//             // Si es objeto, extraer la URL
//             const url = img.url || img;
//             if (url && url.trim() !== "") {
//               images.push(url);
//               console.log(`✅ Imagen ${index + 1} del array: ${url}`);
//             }
//           } else if (typeof img === "string" && img.trim() !== "") {
//             // Si es string directo
//             images.push(img);
//             console.log(`✅ Imagen ${index + 1} del array (string): ${img}`);
//           }
//         }
//       });
//     }

//     // 2. SEGUNDO: Si no hay imágenes en el array, buscar en campos individuales de Cloudinary
//     if (images.length === 0) {
//       console.log("🔍 Buscando en campos Cloudinary individuales...");

//       // Campos Cloudinary a verificar
//       const cloudFields = [
//         { field: "imagen_cloud1", value: producto.imagen_cloud1 },
//         { field: "imagen_cloud2", value: producto.imagen_cloud2 },
//         { field: "imagen_cloud3", value: producto.imagen_cloud3 },
//       ];

//       cloudFields.forEach(({ field, value }, index) => {
//         if (value && typeof value === "string" && value.trim() !== "") {
//           images.push(value);
//           console.log(`✅ ${field}: ${value}`);
//         }
//       });
//     }

//     // 3. TERCERO: Si aún no hay imágenes, usar imagen principal
//     if (
//       images.length === 0 &&
//       producto.imagen &&
//       producto.imagen.trim() !== ""
//     ) {
//       console.log("✅ Usando imagen principal:", producto.imagen);
//       images.push(producto.imagen);
//     }

//     // 4. Si no hay ninguna imagen, usar placeholder
//     if (images.length === 0) {
//       console.log("⚠️ No se encontraron imágenes, usando placeholder");
//       return ["/imagenes/no-image.png"];
//     }

//     console.log(`🎉 Total de imágenes encontradas: ${images.length}`);
//     console.log("📸 URLs finales:", images);
//     return images;
//   };

//   const scrollCarrusel = (direccion) => {
//     if (!carruselRef.current) return;
//     const ancho = carruselRef.current.offsetWidth;
//     carruselRef.current.scrollBy({
//       left: direccion === "left" ? -ancho : ancho,
//       behavior: "smooth",
//     });
//   };

//   const handleAddToCart = () => {
//     if (!producto) return;

//     // Agregar la cantidad especificada
//     for (let i = 0; i < cantidad; i++) {
//       addToCart(producto);
//     }

//     setAddedToCart(true);
//     setTimeout(() => setAddedToCart(false), 3000);
//   };

//   const nextImage = () => {
//     const images = getImages();
//     setSelectedImage((prev) => (prev + 1) % images.length);
//   };

//   const prevImage = () => {
//     const images = getImages();
//     setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
//   };

//   // Función para abrir imagen en pantalla completa
//   const openFullscreen = (index) => {
//     setSelectedImage(index);
//     setIsFullscreen(true);
//     document.body.style.overflow = "hidden";
//   };

//   const closeFullscreen = () => {
//     setIsFullscreen(false);
//     document.body.style.overflow = "auto";
//   };

//   // Auto-play de imágenes
//   useEffect(() => {
//     if (autoPlay) {
//       autoPlayRef.current = setInterval(() => {
//         nextImage();
//       }, 3000);
//     } else {
//       clearInterval(autoPlayRef.current);
//     }

//     return () => clearInterval(autoPlayRef.current);
//   }, [autoPlay]);

//   // Manejar tecla ESC para salir de pantalla completa
//   useEffect(() => {
//     const handleEsc = (e) => {
//       if (e.key === "Escape" && isFullscreen) {
//         closeFullscreen();
//       }
//     };

//     document.addEventListener("keydown", handleEsc);
//     return () => document.removeEventListener("keydown", handleEsc);
//   }, [isFullscreen]);

//   /* ================= FETCH PRODUCTO ================= */
//   useEffect(() => {
//     const fetchProducto = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         console.log(`🔍 Fetching producto ID: ${id}`);
//         const res = await fetch(`${API_URL}/api/productos/${id}`);

//         if (!res.ok) {
//           throw new Error("Producto no encontrado");
//         }

//         const data = await res.json();

//         console.log("📦 DATOS RECIBIDOS DEL BACKEND:", data);
//         console.log("🔍 Información de imágenes recibida:", {
//           imagenes: data.imagenes,
//           imagen_cloud1: data.imagen_cloud1,
//           imagen_cloud2: data.imagen_cloud2,
//           imagen_cloud3: data.imagen_cloud3,
//           imagen: data.imagen,
//         });

//         // Probar la función getImages con los datos recibidos
//         const testImages = getImages.call({ producto: data });
//         console.log("🖼️ Imágenes extraídas en test:", testImages);

//         setProducto(data);
//         setLoading(false);
//       } catch (err) {
//         console.error("❌ Error al cargar producto:", err);
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchProducto();
//   }, [id]);

//   /* ================= FETCH RECOMENDADOS ================= */
//   useEffect(() => {
//     if (!id) return;

//     const fetchRecomendados = async () => {
//       try {
//         console.log(`🔍 Fetching recomendados para ID: ${id}`);
//         const res = await fetch(`${API_URL}/api/productos-recomendados/${id}`);
//         const data = await res.json();
//         console.log("📦 Recomendados recibidos:", data);
//         setRecomendados(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error("❌ Error al cargar recomendados:", err);
//         setRecomendados([]);
//       }
//     };

//     fetchRecomendados();
//   }, [id]);

//   /* ================= LOADING STATE ================= */
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
//         <div className="text-center">
//           <div className="h-20 w-20 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto mb-6" />
//           <p className="text-gray-600">Cargando detalles del producto...</p>
//         </div>
//       </div>
//     );
//   }

//   /* ================= ERROR STATE ================= */
//   if (error || !producto) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
//         <div className="text-center p-8 max-w-md">
//           <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
//             <Tag className="w-12 h-12 text-red-400" />
//           </div>
//           <h2 className="text-3xl font-bold text-gray-900 mb-4">
//             Producto no encontrado
//           </h2>
//           <p className="text-gray-600 mb-8">
//             El producto que buscas no está disponible o ha sido movido.
//           </p>
//           <button
//             onClick={() => navigate("/productos")}
//             className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-600/30 transition"
//           >
//             Ver todos los productos
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const precio = Number(producto.precio ?? 0);
//   const precioAntes = Number(producto.precio_antes ?? 0);
//   const esOferta = producto.es_oferta && precioAntes > precio;
//   const descuento = esOferta ? Math.round((1 - precio / precioAntes) * 100) : 0;

//   const images = getImages();
//   console.log("🖼️ Imágenes finales para mostrar:", images);

//   /* ================= RENDER ================= */
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
//       {/* MODAL DE IMAGEN A PANTALLA COMPLETA */}
//       <AnimatePresence>
//         {isFullscreen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
//             onClick={closeFullscreen}
//           >
//             <button
//               onClick={closeFullscreen}
//               className="absolute top-6 right-6 z-10 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
//             >
//               <X className="w-6 h-6 text-white" />
//             </button>

//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 prevImage();
//               }}
//               className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
//             >
//               <ChevronLeft className="w-6 h-6 text-white" />
//             </button>

//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 nextImage();
//               }}
//               className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
//             >
//               <ChevronRight className="w-6 h-6 text-white" />
//             </button>

//             <motion.img
//               key={selectedImage}
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//               src={images[selectedImage]}
//               alt={`${producto.nombre} - Imagen ${selectedImage + 1}`}
//               className="max-w-full max-h-[90vh] object-contain cursor-zoom-out"
//               onClick={(e) => e.stopPropagation()}
//             />

//             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white text-center">
//               <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
//                 <ZoomIn className="w-4 h-4" />
//                 <span className="text-sm">
//                   {selectedImage + 1} / {images.length}
//                 </span>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* BREADCRUMB */}
//       <div className="bg-white border-b">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <nav className="flex items-center gap-2 text-sm">
//             <button
//               onClick={() => navigate("/")}
//               className="text-gray-600 hover:text-red-600 transition"
//             >
//               Inicio
//             </button>
//             <span className="text-gray-400">/</span>
//             <button
//               onClick={() => navigate("/productos")}
//               className="text-gray-600 hover:text-red-600 transition"
//             >
//               Productos
//             </button>
//             <span className="text-gray-400">/</span>
//             <button
//               onClick={() =>
//                 navigate(`/productos?categoria=${producto.categoria_slug}`)
//               }
//               className="text-gray-600 hover:text-red-600 transition"
//             >
//               {producto.categoria_nombre}
//             </button>
//             <span className="text-gray-400">/</span>
//             <span className="text-gray-900 font-medium truncate max-w-xs">
//               {producto.nombre}
//             </span>
//           </nav>
//         </div>
//       </div>

//       {/* MAIN PRODUCT SECTION */}
//       <section className="py-12">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="grid lg:grid-cols-2 gap-12">
//             {/* IMAGE GALLERY */}
//             <div className="space-y-4">
//               {/* DEBUG INFO - Temporal para verificar */}
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
//                 <div className="flex items-center gap-2">
//                   <span className="text-yellow-800 font-medium">
//                     Debug Info:
//                   </span>
//                   <span className="text-yellow-700 text-sm">
//                     Imágenes encontradas: {images.length} | Array:{" "}
//                     {producto.imagenes?.length || 0} | Cloud1:{" "}
//                     {producto.imagen_cloud1 ? "✓" : "✗"} | Cloud2:{" "}
//                     {producto.imagen_cloud2 ? "✓" : "✗"} | Cloud3:{" "}
//                     {producto.imagen_cloud3 ? "✓" : "✗"}
//                   </span>
//                 </div>
//               </div>

//               {/* MAIN IMAGE */}
//               <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 overflow-hidden h-[500px] group">
//                 {esOferta && (
//                   <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     className="absolute top-6 left-6 z-20"
//                   >
//                     <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-red-600/30">
//                       -{descuento}% OFF
//                     </div>
//                   </motion.div>
//                 )}

//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => setIsWishlisted(!isWishlisted)}
//                   className="absolute top-6 right-14 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg"
//                 >
//                   <Heart
//                     size={20}
//                     className={
//                       isWishlisted
//                         ? "fill-red-600 text-red-600"
//                         : "text-gray-600"
//                     }
//                   />
//                 </motion.button>

//                 {/* Botón para pantalla completa */}
//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => openFullscreen(selectedImage)}
//                   className="absolute top-6 right-6 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
//                 >
//                   <Maximize2 size={20} className="text-gray-600" />
//                 </motion.button>

//                 {images.length > 1 && (
//                   <div className="absolute bottom-6 left-6 z-20">
//                     <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 flex items-center gap-2">
//                       <span>
//                         📸 {selectedImage + 1} de {images.length}
//                       </span>
//                       {images.length > 1 && (
//                         <button
//                           onClick={() => setAutoPlay(!autoPlay)}
//                           className={`px-2 py-1 text-xs rounded-full ${
//                             autoPlay
//                               ? "bg-green-500 text-white"
//                               : "bg-gray-200 text-gray-700"
//                           }`}
//                         >
//                           {autoPlay ? "⏸️ Pausar" : "▶️ Auto"}
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 <AnimatePresence mode="wait">
//                   <motion.img
//                     key={selectedImage}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ duration: 0.2 }}
//                     src={images[selectedImage]}
//                     alt={producto.nombre}
//                     className="w-full h-full object-contain p-8 cursor-zoom-in"
//                     onClick={() => openFullscreen(selectedImage)}
//                     onError={(e) => {
//                       console.error(
//                         `❌ Error cargando imagen: ${images[selectedImage]}`,
//                       );
//                       e.target.src = "/imagenes/no-image.png";
//                     }}
//                   />
//                 </AnimatePresence>

//                 {/* IMAGE NAVIGATION */}
//                 {images.length > 1 && (
//                   <>
//                     <button
//                       onClick={prevImage}
//                       className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
//                     >
//                       <ChevronLeft className="w-5 h-5 text-gray-700" />
//                     </button>
//                     <button
//                       onClick={nextImage}
//                       className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
//                     >
//                       <ChevronRight className="w-5 h-5 text-gray-700" />
//                     </button>
//                   </>
//                 )}
//               </div>

//               {/* THUMBNAILS */}
//               {images.length > 0 && (
//                 <div className="mt-4">
//                   <div className="flex justify-between items-center mb-3">
//                     <h4 className="font-medium text-gray-800">
//                       Imágenes ({images.length})
//                     </h4>
//                     {images.length > 1 && (
//                       <div className="flex gap-1">
//                         {images.map((_, index) => (
//                           <button
//                             key={index}
//                             onClick={() => setSelectedImage(index)}
//                             className={`w-3 h-3 rounded-full transition-all ${
//                               selectedImage === index
//                                 ? "bg-red-600 scale-125"
//                                 : "bg-gray-300 hover:bg-gray-400"
//                             }`}
//                             aria-label={`Ver imagen ${index + 1}`}
//                           />
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex gap-3 overflow-x-auto pb-2">
//                     {images.map((img, index) => (
//                       <motion.button
//                         key={index}
//                         onClick={() => setSelectedImage(index)}
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         className={`flex-shrink-0 w-24 h-24 rounded-xl border-2 overflow-hidden transition-all relative ${
//                           selectedImage === index
//                             ? "border-red-600 shadow-lg shadow-red-600/20"
//                             : "border-gray-200 hover:border-gray-300"
//                         }`}
//                       >
//                         <div className="w-full h-full bg-gray-100 flex items-center justify-center relative group">
//                           <img
//                             src={img}
//                             alt={`Vista ${index + 1}`}
//                             className="w-full h-full object-cover"
//                             onError={(e) => {
//                               console.error(
//                                 `❌ Error cargando thumbnail: ${img}`,
//                               );
//                               e.target.src = "/imagenes/no-image.png";
//                             }}
//                           />
//                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
//                         </div>
//                         {/* Indicador de número */}
//                         <div className="absolute bottom-1 right-1 w-5 h-5 bg-black/70 text-white text-xs rounded-full flex items-center justify-center">
//                           {index + 1}
//                         </div>
//                       </motion.button>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* PRODUCT INFO */}
//             <div className="space-y-8">
//               {/* HEADER */}
//               <div>
//                 <div className="flex items-center gap-2 mb-3">
//                   <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
//                     {producto.categoria_nombre}
//                   </span>
//                   {images.length > 0 && (
//                     <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full flex items-center gap-1">
//                       <Maximize2 className="w-3 h-3" />
//                       {images.length}{" "}
//                       {images.length === 1 ? "imagen" : "imágenes"}
//                     </span>
//                   )}
//                   <div className="flex items-center">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         size={16}
//                         className="fill-amber-400 text-amber-400"
//                       />
//                     ))}
//                     <span className="ml-2 text-sm text-gray-600">(4.8)</span>
//                   </div>
//                 </div>

//                 <h1 className="text-4xl font-bold text-gray-900 mb-4">
//                   {producto.nombre}
//                 </h1>

//                 <p className="text-gray-600 text-lg">
//                   {producto.descripcion_breve ||
//                     "Producto premium de alta calidad para momentos especiales"}
//                 </p>
//               </div>

//               {/* PRICING */}
//               <div className="space-y-3">
//                 {esOferta && (
//                   <div className="flex items-center gap-4">
//                     <span className="text-2xl text-gray-400 line-through">
//                       ${precioAntes.toLocaleString()}
//                     </span>
//                     <span className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded-full">
//                       Ahorras ${(precioAntes - precio).toLocaleString()}
//                     </span>
//                   </div>
//                 )}

//                 <div className="flex items-end gap-3">
//                   <span className="text-5xl font-bold text-red-600">
//                     ${precio.toLocaleString()}
//                   </span>
//                   {esOferta && (
//                     <span className="text-sm text-gray-500">IVA incluido</span>
//                   )}
//                 </div>

//                 <div className="flex items-center gap-2 text-sm text-gray-600">
//                   <span>Disponibilidad:</span>
//                   <span className="flex items-center gap-1 text-green-600 font-medium">
//                     <Check size={16} />
//                     En stock ({producto.stock || 10} unidades)
//                   </span>
//                 </div>
//               </div>

//               {/* QUANTITY & ACTIONS */}
//               <div className="space-y-6">
//                 <div className="space-y-3">
//                   <span className="font-medium text-gray-900">Cantidad:</span>
//                   <div className="flex items-center gap-4">
//                     <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
//                       <button
//                         onClick={() => setCantidad(Math.max(1, cantidad - 1))}
//                         className="px-4 py-3 hover:bg-gray-100 transition"
//                       >
//                         <Minus size={20} />
//                       </button>
//                       <span className="px-6 py-3 font-semibold text-lg min-w-[60px] text-center">
//                         {cantidad}
//                       </span>
//                       <button
//                         onClick={() => setCantidad(cantidad + 1)}
//                         className="px-4 py-3 hover:bg-gray-100 transition"
//                       >
//                         <Plus size={20} />
//                       </button>
//                     </div>
//                     <span className="text-gray-600">
//                       Total:{" "}
//                       <span className="font-bold text-red-600">
//                         ${(precio * cantidad).toLocaleString()}
//                       </span>
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex flex-col sm:flex-row gap-4">
//                   <motion.button
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={handleAddToCart}
//                     className="flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/30"
//                   >
//                     {addedToCart ? (
//                       <>
//                         <Check size={20} />
//                         ¡Agregado!
//                       </>
//                     ) : (
//                       <>
//                         <ShoppingCart size={20} />
//                         Agregar al carrito
//                       </>
//                     )}
//                   </motion.button>

//                   <button className="px-8 py-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 transition">
//                     Comprar ahora
//                   </button>
//                 </div>

//                 <button
//                   onClick={() => setIsWishlisted(!isWishlisted)}
//                   className="w-full py-3 rounded-xl border border-gray-300 font-medium flex items-center justify-center gap-2 hover:border-red-600 hover:text-red-600 transition"
//                 >
//                   <Heart
//                     size={18}
//                     className={isWishlisted ? "fill-red-600 text-red-600" : ""}
//                   />
//                   {isWishlisted ? "En favoritos" : "Agregar a favoritos"}
//                 </button>
//               </div>

//               {/* BENEFITS */}
//               <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
//                 <div className="text-center p-4 bg-gray-50 rounded-xl">
//                   <Truck className="w-8 h-8 text-red-600 mx-auto mb-2" />
//                   <p className="text-sm font-medium text-gray-900">
//                     Envío gratis
//                   </p>
//                   <p className="text-xs text-gray-600">Compra mínima $150K</p>
//                 </div>
//                 <div className="text-center p-4 bg-gray-50 rounded-xl">
//                   <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
//                   <p className="text-sm font-medium text-gray-900">
//                     Pago seguro
//                   </p>
//                   <p className="text-xs text-gray-600">Datos encriptados</p>
//                 </div>
//                 <div className="text-center p-4 bg-gray-50 rounded-xl">
//                   <RefreshCw className="w-8 h-8 text-red-600 mx-auto mb-2" />
//                   <p className="text-sm font-medium text-gray-900">
//                     Devoluciones
//                   </p>
//                   <p className="text-xs text-gray-600">30 días garantía</p>
//                 </div>
//               </div>

//               {/* SHARE */}
//               <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
//                 <span className="text-gray-700 font-medium">Compartir:</span>
//                 <div className="flex gap-2">
//                   {["📱", "📧", "📘", "🐦"].map((icon, i) => (
//                     <button
//                       key={i}
//                       className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
//                     >
//                       {icon}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* DETAILS TABS */}
//           <div className="mt-16">
//             <div className="border-b border-gray-200">
//               <nav className="flex gap-8">
//                 {["descripcion", "especificaciones", "envios", "resenas"].map(
//                   (tab) => (
//                     <button
//                       key={tab}
//                       onClick={() => setActiveTab(tab)}
//                       className={`py-4 px-1 font-medium text-lg relative ${
//                         activeTab === tab
//                           ? "text-red-600"
//                           : "text-gray-600 hover:text-gray-900"
//                       }`}
//                     >
//                       {tab === "descripcion" && "Descripción"}
//                       {tab === "especificaciones" && "Especificaciones"}
//                       {tab === "envios" && "Envíos y Devoluciones"}
//                       {tab === "resenas" && "Reseñas"}
//                       {activeTab === tab && (
//                         <motion.div
//                           layoutId="activeTab"
//                           className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
//                         />
//                       )}
//                     </button>
//                   ),
//                 )}
//               </nav>
//             </div>

//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={activeTab}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -20 }}
//                 className="py-8"
//               >
//                 {activeTab === "descripcion" && (
//                   <div className="prose prose-lg max-w-none">
//                     <h3 className="text-2xl font-bold text-gray-900 mb-6">
//                       Detalles del producto
//                     </h3>
//                     <div className="space-y-4 text-gray-700 leading-relaxed">
//                       <p>
//                         {producto.descripcion ||
//                           "Producto premium de alta calidad, diseñado para ofrecer la mejor experiencia. Fabricado con materiales cuidadosamente seleccionados y atención al detalle."}
//                       </p>
//                       <ul className="space-y-3">
//                         {[
//                           "Materiales de primera calidad",
//                           "Diseño ergonómico y cómodo",
//                           "Lavable y duradero",
//                           "Empaque discreto",
//                         ].map((item, i) => (
//                           <li key={i} className="flex items-center gap-3">
//                             <div className="w-2 h-2 rounded-full bg-red-600" />
//                             <span>{item}</span>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === "especificaciones" && (
//                   <div className="space-y-6">
//                     <h3 className="text-2xl font-bold text-gray-900">
//                       Especificaciones técnicas
//                     </h3>
//                     <div className="grid md:grid-cols-2 gap-6">
//                       {[
//                         {
//                           label: "Material",
//                           value: producto.color || "Variado",
//                         },
//                         { label: "Color", value: producto.color || "Variado" },
//                         {
//                           label: "Tallas disponibles",
//                           value: producto.talla || "Única",
//                         },
//                         { label: "País de origen", value: "Colombia" },
//                         { label: "Cuidados", value: "Lavable a mano" },
//                         { label: "Garantía", value: "30 días" },
//                       ].map((spec, i) => (
//                         <div key={i} className="border-b border-gray-200 pb-3">
//                           <span className="text-gray-600">{spec.label}:</span>
//                           <span className="font-medium text-gray-900 ml-2">
//                             {spec.value}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </section>

//       {/* RELATED PRODUCTS */}
//       {recomendados.length > 0 && (
//         <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
//           <div className="max-w-7xl mx-auto px-4">
//             <div className="flex items-center justify-between mb-10">
//               <div>
//                 <h2 className="text-3xl font-bold text-gray-900 mb-2">
//                   También te puede interesar
//                 </h2>
//                 <p className="text-gray-600">
//                   Productos relacionados que podrían gustarte
//                 </p>
//               </div>
//               <div className="hidden md:flex gap-3">
//                 <button
//                   onClick={() => scrollCarrusel("left")}
//                   className="p-3 rounded-full border border-gray-300 bg-white hover:border-red-600 hover:text-red-600 transition"
//                 >
//                   <ChevronLeft size={20} />
//                 </button>
//                 <button
//                   onClick={() => scrollCarrusel("right")}
//                   className="p-3 rounded-full border border-gray-300 bg-white hover:border-red-600 hover:text-red-600 transition"
//                 >
//                   <ChevronRight size={20} />
//                 </button>
//               </div>
//             </div>

//             <div
//               ref={carruselRef}
//               className="flex gap-6 overflow-x-auto scroll-smooth pb-6 snap-x snap-mandatory scrollbar-hide"
//             >
//               {recomendados.map((p) => {
//                 // Función para obtener imágenes de productos recomendados
//                 const getProductImages = (prod) => {
//                   const images = [];

//                   // Buscar en array
//                   if (prod.imagenes && Array.isArray(prod.imagenes)) {
//                     prod.imagenes.forEach((img) => {
//                       if (typeof img === "object" && img.url) {
//                         images.push(img.url);
//                       } else if (typeof img === "string") {
//                         images.push(img);
//                       }
//                     });
//                   }

//                   // Buscar en campos Cloudinary
//                   if (images.length === 0) {
//                     [
//                       prod.imagen_cloud1,
//                       prod.imagen_cloud2,
//                       prod.imagen_cloud3,
//                       prod.imagen,
//                     ].forEach((img) => {
//                       if (img && typeof img === "string") {
//                         images.push(img);
//                       }
//                     });
//                   }

//                   return images.length > 0
//                     ? images
//                     : ["/imagenes/no-image.png"];
//                 };

//                 const productoImagenes = getProductImages(p);
//                 const primeraImagen =
//                   productoImagenes.length > 0
//                     ? productoImagenes[0]
//                     : "/imagenes/no-image.png";
//                 const precioProd = Number(p.precio || 0);
//                 const precioAntesProd = Number(p.precio_antes || 0);
//                 const esOfertaProd =
//                   p.es_oferta && precioAntesProd > precioProd;

//                 return (
//                   <motion.div
//                     key={p.id}
//                     initial={{ opacity: 0, y: 20 }}
//                     whileInView={{ opacity: 1, y: 0 }}
//                     onClick={() => navigate(`/productos/${p.id}`)}
//                     className="snap-start min-w-[280px] max-w-[280px] bg-white rounded-2xl border border-gray-200 cursor-pointer overflow-hidden hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 group"
//                   >
//                     <div className="relative h-64 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
//                       {esOfertaProd && (
//                         <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1 rounded-full">
//                           OFERTA
//                         </div>
//                       )}
//                       {productoImagenes.length > 1 && (
//                         <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
//                           +{productoImagenes.length - 1}
//                         </div>
//                       )}
//                       <img
//                         src={primeraImagen}
//                         alt={p.nombre}
//                         className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
//                         onError={(e) => {
//                           e.target.src = "/imagenes/no-image.png";
//                         }}
//                       />
//                     </div>
//                     <div className="p-6">
//                       <div className="flex items-center gap-1 mb-2">
//                         {[...Array(5)].map((_, i) => (
//                           <Star
//                             key={i}
//                             size={12}
//                             className="fill-amber-400 text-amber-400"
//                           />
//                         ))}
//                       </div>
//                       <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
//                         {p.nombre}
//                       </h3>
//                       <p className="text-red-600 text-xl font-bold mb-4">
//                         ${precioProd.toLocaleString()}
//                       </p>
//                       <button className="w-full py-2.5 rounded-xl font-medium border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 transition">
//                         Ver producto
//                       </button>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* CTA BANNER */}
//       <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
//         <div className="max-w-7xl mx-auto px-4 text-center">
//           <div className="flex flex-col md:flex-row items-center justify-between gap-8">
//             <div className="text-left">
//               <h3 className="text-2xl font-bold mb-2">
//                 ¿Tienes preguntas sobre este producto?
//               </h3>
//               <p className="text-red-100">
//                 Nuestro equipo de asesores está listo para ayudarte
//               </p>
//             </div>
//             <button className="px-8 py-3 bg-white text-red-600 font-semibold rounded-xl hover:bg-gray-100 transition whitespace-nowrap">
//               Contactar asesor
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductoDetallado;
