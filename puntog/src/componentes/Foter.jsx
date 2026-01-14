import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Mail,
  Shield,
  Truck,
  Lock,
  Heart,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert("¡Gracias por suscribirte a nuestro newsletter!");
    setEmail("");
  };

  return (
    <footer className="bg-gradient-to-b from-white via-red-50 to-red-50 border-t-2 border-red-100">
      {/* Sección principal del footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Columna 1: Logo y descripción */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">PG</span>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">
                  Punto<span className="text-red-600">G</span>
                </h2>
                <p className="text-sm text-red-500 font-medium">
                  Sex Shop Premium
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              Tu tienda erótica de confianza. Productos sensuales, lencería y
              juguetes diseñados para elevar el placer. Envíos 100% discretos y
              seguros en todo Colombia.
            </p>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-3">
                Mantente informado
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Tu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-medium text-sm"
                >
                  Suscribir
                </button>
              </form>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ChevronRight className="text-red-600" size={20} />
              Navegación
            </h3>
            <ul className="space-y-4">
              {[
                { to: "/catalogo", label: "Productos" },
                { to: "/ofertas", label: "Ofertas Especiales" },
                { to: "/nosotros", label: "Sobre Nosotros" },
                { to: "/contacto", label: "Contacto" },
                { to: "/blog", label: "Blog & Consejos" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-600 hover:text-red-600 hover:font-medium transition-all duration-300 flex items-center gap-2 group"
                  >
                    <div className="w-1.5 h-1.5 bg-red-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Enlaces legales */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Shield className="text-red-600" size={20} />
              Información Legal
            </h3>
            <ul className="space-y-4">
              {[
                {
                  to: "/politica-de-privacidad",
                  label: "Política de Privacidad",
                },
                {
                  to: "/terminos-y-condiciones",
                  label: "Términos y Condiciones",
                },
                {
                  to: "/cambios-y-devoluciones",
                  label: "Cambios y Devoluciones",
                },
                { to: "/politica-de-cookies", label: "Política de Cookies" },
                { to: "/uso-responsable", label: "Uso Responsable +18" },
                { to: "/garantias", label: "Garantías y Servicio" },
                { to: "/envios", label: "Política de Envíos" },
                { to: "/pagos", label: "Métodos de Pago" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-600 hover:text-red-600 hover:font-medium transition-all duration-300 flex items-center gap-2 group"
                  >
                    <div className="w-1.5 h-1.5 bg-red-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Contacto y redes */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Phone className="text-red-600" size={20} />
              Contacto
            </h3>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Phone className="text-red-500 mt-1" size={18} />
                <div>
                  <p className="font-medium text-gray-800">Atención 24/7</p>
                  <p className="text-gray-600 text-sm">+57 300 123 4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="text-red-500 mt-1" size={18} />
                <div>
                  <p className="font-medium text-gray-800">Email</p>
                  <p className="text-gray-600 text-sm">
                    puntogsexshop2024@hotmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-red-500 mt-1" size={18} />
                <div>
                  <p className="font-medium text-gray-800">Ubicación</p>
                  <p className="text-gray-600 text-sm">Bogotá, Colombia</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-4">Síguenos</h4>
              <div className="flex gap-4">
                {[
                  {
                    href: "https://www.instagram.com/puntog_24",
                    icon: <Instagram size={22} />,
                    label: "Instagram",
                  },
                  {
                    href: "https://www.facebook.com/profile.php?id=61564262671078",
                    icon: <Facebook size={22} />,
                    label: "Facebook",
                  },
                  {
                    href: "mailto:puntogsexshop2024@hotmail.com",
                    icon: <Mail size={22} />,
                    label: "Email",
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white border-2 border-red-100 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 shadow-sm hover:shadow-md"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de certificaciones */}
        <div className="border-t border-red-100 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Lock className="text-red-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  Compra 100% Segura
                </p>
                <p className="text-gray-500 text-xs">Datos encriptados SSL</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Truck className="text-red-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  Envíos Discretos
                </p>
                <p className="text-gray-500 text-xs">Todo Colombia</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="text-red-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  Privacidad Garantizada
                </p>
                <p className="text-gray-500 text-xs">Embalaje neutro</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="text-red-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  Calidad Premium
                </p>
                <p className="text-gray-500 text-xs">Productos certificados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección inferior */}
        <div className="border-t border-red-100 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()}{" "}
                <span className="font-bold text-red-600">Punto G Sex Shop</span>{" "}
                — Todos los derechos reservados. | Adultos +18
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Este sitio está destinado exclusivamente a mayores de edad. El
                contenido puede incluir material para adultos.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <span className="text-xs text-gray-500 font-medium">
                Métodos de pago aceptados:
              </span>
              <div className="flex gap-2">
                {["Visa", "Mastercard", "PSE", "Efectivo"].map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1 bg-white border border-red-100 rounded-lg text-xs text-gray-600"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decoración de fondo */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-300 to-transparent opacity-30"></div>
    </footer>
  );
};

export default Footer;

// import { Link } from "react-router-dom";
// import { Facebook, Instagram, Mail } from "lucide-react";

// const Footer = () => {
//   return (
//     <footer className="bg-white border-t border-red-200 mt-16">
//       <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
//         {/* Logo + descripción */}
//         <div>
//           <div className="flex items-center gap-3 mb-4">
//             <img
//               src="public/imagenes/logonalga.png"
//               alt="Punto G Sex Shop"
//               className="w-12"
//             />
//             <h2 className="text-2xl font-extrabold text-gray-900">
//               Punto<span className="text-red-600">G</span>
//             </h2>
//           </div>

//           <p className="text-gray-600 text-sm leading-relaxed">
//             Tu tienda erótica de confianza. Productos sensuales, lencería y
//             juguetes diseñados para elevar el placer. Envíos 100% discretos y
//             seguros en todo Colombia.
//           </p>
//         </div>

//         {/* Navegación */}
//         <div className="flex flex-col gap-3">
//           <h3 className="text-red-600 font-semibold text-lg mb-2">
//             Navegación
//           </h3>

//           <Link
//             to="/catalogo"
//             className="text-gray-700 hover:text-red-600 transition"
//           >
//             Productos
//           </Link>

//           <Link
//             to="/ofertas"
//             className="text-gray-700 hover:text-red-600 transition"
//           >
//             Ofertas
//           </Link>

//           <Link
//             to="/nosotros"
//             className="text-gray-700 hover:text-red-600 transition"
//           >
//             Nosotros
//           </Link>

//           <Link
//             to="/contacto"
//             className="text-gray-700 hover:text-red-600 transition"
//           >
//             Contacto
//           </Link>
//         </div>

//         {/* Legal */}
//         <div className="flex flex-col gap-3">
//           <h3 className="text-red-600 font-semibold text-lg mb-2">Legal</h3>

//           <Link
//             to="/politica-de-privacidad"
//             className="text-gray-700 hover:text-red-600 transition"
//           >
//             Política de Privacidad
//           </Link>

//           <Link to="/terminos-y-condiciones">Términos y Condiciones</Link>
//           <Link to="/cambios-y-devoluciones">Cambios y Devoluciones</Link>
//           <Link to="/politica-de-cookies">Política de Cookies</Link>
//           <Link to="/uso-responsable">Uso Responsable +18</Link>

//           {/* Futuro */}
//           {/* <Link to="/terminos-y-condiciones">Términos y Condiciones</Link> */}
//         </div>

//         {/* Redes Sociales */}
//         <div>
//           <h3 className="text-red-600 font-semibold text-lg mb-3">Síguenos</h3>

//           <div className="flex gap-4 text-gray-600">
//             <a
//               href="https://www.instagram.com/puntog_24"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="hover:text-red-600 transition"
//             >
//               <Instagram size={26} />
//             </a>

//             <a
//               href="https://www.facebook.com/profile.php?id=61564262671078"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="hover:text-red-600 transition"
//             >
//               <Facebook size={26} />
//             </a>

//             <a
//               href="mailto:puntogsexshop2024@hotmail.com"
//               className="hover:text-red-600 transition"
//             >
//               <Mail size={26} />
//             </a>
//           </div>

//           <p className="mt-4 text-gray-500 text-sm">
//             Atención 24/7 • Envíos discretos a todo el país 🇨🇴
//           </p>
//         </div>
//       </div>

//       {/* Línea final */}
//       <div className="border-t border-red-100 py-5 text-center text-gray-500 text-sm">
//         © {new Date().getFullYear()} Punto G Sex Shop — Todos los derechos
//         reservados.
//       </div>
//     </footer>
//   );
// };

// export default Footer;
// //

// //import { Link } from "react-router-dom";
// // import { Facebook, Instagram, Mail } from "lucide-react";

// // const Footer = () => {
// //   return (
// //     <footer className="bg-white border-t border-red-200 mt-16">
// //       <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">
// //         {/* Logo + descripción */}
// //         <div>
// //           <div className="flex items-center gap-3 mb-4">
// //             <img
// //               src="imagenes/logonalga.png"
// //               alt="Punto G Sex Shop"
// //               className="w-12"
// //             />
// //             <h2 className="text-2xl font-extrabold text-gray-900">
// //               Punto<span className="text-red-600">G</span>
// //             </h2>
// //           </div>

// //           <p className="text-gray-600 text-sm leading-relaxed">
// //             Tu tienda erótica de confianza. Productos sensuales, lencería y
// //             juguetes diseñados para elevar el placer. Envíos 100% discretos y
// //             seguros en todo Colombia.
// //           </p>
// //         </div>

// //         {/* Navegación */}
// //         <div className="flex flex-col gap-3">
// //           <h3 className="text-red-600 font-semibold text-lg mb-2">
// //             Navegación
// //           </h3>

// //           <Link
// //             to="/catalogo"
// //             className="text-gray-700 hover:text-red-600 transition"
// //           >
// //             Productos
// //           </Link>

// //           <Link
// //             to="/ofertas"
// //             className="text-gray-700 hover:text-red-600 transition"
// //           >
// //             Ofertas
// //           </Link>

// //           <Link
// //             to="/nosotros"
// //             className="text-gray-700 hover:text-red-600 transition"
// //           >
// //             Nosotros
// //           </Link>

// //           <Link
// //             to="/contacto"
// //             className="text-gray-700 hover:text-red-600 transition"
// //           >
// //             Contacto
// //           </Link>
// //         </div>

// //         {/* Redes Sociales */}
// //         <div>
// //           <h3 className="text-red-600 font-semibold text-lg mb-3">Síguenos</h3>

// //           <div className="flex gap-4 text-gray-600">
// //             <a
// //               href="https://instagram.com"
// //               target="_blank"
// //               className="hover:text-red-600 transition"
// //             >
// //               <Instagram size={26} />
// //             </a>

// //             <a
// //               href="https://facebook.com"
// //               target="_blank"
// //               className="hover:text-red-600 transition"
// //             >
// //               <Facebook size={26} />
// //             </a>

// //             <a
// //               href="mailto:contacto@puntog.com"
// //               className="hover:text-red-600 transition"
// //             >
// //               <Mail size={26} />
// //             </a>
// //           </div>

// //           <p className="mt-4 text-gray-500 text-sm">
// //             Atención 24/7 • Envíos discretos a todo el país 🇨🇴
// //           </p>
// //         </div>
// //       </div>

// //       {/* Línea final */}
// //       <div className="border-t border-red-100 py-5 text-center text-gray-500 text-sm">
// //         © {new Date().getFullYear()} Punto G Sex Shop — Todos los derechos
// //         reservados.
// //       </div>
// //     </footer>
// //   );
// // };

// // export default Footer;
