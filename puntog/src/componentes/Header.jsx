// import { useState } from "react";
// import { ShoppingCart, Menu, X } from "lucide-react";
// import { Link } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";

// const Header = ({ totalItems, onCartClick }) => {
//   const [menuOpen, setMenuOpen] = useState(false);

//   return (
//     <>
//       {/* HEADER */}
//       <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
//         <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
//           {/* LOGO */}
//           <Link to="/" className="flex items-center gap-2 group">
//             <img
//               src="/imagenes/logo.png"
//               alt="Punto G"
//               className="w-20 transition-transform duration-300 group-hover:scale-105"
//             />
//           </Link>

//           {/* CTA DESKTOP */}
//           <motion.div
//             initial={{ opacity: 0, y: -8 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className="hidden md:block"
//           >
//             <span className="text-pink-400/90 font-medium tracking-wide text-sm uppercase">
//               Despierta tu placer • Punto G
//             </span>
//           </motion.div>

//           {/* ICONOS */}
//           <div className="flex items-center gap-4">
//             {/* CARRITO */}
//             <motion.button
//               whileTap={{ scale: 0.92 }}
//               onClick={onCartClick}
//               className="relative p-3 rounded-full bg-black border border-pink-500/40 hover:border-pink-400 transition shadow-lg"
//             >
//               <ShoppingCart size={22} className="text-pink-400" />

//               {totalItems > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
//                   {totalItems}
//                 </span>
//               )}
//             </motion.button>

//             {/* MENU MOBILE */}
//             <button
//               onClick={() => setMenuOpen(true)}
//               className="md:hidden p-2 text-white hover:text-pink-400 transition"
//             >
//               <Menu size={28} />
//             </button>
//           </div>
//         </div>

//         {/* Línea premium inferior */}
//         <div className="h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
//       </header>

//       {/* MENU MOBILE */}
//       <AnimatePresence>
//         {menuOpen && (
//           <>
//             {/* Overlay */}
//             <motion.div
//               className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setMenuOpen(false)}
//             />

//             {/* Drawer */}
//             <motion.div
//               className="fixed top-0 left-0 h-full w-80 bg-black/95 z-50 p-6 flex flex-col shadow-2xl"
//               initial={{ x: -320 }}
//               animate={{ x: 0 }}
//               exit={{ x: -320 }}
//               transition={{ type: "spring", stiffness: 90 }}
//             >
//               {/* Close */}
//               <button
//                 onClick={() => setMenuOpen(false)}
//                 className="self-end mb-8 text-white hover:text-pink-400 transition"
//               >
//                 <X size={28} />
//               </button>

//               {/* Nav */}
//               <nav className="space-y-6 text-lg font-medium drop-shadow-[0_0_6px_rgba(236,72,153,0.5)]">
//                 {[
//                   { name: "Inicio", path: "/" },
//                   { name: "Catálogo", path: "/catalogo" },
//                   { name: "Promociones", path: "/promos" },
//                   { name: "Contacto", path: "/contacto" },
//                 ].map((item) => (
//                   <Link
//                     key={item.name}
//                     to={item.path}
//                     onClick={() => setMenuOpen(false)}
//                     className="block hover:text-pink-400 transition"
//                   >
//                     {item.name}
//                   </Link>
//                 ))}
//               </nav>

//               {/* Footer CTA */}
//               <div className="mt-auto pt-10 text-center">
//                 <p className="text-pink-400 font-semibold text-sm tracking-widest uppercase">
//                   Experiencia Punto G
//                 </p>
//                 <p className="text-white/60 text-xs mt-2">
//                   Discreción • Elegancia • Placer
//                 </p>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default Header;
import { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ totalItems = 0, onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: "Inicio", path: "/" },
    { name: "Productos", path: "/productos" },
    { name: "Ofertas", path: "/productos?oferta=true" },
    { name: "Contacto", path: "/contacto" },
  ];

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/imagenes/logo.png"
              alt="Punto G"
              className="w-20 hover:scale-105 transition-transform"
            />
          </Link>

          {/* TEXTO CENTRAL (DESKTOP) */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="hidden md:block"
          >
            <span className="text-pink-400/90 font-medium tracking-wide text-sm uppercase">
              Discreción • Elegancia • Placer
            </span>
          </motion.div>

          {/* ICONOS */}
          <div className="flex items-center gap-4">
            {/* CARRITO */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onCartClick}
              className="relative p-3 rounded-full border border-pink-500/40 hover:border-pink-400 transition shadow-lg"
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={22} className="text-pink-400" />

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </motion.button>

            {/* MENU MOBILE */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 text-white hover:text-pink-400 transition"
              aria-label="Abrir menú"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>

        {/* Línea decorativa */}
        <div className="h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
      </header>

      {/* ================= MENU MOBILE ================= */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* OVERLAY */}
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* DRAWER */}
            <motion.aside
              className="fixed top-0 left-0 h-full w-80 bg-black/95 z-50 p-6 flex flex-col shadow-2xl"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 90 }}
            >
              {/* CLOSE */}
              <button
                onClick={() => setMenuOpen(false)}
                className="self-end mb-8 text-white hover:text-pink-400"
                aria-label="Cerrar menú"
              >
                <X size={28} />
              </button>

              {/* NAV */}
              <nav className="space-y-6 text-lg font-medium">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block transition ${
                        isActive
                          ? "text-pink-400"
                          : "text-white hover:text-pink-400"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </nav>

              {/* FOOTER */}
              <div className="mt-auto pt-10 text-center border-t border-white/10">
                <p className="text-pink-400 font-semibold text-sm tracking-widest uppercase">
                  Punto G Store
                </p>
                <p className="text-white/60 text-xs mt-2">
                  Envíos discretos • Atención personalizada
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
