import { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, setShowCart } = useCart();

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

          {/* TEXTO CENTRAL */}
          <div className="hidden md:block">
            <span className="text-pink-400/90 font-medium tracking-wide text-sm uppercase">
              Discreción • Elegancia • Placer
            </span>
          </div>

          {/* ICONOS */}
          <div className="flex items-center gap-4">
            {/* CARRITO */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-3 rounded-full border border-pink-500/40 hover:border-pink-400 transition"
            >
              <ShoppingCart size={22} className="text-pink-400" />

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* MENU MOBILE */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 text-white"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MENU MOBILE ================= */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              className="fixed top-0 left-0 h-full w-80 bg-black z-50 p-6"
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
                    className="block text-white hover:text-pink-400"
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
