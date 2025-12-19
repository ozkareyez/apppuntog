import { motion } from "framer-motion";
import ContactForm from "../componentes/ContactForm";
import MainEnterga from "../componentes/MainEnterga";
import Categorias from "../componentes/Categorias";
import Productos from "./Productos";
import Header from "../componentes/Header";
import { FloatingWhatsApp } from "react-floating-whatsapp";
import { useCart } from "@/context/CartContext";

const Home = () => {
  const { setShowCart, totalItems } = useCart();

  <button onClick={() => setShowCart(true)}>🛒 {totalItems}</button>;

  return (
    <div className="w-full">
      <Header totalItems={totalItems} onCartClick={() => setShowCart(true)} />

      <Productos />
      <Categorias />

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
