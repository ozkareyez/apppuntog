import { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart, setShowCart } = useCart();

  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  const navItems = [
    { name: "Inicio", path: "/" },
    { name: "Productos", path: "/productos" },
    { name: "Ofertas", path: "/productos?oferta=true" },
    { name: "Contacto", path: "/contacto" },
  ];

  const navClass = ({ isActive }) =>
    `relative px-2 py-1 text-sm font-semibold transition
     ${isActive ? "text-white" : "text-white hover:text-white"}
     after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-white
     after:transition-all after:duration-300
     ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}`;

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="fixed top-0 left-0 w-full z-40 bg-red-600/90 backdrop-blur-xl border-b border-red-600/10">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="flex items-center">
            <img
              src="/imagenes/logo.png"
              alt="Punto G"
              className="h-30 w-auto hover:scale-105 transition-transform"
            />
          </Link>

          {/* NAV DESKTOP */}
          <nav className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <NavLink key={item.name} to={item.path} className={navClass}>
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* ICONOS */}
          <div className="flex items-center gap-3">
            {/* 🛒 CARRITO */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 rounded-full border border-red-600/40 
                         hover:border-red-600 transition"
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={20} className="text-white" />

              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-white 
                                 text-red-600 text-xs font-bold w-5 h-5 
                                 rounded-full flex items-center justify-center"
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* ☰ MENU MOBILE */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 text-white"
              aria-label="Abrir menú"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* ESPACIADOR - Reducido */}
      <div className="h-16" />

      {/* ================= MENU MOBILE ================= */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              className="fixed top-0 left-0 h-full w-72 bg-red-600/95 backdrop-blur-xl z-[60] p-6 
                         border-r border-white/10"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="mb-8 text-white hover:scale-110 transition"
              >
                <X size={24} />
              </button>

              <nav className="space-y-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block font-semibold text-base transition py-2 ${
                        isActive
                          ? "text-white border-l-4 border-white pl-3"
                          : "text-white/90 hover:text-white hover:pl-3"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// import { useState } from "react";
// import { ShoppingCart, Menu, X } from "lucide-react";
// import { Link, NavLink } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { useCart } from "@/context/CartContext";

// export default function Header() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const { cart, setShowCart } = useCart();

//   const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

//   const navItems = [
//     { name: "Inicio", path: "/" },
//     { name: "Productos", path: "/productos" },
//     { name: "Ofertas", path: "/productos?oferta=true" },
//     { name: "Contacto", path: "/contacto" },
//   ];

//   const navClass = ({ isActive }) =>
//     `relative px-3 py-2 text-sm font-semibold transition
//      ${isActive ? "text-white" : "text-white hover:text-white"}
//      after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-white
//      after:transition-all after:duration-300
//      ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}`;

//   return (
//     <>
//       {/* ================= HEADER ================= */}
//       <header className="fixed top-0 left-0 w-full  h-46 z-40 bg-red-600/90 backdrop-blur-xl border-b border-red-600/10">
//         <div className="max-w-7xl mx-auto px-2 py-2 flex items-center justify-between">
//           {/* LOGO */}
//           <Link to="/" className="flex items-center gap-2">
//             <img
//               src="/imagenes/logo.png"
//               alt="Punto G"
//               className="w-40 hover:scale-105 transition-transform"
//               sizes="40"
//             />
//           </Link>

//           {/* NAV DESKTOP */}
//           <nav className="hidden md:flex items-center gap-6">
//             {navItems.map((item) => (
//               <NavLink key={item.name} to={item.path} className={navClass}>
//                 {item.name}
//               </NavLink>
//             ))}
//           </nav>

//           {/* ICONOS */}
//           <div className="flex items-center gap-4">
//             {/* 🛒 CARRITO */}
//             <button
//               onClick={() => setShowCart(true)}
//               className="relative p-3 rounded-full border border-red-600/40
//                          hover:border-red-600 transition"
//               aria-label="Abrir carrito"
//             >
//               <ShoppingCart size={22} className="text-white" />

//               {totalItems > 0 && (
//                 <span
//                   className="absolute -top-2 -right-2 bg-white
//                                  text-red-600 text-xs font-bold w-6 h-6
//                                  rounded-full flex items-center justify-center"
//                 >
//                   {totalItems}
//                 </span>
//               )}
//             </button>

//             {/* ☰ MENU MOBILE */}
//             <button
//               onClick={() => setMenuOpen(true)}
//               className="md:hidden p-2 text-white"
//               aria-label="Abrir menú"
//             >
//               <Menu size={28} />
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* ESPACIADOR */}
//       <div className="h-[96px]" />

//       {/* ================= MENU MOBILE ================= */}
//       <AnimatePresence>
//         {menuOpen && (
//           <>
//             <motion.div
//               className="fixed inset-0 bg-black/70 z-50"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setMenuOpen(false)}
//             />

//             <motion.aside
//               className="fixed top-0 left-0 h-full w-80 bg-red-600/90 z-60 p-6
//                          border-r border-white/10"
//               initial={{ x: -320 }}
//               animate={{ x: 0 }}
//               exit={{ x: -320 }}
//             >
//               <button
//                 onClick={() => setMenuOpen(false)}
//                 className="mb-8 text-white"
//               >
//                 <X size={28} />
//               </button>

//               <nav className="space-y-6 text-lg">
//                 {navItems.map((item) => (
//                   <NavLink
//                     key={item.name}
//                     to={item.path}
//                     onClick={() => setMenuOpen(false)}
//                     className={({ isActive }) =>
//                       `block font-semibold transition ${
//                         isActive ? "text-" : "text-white hover:text-black"
//                       }`
//                     }
//                   >
//                     {item.name}
//                   </NavLink>
//                 ))}
//               </nav>
//             </motion.aside>
//           </>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }
