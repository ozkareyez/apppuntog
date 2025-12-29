import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-red-200 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
        {/* Logo + descripción */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src="imagenes/logonalga.png"
              alt="Punto G Sex Shop"
              className="w-12"
            />
            <h2 className="text-2xl font-extrabold text-gray-900">
              Punto<span className="text-red-600">G</span>
            </h2>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">
            Tu tienda erótica de confianza. Productos sensuales, lencería y
            juguetes diseñados para elevar el placer. Envíos 100% discretos y
            seguros en todo Colombia.
          </p>
        </div>

        {/* Navegación */}
        <div className="flex flex-col gap-3">
          <h3 className="text-red-600 font-semibold text-lg mb-2">
            Navegación
          </h3>

          <Link
            to="/catalogo"
            className="text-gray-700 hover:text-red-600 transition"
          >
            Productos
          </Link>

          <Link
            to="/ofertas"
            className="text-gray-700 hover:text-red-600 transition"
          >
            Ofertas
          </Link>

          <Link
            to="/nosotros"
            className="text-gray-700 hover:text-red-600 transition"
          >
            Nosotros
          </Link>

          <Link
            to="/contacto"
            className="text-gray-700 hover:text-red-600 transition"
          >
            Contacto
          </Link>
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-3">
          <h3 className="text-red-600 font-semibold text-lg mb-2">Legal</h3>

          <Link
            to="/politica-de-privacidad"
            className="text-gray-700 hover:text-red-600 transition"
          >
            Política de Privacidad
          </Link>

          {/* Futuro */}
          {/* <Link to="/terminos-y-condiciones">Términos y Condiciones</Link> */}
        </div>

        {/* Redes Sociales */}
        <div>
          <h3 className="text-red-600 font-semibold text-lg mb-3">Síguenos</h3>

          <div className="flex gap-4 text-gray-600">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-600 transition"
            >
              <Instagram size={26} />
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-600 transition"
            >
              <Facebook size={26} />
            </a>

            <a
              href="mailto:contacto@puntog.com"
              className="hover:text-red-600 transition"
            >
              <Mail size={26} />
            </a>
          </div>

          <p className="mt-4 text-gray-500 text-sm">
            Atención 24/7 • Envíos discretos a todo el país 🇨🇴
          </p>
        </div>
      </div>

      {/* Línea final */}
      <div className="border-t border-red-100 py-5 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Punto G Sex Shop — Todos los derechos
        reservados.
      </div>
    </footer>
  );
};

export default Footer;
//

import { Link } from "react-router-dom";
// import { Facebook, Instagram, Mail } from "lucide-react";

// const Footer = () => {
//   return (
//     <footer className="bg-white border-t border-red-200 mt-16">
//       <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">
//         {/* Logo + descripción */}
//         <div>
//           <div className="flex items-center gap-3 mb-4">
//             <img
//               src="imagenes/logonalga.png"
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

//         {/* Redes Sociales */}
//         <div>
//           <h3 className="text-red-600 font-semibold text-lg mb-3">Síguenos</h3>

//           <div className="flex gap-4 text-gray-600">
//             <a
//               href="https://instagram.com"
//               target="_blank"
//               className="hover:text-red-600 transition"
//             >
//               <Instagram size={26} />
//             </a>

//             <a
//               href="https://facebook.com"
//               target="_blank"
//               className="hover:text-red-600 transition"
//             >
//               <Facebook size={26} />
//             </a>

//             <a
//               href="mailto:contacto@puntog.com"
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
