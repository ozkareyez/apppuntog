import { memo } from "react";

const CartImage = memo(
  function CartImage({ imagen, imagen_url, nombre }) {
    console.log("📸 CartImage props:", { imagen, imagen_url, nombre }); // 👈 DEBUG

    let src = "/imagenes/no-image.png";

    if (imagen_url?.startsWith("http")) {
      src = imagen_url;
    } else if (imagen) {
      src = `${import.meta.env.VITE_API_URL}/uploads/${imagen}`;
    }

    console.log("🖼️ Src final:", src); // 👈 DEBUG

    return (
      <img
        src={src}
        alt={nombre || "Producto"}
        loading="lazy"
        className="w-16 h-16 rounded-lg object-contain bg-gray-50 border"
        onError={(e) => {
          console.error("❌ Error cargando imagen:", src); // 👈 DEBUG
          e.currentTarget.src = "/imagenes/no-image.png";
        }}
      />
    );
  },
  (prev, next) => {
    return (
      prev.imagen === next.imagen &&
      prev.imagen_url === next.imagen_url &&
      prev.nombre === next.nombre
    );
  }
);

export default CartImage;

// import { memo, useState, useEffect } from "react";

// // Cache global de imágenes fuera del componente
// const imageCache = new Map();

// const CartImage = memo(function CartImage({ imagen, imagen_url, nombre }) {
//   const [imgSrc, setImgSrc] = useState("/imagenes/no-image.png");
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     let src = "/imagenes/no-image.png";

//     if (imagen_url?.startsWith("http")) {
//       src = imagen_url;
//     } else if (imagen) {
//       src = `${import.meta.env.VITE_API_URL}/uploads/${imagen}`;
//     }

//     // Si ya está en cache, usar directamente
//     if (imageCache.has(src)) {
//       setImgSrc(imageCache.get(src));
//       setIsLoading(false);
//       return;
//     }

//     // Pre-cargar la imagen
//     const img = new Image();
//     img.src = src;

//     img.onload = () => {
//       imageCache.set(src, src);
//       setImgSrc(src);
//       setIsLoading(false);
//     };

//     img.onerror = () => {
//       setImgSrc("/imagenes/no-image.png");
//       setIsLoading(false);
//     };

//     return () => {
//       img.onload = null;
//       img.onerror = null;
//     };
//   }, [imagen, imagen_url]);

//   return (
//     <div className="w-16 h-16 rounded-lg bg-gray-50 border flex items-center justify-center">
//       {isLoading ? (
//         <div className="w-6 h-6 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
//       ) : (
//         <img
//           src={imgSrc}
//           alt={nombre || "Producto"}
//           className="w-full h-full rounded-lg object-contain"
//         />
//       )}
//     </div>
//   );
// });

// export default CartImage;
