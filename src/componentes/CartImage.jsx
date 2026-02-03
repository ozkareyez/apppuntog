import { memo, useState } from "react";
import { Image } from "lucide-react";

const CartImage = memo(function CartImage({
  imagen,
  imagen_url,
  nombre,
  size = "md", // sm, md, lg, xl
}) {
  const [hasError, setHasError] = useState(false);

  // Determinar la fuente de la imagen
  let src = "/imagenes/no-image.png";

  if (imagen_url?.startsWith("http")) {
    src = imagen_url;
  } else if (imagen?.startsWith("http")) {
    src = imagen;
  } else if (imagen) {
    src = `${import.meta.env.VITE_API_URL}/uploads/${imagen}`;
  }

  // Configuración de tamaños
  const sizeClasses = {
    sm: "w-12 h-12 rounded-md",
    md: "w-16 h-16 rounded-lg",
    lg: "w-20 h-20 rounded-xl",
    xl: "w-24 h-24 rounded-xl",
  };

  // Si hubo error, mostrar placeholder elegante
  if (hasError) {
    return (
      <div
        className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br from-red-50 to-white border-2 border-red-200/50 shadow-sm overflow-hidden`}
      >
        <div className="text-center">
          <Image
            className={`${
              size === "sm" ? "w-4 h-4" : "w-6 h-6"
            } text-red-300 mx-auto`}
          />
          <span
            className={`${
              size === "sm" ? "text-[10px]" : "text-xs"
            } text-red-400 font-medium mt-1 block`}
          >
            {size === "sm" ? "Sin img." : "Sin imagen"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <img
        src={src}
        alt={nombre || "Producto"}
        loading="lazy"
        className={`${sizeClasses[size]} object-cover bg-gradient-to-br from-white to-red-50 border-2 border-red-100 group-hover:border-red-300 transition-all duration-300 group-hover:scale-105 shadow-sm`}
        onError={(e) => {
          setHasError(true);
          e.currentTarget.src = "/imagenes/no-image.png";
        }}
      />

      {/* Efecto de overlay en hover */}
      <div
        className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-to-br from-transparent via-white/0 to-red-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
      />
    </div>
  );
});

export default CartImage;

// import { memo } from "react";

// const CartImage = memo(function CartImage({ imagen, imagen_url, nombre }) {
//   let src = "/imagenes/no-image.png";

//   if (imagen_url?.startsWith("http")) {
//     src = imagen_url;
//   } else if (imagen?.startsWith("http")) {
//     src = imagen;
//   } else if (imagen) {
//     src = `${import.meta.env.VITE_API_URL}/uploads/${imagen}`;
//   }

//   return (
//     <img
//       src={src}
//       alt={nombre || "Producto"}
//       loading="lazy"
//       className="w-16 h-16 rounded-lg object-contain bg-gray-50 border"
//       onError={(e) => {
//         e.currentTarget.src = "/imagenes/no-image.png";
//       }}
//     />
//   );
// });

// export default CartImage;
