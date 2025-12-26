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
    `relative px-3 py-2 text-sm font-semibold transition
     ${isActive ? "text-white" : "text-white hover:text-white"}
     after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-white
     after:transition-all after:duration-300
     ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}`;

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="fixed top-0 left-0 w-full z-40 bg-red-600/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/imagenes/logo.png"
              alt="Punto G"
              className="w-40 hover:scale-105 transition-transform"
              sizes="30"
            />
          </Link>

          {/* NAV DESKTOP */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink key={item.name} to={item.path} className={navClass}>
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* ICONOS */}
          <div className="flex items-center gap-4">
            {/* 🛒 CARRITO */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-3 rounded-full border border-red-600/40 
                         hover:border-red-600 transition"
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={22} className="text-white" />

              {totalItems > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-white 
                                 text-red-600 text-xs font-bold w-6 h-6 
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
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* ESPACIADOR */}
      <div className="h-[96px]" />

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
              className="fixed top-0 left-0 h-full w-80 bg-red-600/90 z-60 p-6 
                         border-r border-white/10"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="mb-8 text-white"
              >
                <X size={28} />
              </button>

              <nav className="space-y-6 text-lg">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block font-semibold transition ${
                        isActive ? "text-" : "text-white hover:text-black"
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

//   return (
//     <>
//       {/* ================= HEADER ================= */}
//       <header className="fixed top-0 left-0 w-full z-40 bg-black/90 backdrop-blur-xl border-b border-white/10">
//         <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
//           {/* LOGO */}
//           <Link to="/" className="flex items-center gap-2">
//             <img
//               src="/imagenes/logo.png"
//               alt="Punto G"
//               className="w-20 hover:scale-105 transition-transform"
//             />
//           </Link>

//           {/* TEXTO CENTRAL */}
//           <div className="hidden md:block">
//             <span className="text-pink-400/90 font-medium tracking-wide text-sm uppercase">
//               Discreción • Elegancia • Placer
//             </span>
//           </div>

//           {/* ICONOS */}
//           <div className="flex items-center gap-4">
//             {/* 🛒 CARRITO */}
//             <button
//               onClick={() => setShowCart(true)}
//               className="relative p-3 rounded-full border border-pink-500/40 hover:border-pink-400 transition"
//             >
//               <ShoppingCart size={22} className="text-pink-400" />

//               {totalItems > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
//                   {totalItems}
//                 </span>
//               )}
//             </button>

//             {/* ☰ MENU MOBILE */}
//             <button
//               onClick={() => setMenuOpen(true)}
//               className="md:hidden p-2 text-white"
//             >
//               <Menu size={28} />
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* ESPACIADOR PARA QUE EL CONTENIDO NO QUEDE DEBAJO */}
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
//               className="fixed top-0 left-0 h-full w-80 bg-black z-60 p-6"
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
//                     className="block text-white hover:text-pink-400"
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
