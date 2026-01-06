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
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { API_URL } from "@/config";

const ProductoDetallado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [producto, setProducto] = useState(null);
  const [recomendados, setRecomendados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState(null);

  const carruselRef = useRef(null);

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

  const renderDescripcion = (texto) => {
    if (!texto) return null;

    const partes = texto
      .split("*")
      .map((t) => t.trim())
      .filter(Boolean);

    return (
      <div className="space-y-5 text-gray-700 leading-relaxed">
        {partes[0] && (
          <p>
            {partes[0].split(",").map((frase, i) => (
              <span key={i} className="block mb-2">
                {frase.trim()}.
              </span>
            ))}
          </p>
        )}

        {partes.length > 1 && (
          <ul className="space-y-3">
            {partes.slice(1).map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-red-600 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
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

  /* ================= ESTADOS ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Producto no encontrado</h2>
          <button
            onClick={() => navigate("/productos")}
            className="bg-red-600 text-white px-8 py-3 rounded-xl"
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

  /* ================= RENDER ================= */

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* VOLVER */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 mb-8"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        {/* PRODUCTO */}
        <div className="grid md:grid-cols-2 gap-12">
          <div className="relative bg-gray-50 rounded-2xl border flex items-center justify-center h-[500px]">
            {esOferta && producto.descuento && (
              <span className="absolute top-5 left-5 bg-red-600 text-white px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-bold">
                <Tag size={16} />
                {producto.descuento}% OFF
              </span>
            )}

            <img
              src={getImageSrc(producto.imagen)}
              alt={producto.nombre}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="flex flex-col justify-between">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">{producto.nombre}</h1>

              <div className="bg-gray-50 p-6 rounded-xl border">
                {esOferta && (
                  <p className="text-gray-400 line-through text-lg">
                    ${precioAntes.toLocaleString()}
                  </p>
                )}
                <p className="text-red-600 text-4xl font-bold">
                  ${precio.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-5 mt-8">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Cantidad:</span>
                <div className="flex items-center border rounded-xl">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="px-4 py-2"
                  >
                    <Minus />
                  </button>
                  <span className="px-6 font-semibold">{cantidad}</span>
                  <button
                    onClick={() => setCantidad(cantidad + 1)}
                    className="px-4 py-2"
                  >
                    <Plus />
                  </button>
                </div>
              </div>

              <button
                onClick={() =>
                  Array.from({ length: cantidad }).forEach(() =>
                    addToCart(producto)
                  )
                }
                className="w-full bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3"
              >
                <ShoppingCart />
                Agregar al carrito
              </button>

              <button className="w-full border py-3 rounded-xl flex items-center justify-center gap-2">
                <Heart />
                Favoritos
              </button>
            </div>
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        {producto.descripcion && (
          <div className="mt-14 bg-gray-50 rounded-2xl p-8 border">
            <h2 className="text-2xl font-bold mb-6 text-red-600">
              Descripción del producto
            </h2>
            {renderDescripcion(producto.descripcion)}
          </div>
        )}

        {/* RECOMENDADOS */}
        {recomendados.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">También te puede interesar</h2>

              <div className="flex gap-3">
                <button
                  onClick={() => scrollCarrusel("left")}
                  className="p-2 rounded-full border hover:bg-gray-100"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={() => scrollCarrusel("right")}
                  className="p-2 rounded-full border hover:bg-gray-100"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>

            <div
              ref={carruselRef}
              className="flex gap-5 overflow-x-auto scroll-smooth pb-4"
            >
              {recomendados.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/productos/${p.id}`)}
                  className="min-w-[220px] max-w-[220px] cursor-pointer bg-white border rounded-2xl hover:shadow-xl transition"
                >
                  <div className="h-44 bg-gray-50 flex items-center justify-center rounded-t-2xl">
                    <img
                      src={getImageSrc(p.imagen)}
                      alt={p.nombre}
                      className="h-full object-contain"
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-sm font-semibold line-clamp-2">
                      {p.nombre}
                    </p>
                    <p className="text-red-600 font-bold mt-1">
                      ${Number(p.precio).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductoDetallado;

// // src/pages/ProductoDetallado.jsx
// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ShoppingCart, ArrowLeft, Tag, Heart, Minus, Plus } from "lucide-react";
// import { useCart } from "@/context/CartContext";
// import { API_URL } from "@/config";

// const ProductoDetallado = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { addToCart } = useCart();

//   const [producto, setProducto] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [cantidad, setCantidad] = useState(1);
//   const [error, setError] = useState(null);

//   const getImageSrc = (imagen) => {
//     if (!imagen) return "/imagenes/no-image.png";
//     if (imagen.startsWith("http://"))
//       return imagen.replace("http://", "https://");
//     if (imagen.startsWith("https://")) return imagen;
//     return `${API_URL}/images/${imagen}`;
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

//   useEffect(() => {
//     setLoading(true);
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

//   const handleAgregarCarrito = () => {
//     for (let i = 0; i < cantidad; i++) addToCart(producto);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white">
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
//   const tieneStock = producto.stock === undefined || producto.stock > 0;

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

//         <div className="grid md:grid-cols-2 gap-12">
//           {/* IMAGEN */}
//           <div className="relative bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center h-[500px]">
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

//           {/* INFO */}
//           <div className="flex flex-col justify-between">
//             <div className="space-y-6">
//               <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
//                 {producto.nombre}
//               </h1>

//               <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
//                 {esOferta && (
//                   <p className="text-gray-400 line-through text-lg">
//                     ${precioAntes.toLocaleString()}
//                   </p>
//                 )}
//                 <p className="text-red-600 text-4xl font-bold">
//                   ${precio.toLocaleString()}
//                 </p>
//               </div>

//               <p
//                 className={`font-semibold ${
//                   tieneStock ? "text-green-600" : "text-red-600"
//                 }`}
//               >
//                 {tieneStock ? "Disponible" : "Agotado"}
//               </p>
//             </div>

//             {/* ACCIONES */}
//             <div className="space-y-5 mt-8">
//               <div className="flex items-center gap-4">
//                 <span className="font-semibold">Cantidad:</span>
//                 <div className="flex items-center border rounded-xl">
//                   <button
//                     onClick={() => setCantidad(Math.max(1, cantidad - 1))}
//                     className="px-4 py-2 hover:bg-gray-100"
//                   >
//                     <Minus />
//                   </button>
//                   <span className="px-6 text-lg font-semibold">{cantidad}</span>
//                   <button
//                     onClick={() => setCantidad(cantidad + 1)}
//                     className="px-4 py-2 hover:bg-gray-100"
//                   >
//                     <Plus />
//                   </button>
//                 </div>
//               </div>

//               <button
//                 onClick={handleAgregarCarrito}
//                 disabled={!tieneStock}
//                 className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-3"
//               >
//                 <ShoppingCart />
//                 Agregar al carrito
//               </button>

//               <button className="w-full border border-gray-300 py-3 rounded-xl text-gray-700 flex items-center justify-center gap-2 hover:border-red-600 hover:text-red-600">
//                 <Heart />
//                 Favoritos
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* DESCRIPCIÓN */}
//         {producto.descripcion && (
//           <div className="mt-14 bg-gray-50 rounded-2xl p-8 border border-gray-200">
//             <h2 className="text-2xl font-bold mb-6 text-red-600">
//               Descripción del producto
//             </h2>
//             {renderDescripcion(producto.descripcion)}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default ProductoDetallado;
