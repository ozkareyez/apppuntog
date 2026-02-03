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
  Sparkles,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cart, setShowCart } = useCart();

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

  const socialLinks = {
    instagram: "https://instagram.com/puntog_24",
    facebook: "https://www.facebook.com/profile.php?id=61564262671078",
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white text-xs md:text-sm py-2 px-2 md:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-1 md:gap-2">
          <Sparkles size={10} className="text-yellow-300 flex-shrink-0" />
          <div className="truncate text-center">
            🚚 <span className="font-semibold">ENVÍO GRATIS</span> +$200.000
            <span className="mx-1 md:mx-2">•</span>
            🎁 <span className="font-semibold">DESPACHOS SOLO A </span> COLOMBIA
          </div>
          <Sparkles size={10} className="text-yellow-300 flex-shrink-0" />
        </div>
      </div>

      {/* MAIN HEADER */}
      <header
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white shadow-md"
            : "bg-gradient-to-b from-red-600 to-red-700"
        }`}
      >
        <div className="w-full px-3 md:px-6 h-full">
          <div className="h-16 md:h-24   flex items-center justify-between max-w-7xl mx-auto">
            {/* LOGO SIMPLIFICADO */}
            <Link to="/" className="flex items-center">
              <div className="relative">
                <img
                  src="/imagenes/logo.png"
                  alt="Punto G"
                  // Logo siempre con colores originales, sin filtros
                  className="h-32 md:h-30 w-auto object-contain"
                  onError={(e) => {
                    console.log(
                      "Logo error, current src:",
                      e.currentTarget.src,
                    );
                    // Fallback si la imagen no carga
                    e.currentTarget.alt = "Punto G";
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='40' viewBox='0 0 100 40'%3E%3Crect width='100' height='40' fill='%23dc2626'/%3E%3Ctext x='50' y='22' font-family='Arial' font-size='14' fill='white' text-anchor='middle'%3EPUNTO G%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => `
                    px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    flex items-center gap-2 whitespace-nowrap
                    ${
                      scrolled
                        ? isActive
                          ? "text-red-600 bg-red-50"
                          : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                        : isActive
                          ? "text-white bg-white/20"
                          : "text-white hover:bg-white/10"
                    }
                  `}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* SEARCH BUTTON (DESKTOP) */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`hidden md:flex p-2 rounded-lg transition-colors ${
                  scrolled
                    ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Search size={18} />
              </button>

              {/* SOCIAL ICONS (DESKTOP) */}
              <div className="hidden md:flex items-center gap-1">
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg transition-colors ${
                    scrolled
                      ? "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <Instagram size={16} />
                </a>
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg transition-colors ${
                    scrolled
                      ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <Facebook size={16} />
                </a>
              </div>

              {/* CART BUTTON */}
              <button
                onClick={() => setShowCart(true)}
                className={`p-2 rounded-lg transition-colors relative ${
                  scrolled
                    ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 text-[10px] font-bold w-4 h-4
                               rounded-full flex items-center justify-center
                               ${
                                 scrolled
                                   ? "bg-red-600 text-white"
                                   : "bg-white text-red-600"
                               }`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* MOBILE MENU BUTTON */}
              <button
                onClick={() => setMenuOpen(true)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  scrolled
                    ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* SEARCH BAR (DESKTOP) */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="absolute top-full left-0 right-0 bg-white border-t shadow-lg overflow-hidden"
              >
                <div className="max-w-7xl mx-auto px-3 md:px-6 py-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border 
                               border-gray-200 focus:outline-none focus:ring-2 
                               focus:ring-red-500 focus:border-transparent text-sm"
                      autoFocus
                    />
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* SPACER */}
      <div className="h-14 md:h-20"></div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setMenuOpen(false)}
            />

            {/* MENU PANEL */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed top-0 left-0 h-full w-[280px] max-w-[90%] 
                       bg-gradient-to-b from-red-600 to-red-700 z-50 
                       shadow-2xl overflow-y-auto"
            >
              {/* HEADER */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                {/* <div className="flex items-center gap-2">
                  <img
                    src="/imagenes/logonalga.png"
                    alt="Punto G"
                    // En el menú móvil, el logo se muestra con fondo rojo, por lo que lo hacemos blanco
                    className="h-10 w-auto brightness-0 invert"
                  />
                  <span className="text-white font-semibold text-sm">Menú</span>
                </div> */}
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>

              {/* USER SECTION */}
              {/* <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-white/10">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      ¡Bienvenid@!
                    </p>
                    <p className="text-white/70 text-xs">Inicia sesión</p>
                  </div>
                </div>
              </div> */}

              {/* MOBILE SEARCH */}
              <div className="p-4 border-b border-white/10">
                {/* <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full pl-9 pr-3 py-2 bg-white/10 rounded-lg 
                             border border-white/20 text-white placeholder-white/60 
                             text-sm focus:outline-none focus:border-white/40"
                  />
                  <Search
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/60"
                    size={14}
                  />
                </div> */}
              </div>

              {/* NAVIGATION */}
              <nav className="p-4">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.path}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                          ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "text-white/90 hover:bg-white/10"
                          }
                        `}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-medium text-sm">{item.name}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* QUICK ACTIONS */}
              <div className="p-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="flex flex-col items-center p-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Heart size={16} className="text-white mb-1" />
                    <span className="text-white text-xs">Favoritos</span>
                  </button>
                  <button
                    className="flex flex-col items-center p-3 rounded-lg bg-white/10 hover:bg-white/20 transition relative"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowCart(true);
                    }}
                  >
                    <ShoppingCart size={16} className="text-white mb-1" />
                    <span className="text-white text-xs">Carrito</span>
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-red-600 text-[10px] font-bold flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* SOCIAL LINKS */}
              <div className="p-4 border-t border-white/10">
                <p className="text-white/70 text-xs mb-3">Síguenos</p>
                <div className="flex gap-3">
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex flex-col items-center p-2 rounded-lg bg-gradient-to-r from-pink-500/20 to-pink-600/10 border border-pink-500/30 transition hover:from-pink-500/30"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Instagram size={14} className="text-white mb-1" />
                    <span className="text-white text-xs">Instagram</span>
                  </a>
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex flex-col items-center p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/30 transition hover:from-blue-500/30"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Facebook size={14} className="text-white mb-1" />
                    <span className="text-white text-xs">Facebook</span>
                  </a>
                </div>
              </div>

              {/* FOOTER */}
              <div className="p-4 border-t border-white/10 mt-auto">
                <p className="text-white/50 text-[10px] text-center leading-tight">
                  🔒 Pago 100% seguro
                  <br />
                  🚚 Envío discreto y rápido
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
