// import { useState, useEffect, useRef } from "react";
// import {
//   ShoppingCart,
//   Menu,
//   X,
//   Search,
//   User,
//   Heart,
//   Truck,
//   Package,
//   Globe,
// } from "lucide-react";
// import { Link, NavLink, useLocation } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { useCart } from "@/context/CartContext";

// export default function Header() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [searchOpen, setSearchOpen] = useState(false);
//   const { cart, setShowCart } = useCart();
//   const location = useLocation();

//   const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

//   const navItems = [
//     { name: "Inicio", path: "/", icon: "🏠" },
//     { name: "Productos", path: "/productos", icon: "🛍️" },
//     {
//       name: "Ofertas",
//       path: "/productos?oferta=true&filtro=ofertas",
//       icon: "🔥",
//     },
//     { name: "Contacto", path: "/contacto", icon: "📞" },
//   ];

//   // Frases para el marquee
//   const marqueeMessages = [
//     "🚚 ENVÍO  A NIVEL NACIONAL",
//     "🏠 DOMICILIO GRATIS EN COMPRAS MAYORES A $200.000",
//     "📦 ENVÍO DISCRETO Y SEGURO",
//     "⏱️ ENTREGA EN 24-48 HORAS",
//     "🔄 DEVOLUCIONES GRATIS EN 30 DÍAS",
//     "🔒 COMPRA 100% SEGURA",
//     "📞 SOPORTE 24/7",
//   ];

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 50);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const menuVariants = {
//     closed: {
//       x: "-100%",
//       transition: {
//         type: "spring",
//         stiffness: 400,
//         damping: 40,
//       },
//     },
//     open: {
//       x: 0,
//       transition: {
//         type: "spring",
//         stiffness: 400,
//         damping: 40,
//         staggerChildren: 0.05,
//         delayChildren: 0.1,
//       },
//     },
//   };

//   const itemVariants = {
//     closed: { opacity: 0, x: -20 },
//     open: { opacity: 1, x: 0 },
//   };

//   const searchVariants = {
//     hidden: { width: 0, opacity: 0 },
//     visible: { width: "100%", opacity: 1 },
//   };

//   return (
//     <>
//       {/* ANNOUNCEMENT BAR CON MARQUEE - VERSIÓN SIMPLIFICADA */}
//       <div className="bg-gradient-to-r from-white to-red-300 text-white relative overflow-hidden ">
//         {/* Contenedor principal */}
//         <div className="relative py-2">
//           {/* Efecto de brillo animado */}
//           <motion.div
//             className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
//             animate={{ x: ["-100%", "100%"] }}
//             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
//           />

//           {/* Marquee usando CSS puro para mayor compatibilidad */}
//           <div className="relative z-10 overflow-hidden whitespace-nowrap">
//             <div className="inline-flex animate-marquee">
//               {marqueeMessages.map((message, index) => (
//                 <div key={index} className="inline-flex items-center mx-6">
//                   <span className="text-xs font-bold tracking-wider px-3 py-1 bg-white/10 rounded-full">
//                     {message}
//                   </span>
//                   <div className="mx-4 w-1 h-1 rounded-full bg-white/30"></div>
//                 </div>
//               ))}

//               {/* Duplicar para efecto continuo */}
//               {marqueeMessages.map((message, index) => (
//                 <div
//                   key={`dup-${index}`}
//                   className="inline-flex items-center mx-6"
//                 >
//                   <span className="text-xs font-bold tracking-wider px-3 py-1 bg-white/10 rounded-full">
//                     {message}
//                   </span>
//                   <div className="mx-4 w-1 h-1 rounded-full bg-white/30"></div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* HEADER */}
//       <header
//         className={`fixed top-8 left-0 w-full z-50 transition-all duration-500 h-26 ${
//           scrolled
//             ? "bg-white shadow-2xl shadow-red-900/10"
//             : "bg-gradient-to-b from-red-600 to-red-700"
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-full">
//           {/* LOGO */}
//           <Link to="/" className="flex items-center group">
//             <div className="relative">
//               <img
//                 src="/imagenes/logo.png"
//                 alt="Punto G"
//                 className={`h-30 w-auto transition-all duration-500 ${
//                   scrolled ? "" : "group-hover:scale-105"
//                 }`}
//               />
//               <motion.div
//                 className="absolute inset-0 rounded-full bg-red-500/20 blur-md -z-10"
//                 animate={{ scale: [1, 1.2, 1] }}
//                 transition={{ duration: 2, repeat: Infinity }}
//               />
//             </div>
//           </Link>

//           {/* NAV DESKTOP */}
//           <nav className="hidden md:flex items-center gap-1">
//             {navItems.map((item) => (
//               <NavLink
//                 key={item.name}
//                 to={item.path}
//                 className={({ isActive }) => `
//                   relative px-4 py-2 text-sm font-medium transition-all duration-300
//                   ${
//                     scrolled
//                       ? "text-gray-800 hover:text-red-600"
//                       : "text-white/95 hover:text-white"
//                   }
//                   ${isActive && scrolled ? "text-red-600" : ""}
//                   after:absolute after:left-4 after:-bottom-0.5 after:h-0.5 after:rounded-full
//                   after:transition-all after:duration-300 after:origin-left
//                   ${
//                     isActive
//                       ? scrolled
//                         ? "after:w-6 after:bg-red-600"
//                         : "after:w-6 after:bg-white"
//                       : "after:w-0 hover:after:w-6 hover:after:bg-current"
//                   }
//                 `}
//               >
//                 <span className="mr-1.5">{item.icon}</span>
//                 {item.name}
//               </NavLink>
//             ))}
//           </nav>

//           {/* SEARCH BAR (Desktop) */}
//           <AnimatePresence>
//             {searchOpen && (
//               <motion.div
//                 initial="hidden"
//                 animate="visible"
//                 exit="hidden"
//                 variants={searchVariants}
//                 className="absolute left-1/2 -translate-x-1/2 w-64"
//               >
//                 <div className="relative">
//                   <input
//                     type="text"
//                     placeholder="Buscar productos..."
//                     className="w-full pl-10 pr-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
//                     autoFocus
//                   />
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* ACTION BUTTONS */}
//           <div className="flex items-center gap-2">
//             {/* CART */}
//             <button
//               onClick={() => setShowCart(true)}
//               className={`relative p-2 rounded-full transition-all group ${
//                 scrolled
//                   ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
//                   : "text-white/90 hover:text-white hover:bg-white/10"
//               }`}
//             >
//               <ShoppingCart size={20} />
//               {totalItems > 0 && (
//                 <>
//                   <span
//                     className={`absolute -top-1 -right-1 text-xs font-bold w-5 h-5
//                                rounded-full flex items-center justify-center animate-pulse
//                                ${
//                                  scrolled
//                                    ? "bg-red-600 text-white"
//                                    : "bg-white text-red-600"
//                                }`}
//                   >
//                     {totalItems}
//                   </span>
//                   <motion.div
//                     className="absolute inset-0 rounded-full bg-red-500/20"
//                     animate={{ scale: [1, 1.5, 1] }}
//                     transition={{ duration: 2, repeat: Infinity }}
//                   />
//                 </>
//               )}
//             </button>

