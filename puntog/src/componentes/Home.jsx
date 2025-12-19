import MainCTA from "./MainCTA";
import Ofertas from "./Ofertas";
//import Cards from "./Navbar/header/Cards";
import { motion } from "framer-motion";
import ContactForm from "./ContactForm";
import MainEnterga from "./MainEnterga";
import Categorias from "./Categorias";
import Header from "./Header";
import { FloatingWhatsApp } from "react-floating-whatsapp";

const Home = () => {
  const addToCart = (producto) => {
    const existe = cart.find((p) => p.id === producto.id);
    if (existe) {
      setCart(
        cart.map((p) =>
          p.id === producto.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setCart([...cart, { ...producto, quantity: 1 }]);
    }
  };

  const increaseQuantity = (id) =>
    setCart(
      cart.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p))
    );

  const decreaseQuantity = (id) =>
    setCart(
      cart.map((p) =>
        p.id === id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p
      )
    );

  const removeFromCart = (id) => setCart(cart.filter((p) => p.id !== id));

  const total = cart.reduce((sum, p) => sum + p.precio * p.quantity, 0);
  const totalItems = cart.reduce((sum, p) => sum + p.quantity, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Cambio en ${name}:`, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full">
      <FloatingWhatsApp
        phoneNumber="+573147041149"
        accountName="Punto G"
        chatMessage="Hola 👋 ¿en qué te ayudamos?"
        avatar="/imagenes/logo.png"
      />

      <Header totalItems={totalItems} onCartClick={() => setShowCart(true)} />
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
