// import { BiLogoFacebookCircle } from "react-icons/bi";
// import { FaInstagram } from "react-icons/fa";
// import { AiFillTikTok } from "react-icons/ai";

// const Foter = () => {
//   return (
//     <div>
//       {/* FOOTER */}
//       <footer className="bg-black border-t border-[#ffffff40] mt-10 py-8">
//         <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-10 text-white">
//           <div>
//             <h3 className="text-xl font-semibold mb-3">Punto G</h3>
//             <p className="text-[#ffffff90]">
//               Tu tienda erótica de confianza. Productos 100% originales y envío
//               discreto.
//             </p>
//           </div>

//           <div>
//             <h4 className="text-lg font-semibold mb-3">Contacto</h4>
//             <p className="text-[#ffffff90]">Tel: +57 314 704 1149</p>
//             <p className="text-[#ffffff90]">Cali - Colombia</p>
//             <p className="text-[#ffffff90]">Email: soporte@puntog.com</p>
//           </div>

//           <div>
//             <h4 className="text-lg font-semibold mb-3">Síguenos</h4>
//             <div className="space-y-4 text-[#ffffff90] ">
//               <div className="flex hover:text-white hover:scale-105 hover:duration-300 ease-in-out">
//                 <a href="https://www.facebook.com/profile.php?id=61564262671078&sk=about">
//                   <BiLogoFacebookCircle className="mb-1" size={28} />{" "}
//                 </a>
//                 <p className="pl-2">Facebook</p>
//               </div>
//               <div className="flex hover:text-white hover:scale-105 hover:duration-300 ease-in-out">
//                 <a href="https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.instagram.com%2Fpuntog_24%3Ffbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExcnRzNG52N2VvZFk2d3VuMHNydGMGYXBwX2lkEDIyMjAzOTE3ODgyMDA4OTIAAR7eUYMyxkgz2RrzvP28FtSh3IOw8aTzjxRuuFpoY4svMS80nfg4SiJwcCneZw_aem_S5gd2x9vrjO2WHwBeaaWsg&h=AT0w8dK08cROA8gJHMoMmikxTkCqkbmf_78V_nxdVLvgcVrutqShLKOPdYsFWAIfaQ7qRykp1j61Ld3iCCKOHqzzN75kwUjgQPmXlp6FFmYJWumDvHikpNrXRVRMJKrIDJo">
//                   <FaInstagram className="mb-1" size={28} />
//                 </a>
//                 <p className="pl-2">Instagran</p>
//               </div>
//               <div className="flex hover:text-white hover:scale-105 hover:duration-300 ease-in-out">
//                 <a href="https://www.tiktok.com/@puntoog24?_t=zs-8wuvmqtyxhq&_r=1">
//                   <AiFillTikTok className="mb-1" size={28} />
//                 </a>
//                 <p className="pl-2"> Tik-Tok</p>
//               </div>
//             </div>
//           </div>
//           <div>
//             <h4 className="text-lg font-semibold mb-3">Pagos</h4>
//             <div className="flex hover:text-white mb-4 hover:scale-105 hover:duration-300 ease-in-out">
//               <a href="https://transacciones.nequi.com/bdigital/private/?date=2025-11-21%2011:47:55&region=co">
//                 <img
//                   className="size-8 rounded-full"
//                   src="./public/imagenes/iconos-01.jpg"
//                   alt=""
//                 />
//               </a>
//               <p className="px-3 text-[#ffffff90]">Transferencia</p>
//             </div>
//             <div className="flex hover:text-white hover:scale-105 hover:duration-300 ease-in-out">
//               <a href="">
//                 <img
//                   className="size-8 rounded-full"
//                   src="./public/imagenes/iconos-02.jpg"
//                   alt=""
//                 />
//               </a>
//               <p className="p-3 text-[#ffffff90]"> Contraentrega</p>
//             </div>
//           </div>
//         </div>

//         <p className="text-center text-[#ffffff70] mt-8 text-sm">
//           © {new Date().getFullYear()} Punto G — Todos los derechos reservados.
//         </p>
//       </footer>
//     </div>
//   );
// };

// export default Foter;

import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-pink-600/20 py-10 mt-10 text-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
        {/* Logo + descripción */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img
              src="./public/imagenes/logonalga.png"
              alt="Punto G Sex Shop"
              className="w-12"
            />
            <h2 className="text-2xl font-bold">
              Punto<span className="text-pink-600">G</span>
            </h2>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed">
            Tu tienda erótica de confianza. Productos sensuales, lencería y
            juguetes diseñados para elevar el placer. Envíos 100% discretos y
            seguros.
          </p>
        </div>

        {/* Navegación */}
        <div className="flex flex-col gap-3 text-lg">
          <h3 className="text-pink-600 font-semibold mb-2">Navegación</h3>
          <Link to="/catalogo" className="hover:text-pink-500 transition">
            Productos
          </Link>
          <Link to="/ofertas" className="hover:text-pink-500 transition">
            Ofertas
          </Link>
          <Link to="/nosotros" className="hover:text-pink-500 transition">
            Nosotros
          </Link>
          <Link to="/contacto" className="hover:text-pink-500 transition">
            Contacto
          </Link>
        </div>

        {/* Redes Sociales */}
        <div>
          <h3 className="text-pink-600 font-semibold mb-2">Síguenos</h3>
          <div className="flex gap-4 text-gray-300">
            <a
              href="https://instagram.com"
              target="_blank"
              className="hover:text-pink-500 transition"
            >
              <Instagram size={28} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              className="hover:text-pink-500 transition"
            >
              <Facebook size={28} />
            </a>
            <a
              href="mailto:contacto@puntog.com"
              className="hover:text-pink-500 transition"
            >
              <Mail size={28} />
            </a>
          </div>

          <p className="mt-4 text-gray-400 text-sm">
            Atención 24/7 Envíos discretos a todo el país 🇨🇴
          </p>
        </div>
      </div>

      {/* Línea final */}
      <div className="text-center text-gray-600 text-sm mt-10 border-t border-pink-600/10 pt-5">
        © {new Date().getFullYear()} PuntoG Sex Shop — Todos los derechos
        reservados.
      </div>
    </footer>
  );
};

export default Footer;
