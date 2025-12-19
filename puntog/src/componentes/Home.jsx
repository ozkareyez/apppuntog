import MainCTA from "./MainCTA";
import Ofertas from "./Ofertas";
//import Cards from "./Navbar/header/Cards";
import { motion } from "framer-motion";
import ContactForm from "./ContactForm";
import MainEnterga from "./MainEnterga";
import Categorias from "./Categorias";
import Header from "./Header";

const Home = () => {
  return (
    <div className="w-full">
      <Header />
      {/* CTA principal */}
      <MainCTA />

      {/* Categorías */}
      <Categorias />

      {/* Separador */}
      <motion.div
        className="w-full h-1 bg-linear-to-r from-pink-500 to-purple-600 my-10 rounded-full"
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        transition={{ duration: 0.8 }}
      />

      {/* Ofertas / Cards */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <Ofertas />
        <MainEnterga />
        <ContactForm />
      </section>
    </div>
  );
};

export default Home;
