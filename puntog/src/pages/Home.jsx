// src/pages/Home.jsx
import { motion } from "framer-motion";
import Productos from "./Productos";
import ContactForm from "../componentes/ContactForm";
import MainEnterga from "../componentes/MainEnterga";
import MainCTA from "../componentes/MainCTA";

const Home = () => {
  return (
    <div className="w-full">
      <MainCTA />

      <Productos />

      <motion.div
        className="w-full h-1 bg-linear-to-r from-pink-500 to-purple-600 my-10 rounded-full"
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        transition={{ duration: 0.8 }}
      />

      <section className="max-w-7xl mx-auto px-4 pb-10">
        <MainEnterga />
        <ContactForm />
      </section>
    </div>
  );
};

export default Home;
