// src/componentes/PublicLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "@/componentes/Header";
import CartDrawer from "@/componentes/CartDrawer";
import FormularioEnvioModal from "@/componentes/FormularioEnvioModal";
import { useCart } from "@/context/CartContext";
import Foter from "@/componentes/Foter";

export default function PublicLayout() {
  const { showShippingModal } = useCart();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* HEADER */}
      <Header />

      {/* CONTENIDO */}
      <main className="pt-[88px] relative z-0 flex-1">
        <Outlet />
      </main>

      {/* FOOTER (SOLO PÚBLICO) */}
      <Foter />

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
