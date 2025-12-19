import { motion } from "framer-motion";
import ContactForm from "../componentes/ContactForm";
import MainEnterga from "../componentes/MainEnterga";
import Categorias from "../componentes/Categorias";
import Productos from "./Productos";
import { FloatingWhatsApp } from "react-floating-whatsapp";
import Header from "../componentes/Header";
import { useCart } from "@/context/CartContext";

const Home = () => {
  // ✅ CORRECCIÓN: obtener totalItems del contexto
  const { totalItems } = useCart();

  return (
    <div className="w-full">
      {/* ✅ totalItems ahora existe */}
      <Header totalItems={totalItems} />

      <Productos />

      {/* Categorías */}
      <Categorias />

      {/* Separador */}
      <motion.div
        className="w-full h-1 bg-linear-to-r from-pink-500 to-purple-600 my-10 rounded-full"
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        transition={{ duration: 0.8 }}
      />

      <section className="max-w-7xl mx-auto px-4 pb-10">
        <MainEnterga />
        <ContactForm />

        <FloatingWhatsApp
          phoneNumber="+573147041149"
          accountName="Punto G"
          chatMessage="Hola 👋 ¿en qué te ayudamos?"
          avatar="/imagenes/logo.png"
        />
      </section>
    </div>
  );
};

export default Home;
