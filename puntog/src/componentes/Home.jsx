import MainCTA from "./MainCTA";
//import Cards from "./Navbar/header/Cards";
import { motion } from "framer-motion";
import ContactForm from "./ContactForm";
import MainEnterga from "./MainEnterga";

const Home = () => {
  return (
    <div className="w-full">
      {/* CTA principal */}
      <MainCTA />

      {/* Separador suave */}
      <motion.div
        className="w-full h-1 bg-linear-to-r from-pink-500 to-purple-600 my-10 rounded-full"
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        transition={{ duration: 0.8 }}
      />

      {/* Cards del catálogo */}
      <section id="cards-section" className="max-w-7xl mx-auto px-4 pb-10">
        <motion.h2
          className="text-3xl font-bold text-center text-pink-600 mb-6"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        ></motion.h2>

        {/* <Cards /> */}

        <MainEnterga />

        <ContactForm />
      </section>
    </div>
  );
};

export default Home;
