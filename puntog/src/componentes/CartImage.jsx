// import { memo, useMemo } from "react";

// const CartImage = memo(function CartImage({ item }) {
//   const src = useMemo(() => {
//     if (!item) return "/imagenes/no-image.png";

//     if (item.imagen_url?.startsWith("http")) {
//       return item.imagen_url;
//     }

//     if (item.imagen) {
//       return `${import.meta.env.VITE_API_URL}/uploads/${item.imagen}`;
//     }

//     return "/imagenes/no-image.png";
//   }, [item.imagen, item.imagen_url]);

//   return (
//     <img
//       src={src}
//       alt={item.nombre}
//       loading="lazy"
//       className="w-16 h-16 rounded-lg object-contain bg-gray-50 border"
//       onError={(e) => {
//         e.currentTarget.src = "/imagenes/no-image.png";
//       }}
//     />
//   );
// });

// export default CartImage;
import { memo, useMemo, useEffect } from "react";

const CartImage = memo(function CartImage({ item }) {
  // 👇 AGREGAR ESTO PARA DEBUG
  useEffect(() => {
    console.log("🔄 CartImage re-render:", item.nombre);
  });

  const src = useMemo(() => {
    if (!item) return "/imagenes/no-image.png";

    if (item.imagen_url?.startsWith("http")) {
      return item.imagen_url;
    }

    if (item.imagen) {
      return `${import.meta.env.VITE_API_URL}/uploads/${item.imagen}`;
    }

    return "/imagenes/no-image.png";
  }, [item.imagen, item.imagen_url]);

  return (
    <img
      src={src}
      alt={item.nombre}
      loading="lazy"
      className="w-16 h-16 rounded-lg object-contain bg-gray-50 border"
      onError={(e) => {
        e.currentTarget.src = "/imagenes/no-image.png";
      }}
    />
  );
});

export default CartImage;
