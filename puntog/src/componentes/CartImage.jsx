import { memo } from "react";

const CartImage = memo(
  function CartImage({ imagen, imagen_url, nombre }) {
    let src = "/imagenes/no-image.png";

    if (imagen_url?.startsWith("http")) {
      src = imagen_url;
    } else if (imagen) {
      src = `${import.meta.env.VITE_API_URL}/uploads/${imagen}`;
    }

    return (
      <img
        src={src}
        alt={nombre || "Producto"}
        loading="lazy"
        className="w-16 h-16 rounded-lg object-contain bg-gray-50 border"
        onError={(e) => {
          e.currentTarget.src = "/imagenes/no-image.png";
        }}
      />
    );
  },
  // Solo re-renderizar si las URLs cambian
  (prevProps, nextProps) => {
    return (
      prevProps.imagen === nextProps.imagen &&
      prevProps.imagen_url === nextProps.imagen_url
    );
  }
);

export default CartImage;

// import { memo } from "react";

// const CartImage = memo(
//   function CartImage({ item }) {
//     let src = "/imagenes/no-image.png";

//     if (item?.imagen_url?.startsWith("http")) {
//       src = item.imagen_url;
//     } else if (item?.imagen) {
//       src = `${import.meta.env.VITE_API_URL}/uploads/${item.imagen}`;
//     }

//     return (
//       <img
//         src={src}
//         alt={item?.nombre || "Producto"}
//         loading="lazy"
//         className="w-16 h-16 rounded-lg object-contain bg-gray-50 border"
//         onError={(e) => {
//           e.currentTarget.src = "/imagenes/no-image.png";
//         }}
//       />
//     );
//   },
//   // 👇 CLAVE: Solo re-renderizar si cambia la imagen o ID
//   (prevProps, nextProps) => {
//     return (
//       prevProps.item.id === nextProps.item.id &&
//       prevProps.item.imagen === nextProps.item.imagen &&
//       prevProps.item.imagen_url === nextProps.item.imagen_url
//     );
//   }
// );

// export default CartImage;

// // import { memo, useMemo } from "react";

// // const CartImage = memo(function CartImage({ item }) {
// //   const src = useMemo(() => {
// //     if (!item) return "/imagenes/no-image.png";

// //     if (item.imagen_url?.startsWith("http")) {
// //       return item.imagen_url;
// //     }

// //     if (item.imagen) {
// //       return `${import.meta.env.VITE_API_URL}/uploads/${item.imagen}`;
// //     }

// //     return "/imagenes/no-image.png";
// //   }, [item.imagen, item.imagen_url]);

// //   return (
// //     <img
// //       src={src}
// //       alt={item.nombre}
// //       loading="lazy"
// //       className="w-16 h-16 rounded-lg object-contain bg-gray-50 border"
// //       onError={(e) => {
// //         e.currentTarget.src = "/imagenes/no-image.png";
// //       }}
// //     />
// //   );
// // });

// // export default CartImage;
// import { memo, useMemo, useEffect } from "react";

// const CartImage = memo(function CartImage({ item }) {
//   // 👇 AGREGAR ESTO PARA DEBUG
//   useEffect(() => {
//     console.log("🔄 CartImage re-render:", item.nombre);
//   });

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