//             {/* MOBILE MENU TOGGLE */}
//             <button
//               onClick={() => setMenuOpen(true)}
//               className={`md:hidden p-2 rounded-full transition-all ${
//                 scrolled
//                   ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
//                   : "text-white/90 hover:text-white hover:bg-white/10"
//               }`}
//             >
//               <Menu size={24} />
//             </button>
//           </div>
//         </div>

//         {/* SCROLL INDICATOR */}
//         {scrolled && location.pathname === "/" && (
//           <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-red-300" />
//         )}
//       </header>

//       {/* SPACER */}
//       <div className="h-32" />

//       {/* MOBILE MENU */}
//       <AnimatePresence>
//         {menuOpen && (
//           <>
//             {/* OVERLAY */}
//             <motion.div
//               className="fixed inset-0 bg-black/70 z-50"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setMenuOpen(false)}
//             />

//             {/* MENU PANEL */}
//             <motion.aside
//               className="fixed top-0 left-0 h-full w-80 max-w-full bg-gradient-to-b from-red-600 to-red-700 z-[60] shadow-2xl shadow-black/40"
//               variants={menuVariants}
//               initial="closed"
//               animate="open"
//               exit="closed"
//             >
//               {/* HEADER */}
//               <div className="p-6 border-b border-white/10">
//                 <div className="flex items-center justify-between">
//                   <Link
//                     to="/"
//                     onClick={() => setMenuOpen(false)}
//                     className="flex items-center"
//                   >
//                     <img
//                       src="/imagenes/logo.png"
//                       alt="Punto G"
//                       className="h-10 w-auto"
//                     />
//                   </Link>
//                   <button
//                     onClick={() => setMenuOpen(false)}
//                     className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
//                   >
//                     <X size={20} className="text-white" />
//                   </button>
//                 </div>
//               </div>

//               {/* USER INFO */}
//               <div className="p-6 border-b border-white/10">
//                 <div className="flex items-center gap-3">
//                   {/* <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
//                     <User size={20} className="text-white" />
//                   </div> */}
//                   {/* <div>
//                     <p className="text-white font-medium">Bienvenid@</p>
//                     <p className="text-white/70 text-sm">
//                       Inicia sesión para ver tu cuenta
//                     </p>
//                   </div> */}
//                 </div>
//               </div>

