// src/pages/Home.jsx
import { motion } from "framer-motion";
import Productos from "./Productos";
import ContactForm from "../componentes/ContactForm";
import MainEnterga from "../componentes/MainEnterga";
import MainCTA from "../componentes/MainCTA";

const Home = () => {
  return (
    <div className="w-full bg-white">
      {/* HERO / CTA */}
      <section className="bg-gradient-to-b from-white to-gray-50">
        <MainCTA />
      </section>

      {/* PRODUCTOS */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        {/* <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
         <span className="text-red-600">Nuestros</span> Productos
        </h2>  */}

        <Productos />
      </section>

      {/* SEPARADOR */}
      <motion.div
        className="max-w-5xl mx-auto h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500 my-14 rounded-full"
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* ENTREGA + CONTACTO */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-1 gap-12 items-start">
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            <MainEnterga />
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            {/* <h3 className="text-2xl font-bold mb-6">
              <span className="text-red-600">Contáctanos</span>
            </h3> */}
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
