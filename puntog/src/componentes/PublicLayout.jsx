// src/componentes/PublicLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "@/componentes/Header";
import CartDrawer from "@/componentes/CartDrawer";
import FormularioEnvioModal from "@/componentes/FormularioEnvioModal";
import { useCart } from "@/context/CartContext";

export default function PublicLayout() {
  const { showShippingModal } = useCart();

  return (
    <div className="min-h-screen bg-black">
      {/* HEADER */}
      <Header />

      {/* CONTENIDO */}
      <main className="pt-[88px] relative z-0">
        <Outlet />
      </main>

      {/* CARRITO */}
      <CartDrawer />

      {/* MODAL ENVÍO */}
      {showShippingModal && <FormularioEnvioModal />}
    </div>
  );
}

// // src/componentes/PublicLayout.jsx
// import { Outlet } from "react-router-dom";
// import Header from "@/componentes/Header";
// import CartDrawer from "@/componentes/CartDrawer";
// import FormularioEnvioModal from "@/componentes/FormularioEnvioModal";
// import { useCart } from "@/context/CartContext";

// export default function PublicLayout() {
//   const { showShippingModal } = useCart();

//   return (
//     <div className="min-h-screen bg-black relative">
//       {/* HEADER */}
//       <Header />

//       {/* CONTENIDO DE LAS RUTAS */}
//       <main className="pt-[88px]">
//         <Outlet />
//       </main>

//       {/* CARRITO */}
//       <CartDrawer />

//       {/* MODAL ENVÍO */}
//       {showShippingModal && <FormularioEnvioModal />}
//     </div>
//   );
// }