//               {/* NAVIGATION */}
//               <nav className="p-6">
//                 <motion.ul className="space-y-1">
//                   {navItems.map((item, index) => (
//                     <motion.li
//                       key={item.name}
//                       variants={itemVariants}
//                       custom={index}
//                     >
//                       <NavLink
//                         to={item.path}
//                         onClick={() => setMenuOpen(false)}
//                         className={({ isActive }) => `
//                           flex items-center gap-3 px-4 py-3 rounded-xl transition-all
//                           ${
//                             isActive
//                               ? "bg-white/20 text-white"
//                               : "text-white/90 hover:bg-white/10"
//                           }
//                         `}
//                       >
//                         <span className="text-lg">{item.icon}</span>
//                         <span className="font-medium">{item.name}</span>
//                       </NavLink>
//                     </motion.li>
//                   ))}
//                 </motion.ul>
//               </nav>

//               {/* SECONDARY ACTIONS */}
//               <div className="p-6 border-t border-white/10">
//                 <div className="grid grid-cols-2 gap-3">
//                   <button className="flex flex-col items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
//                     <Heart size={18} className="text-white mb-1" />
//                     <span className="text-white text-sm">Favoritos</span>
//                   </button>
//                   <button className="flex flex-col items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
//                     <ShoppingCart size={18} className="text-white mb-1" />
//                     <span className="text-white text-sm">Carrito</span>
//                   </button>
//                 </div>
//               </div>

//               {/* FOOTER */}
//               <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
//                 <p className="text-white/60 text-sm text-center">
//                   🚚 Envío discreto · 🔒 Pago seguro
//                 </p>
//               </div>
//             </motion.aside>
//           </>
//         )}
//       </AnimatePresence>

