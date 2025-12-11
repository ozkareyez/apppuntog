import { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Header = ({ totalItems, onCartClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* HEADER */}
      <header className="w-full bg-black/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/imagenes/logo.png"
              className="w-20 h-auto"
              alt="Punto G"
            />
          </Link>

          {/* CTA (solo desktop) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="hidden md:block"
          >
            <span className="text-pink-400 font-semibold tracking-wide text-lg drop-shadow">
              ✨ Enciende tus deseos, descubre tu placer ✨
            </span>
          </motion.div>

          {/* ICONOS DERECHA */}
          <div className="flex items-center gap-4">
            {/* Carrito */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onCartClick}
              className="relative p-3 bg-white rounded-full shadow hover:bg-gray-100 transition"
            >
              <ShoppingCart size={22} className="text-black" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white font-bold text-xs w-6 h-6 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </motion.button>

            {/* MENÚ MOBILE */}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={30} />
            </button>
          </div>
        </div>
      </header>

      {/* MENU MOBILE (overlay + panel) */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Fondo oscuro */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* PANEL LATERAL */}
            <motion.div
              className="fixed top-0 left-0 h-full w-72 bg-black/90 text-white z-50 shadow-xl p-6 flex flex-col"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 80 }}
            >
              {/* Cerrar */}
              <button
                onClick={() => setMenuOpen(false)}
                className="self-end mb-6"
              >
                <X size={28} />
              </button>

              {/* LINKS */}
              <nav className="space-y-6 text-lg">
                <Link to="/" className="hover:text-pink-400 block">
                  Inicio
                </Link>

                <Link to="/catalogo" className="hover:text-pink-400 block">
                  Catálogo
                </Link>

                <Link to="/promos" className="hover:text-pink-400 block">
                  Promociones
                </Link>

                <Link to="/contacto" className="hover:text-pink-400 block">
                  Contacto
                </Link>
              </nav>

              {/* CTA en móvil */}
              <div className="mt-auto text-center pt-8 text-[18px]">
                <p className="text-pink-300 font-semibold">
                  ✨ Vive tu experiencia PuntoG ✨
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