//       {/* CSS para el marquee */}
//       <style jsx global>{`
//         @keyframes marquee {
//           0% {
//             transform: translateX(0%);
//           }
//           100% {
//             transform: translateX(-50%);
//           }
//         }
//         .animate-marquee {
//           animation: marquee 30s linear infinite;
//           display: inline-flex;
//         }
//         .animate-marquee:hover {
//           animation-play-state: paused;
//         }
//       `}</style>
//     </>
//   );
// }

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  User,
  Heart,
  Instagram,
  Facebook,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cart, setShowCart } = useCart();
  const location = useLocation();

  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  const navItems = [
    { name: "Inicio", path: "/", icon: "🏠" },
    { name: "Productos", path: "/productos", icon: "🛍️" },
    {
      name: "Ofertas",
      path: "/productos?oferta=true&filtro=ofertas",
      icon: "🔥",
    },
    { name: "Contacto", path: "/contacto", icon: "📞" },
  ];

  // URLs de redes sociales (reemplaza con las reales)
  const socialLinks = {
    instagram: "https://instagram.com/puntog_24",
    facebook: "https://www.facebook.com/profile.php?id=61564262671078",
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navClass = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-medium transition-all duration-300 group
     ${isActive ? "text-white" : "text-white/90 hover:text-white"}
     after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-white
     after:transition-all after:duration-300 after:origin-left
     ${
       isActive
         ? "after:w-full after:scale-x-100"
         : "after:w-0 hover:after:w-full hover:after:scale-x-100"
     }`;

  const menuVariants = {
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 },
  };

  const searchVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: { width: "100%", opacity: 1 },
  };

  return (
    <>
      {/* ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-red-700 to-red-800 text-white text-sm text-center py-[-20] relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <div className="relative z-10">
          🚚 Envío gratis en pedidos superiores a $150.000 • 🎁 3 cuotas sin
          interés
        </div>
      </div>

      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 h-30 ${
          scrolled
            ? "bg-white shadow-2xl shadow-red-900/10"
            : "bg-gradient-to-b from-red-600 to-red-700"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-full">
          {/* LOGO */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img
                src="/imagenes/logo.png"
                alt="Punto G"
                className={`h-30 w-auto transition-all duration-500 ${
                  scrolled ? "" : "group-hover:scale-105"
                }`}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/20 blur-md -z-10"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </Link>

          {/* NAV DESKTOP */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  relative px-4 py-2 text-sm font-medium transition-all duration-300
                  ${
                    scrolled
                      ? "text-gray-800 hover:text-red-600"
                      : "text-white/95 hover:text-white"
                  }
                  ${isActive && scrolled ? "text-red-600" : ""}
                  after:absolute after:left-4 after:-bottom-0.5 after:h-0.5 after:rounded-full
                  after:transition-all after:duration-300 after:origin-left
                  ${
                    isActive
                      ? scrolled
                        ? "after:w-6 after:bg-red-600"
                        : "after:w-6 after:bg-white"
                      : "after:w-0 hover:after:w-6 hover:after:bg-current"
                  }
                `}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* REDES SOCIALES (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full transition-all ${
                scrolled
                  ? "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Instagram de Punto G"
            >
              <Instagram size={20} />
            </a>

            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full transition-all ${
                scrolled
                  ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Facebook de Punto G"
            >
              <Facebook size={20} />
            </a>
          </div>

          {/* SEARCH BAR (Desktop) */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={searchVariants}
                className="absolute left-1/2 -translate-x-1/2 w-64"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="w-full pl-10 pr-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    autoFocus
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            {/* SEARCH BUTTON (Desktop) */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`hidden md:flex relative p-2 rounded-full transition-all ${
                scrolled
                  ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Buscar productos"
            >
              <Search size={20} />
            </button>

            {/* CART */}
            <button
              onClick={() => setShowCart(true)}
              className={`relative p-2 rounded-full transition-all group ${
                scrolled
                  ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Carrito de compras"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <>
                  <span
                    className={`absolute -top-1 -right-1 text-xs font-bold w-5 h-5
                               rounded-full flex items-center justify-center animate-pulse
                               ${
                                 scrolled
                                   ? "bg-red-600 text-white"
                                   : "bg-white text-red-600"
                               }`}
                  >
                    {totalItems}
                  </span>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-500/20"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </>
              )}
            </button>

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMenuOpen(true)}
              className={`md:hidden p-2 rounded-full transition-all ${
                scrolled
                  ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Menú móvil"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* SCROLL INDICATOR */}
        {scrolled && location.pathname === "/" && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-red-300" />
        )}
      </header>

      {/* SPACER */}
      <div className="h-24" />

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* OVERLAY */}
            <motion.div
              className="fixed inset-0 bg-black/70 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* MENU PANEL */}
            <motion.aside
              className="fixed top-0 left-0 h-full w-80 max-w-full bg-gradient-to-b from-red-600 to-red-700 z-[60] shadow-2xl shadow-black/40"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {/* HEADER */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center"
                  >
                    <img
                      src="/imagenes/logo.png"
                      alt="Punto G"
                      className="h-10 w-auto"
                    />
                  </Link>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                    aria-label="Cerrar menú"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* USER INFO */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Bienvenid@</p>
                    <p className="text-white/70 text-sm">
                      Inicia sesión para ver tu cuenta
                    </p>
                  </div>
                </div>
              </div>

              {/* SEARCH MOBILE */}
              <div className="p-6 border-b border-white/10">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                </div>
              </div>

              {/* NAVIGATION */}
              <nav className="p-6">
                <motion.ul className="space-y-1">
                  {navItems.map((item, index) => (
                    <motion.li
                      key={item.name}
                      variants={itemVariants}
                      custom={index}
                    >
                      <NavLink
                        to={item.path}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) => `
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                          ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "text-white/90 hover:bg-white/10"
                          }
                        `}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                      </NavLink>
                    </motion.li>
                  ))}
                </motion.ul>
              </nav>

              {/* REDES SOCIALES EN MENÚ MÓVIL */}
              <div className="p-6 border-t border-white/10">
                <p className="text-white/70 text-sm mb-3">Síguenos en redes</p>
                <div className="flex items-center gap-4">
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex flex-col items-center p-3 rounded-xl bg-gradient-to-r from-pink-500/20 to-pink-600/10 hover:from-pink-500/30 hover:to-pink-600/20 transition-all border border-pink-500/30"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Instagram size={20} className="text-white mb-1" />
                    <span className="text-white text-sm">Instagram</span>
                  </a>

                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex flex-col items-center p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-600/10 hover:from-blue-500/30 hover:to-blue-600/20 transition-all border border-blue-500/30"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Facebook size={20} className="text-white mb-1" />
                    <span className="text-white text-sm">Facebook</span>
                  </a>
                </div>
              </div>

              {/* SECONDARY ACTIONS */}
              <div className="p-6 border-t border-white/10">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="flex flex-col items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
                    onClick={() => {
                      setMenuOpen(false);
                      // Aquí iría la lógica para favoritos
                    }}
                  >
                    <Heart size={18} className="text-white mb-1" />
                    <span className="text-white text-sm">Favoritos</span>
                  </button>
                  <button
                    className="flex flex-col items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowCart(true);
                    }}
                  >
                    <ShoppingCart size={18} className="text-white mb-1" />
                    <span className="text-white text-sm">Carrito</span>
                  </button>
                </div>
              </div>

              {/* FOOTER */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Instagram"
                  >
                    <Instagram size={16} className="text-white" />
                  </a>

                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Facebook"
                  >
                    <Facebook size={16} className="text-white" />
                  </a>
                </div>
                <p className="text-white/60 text-sm text-center">
                  🚚 Envío discreto · 🔒 Pago seguro
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
