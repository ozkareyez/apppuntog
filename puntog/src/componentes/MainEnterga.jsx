import { FaShippingFast } from "react-icons/fa";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { BsFillBox2HeartFill, BsCashCoin } from "react-icons/bs";

const MainEntrega = () => {
  return (
    <section
      className="
      w-full py-14 px-6 mt-12
      bg-gradient-to-br from-pink-600 via-pink-500 to-purple-600
    "
    >
      {/* CONTENEDOR */}
      <div
        className="
        max-w-7xl mx-auto
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
        gap-6
      "
      >
        {/* ITEM */}
        <div className="beneficio-card">
          <FaShippingFast size={48} />
          <h3>Envíos Gratis</h3>
          <p>Envíos a toda Colombia por compras mayores a $200.000</p>
        </div>

        <div className="beneficio-card">
          <BsCashCoin size={48} />
          <h3>Pago Seguro</h3>
          <p>Pagos contraentrega y transferencias bancarias</p>
        </div>

        <div className="beneficio-card">
          <AiOutlineSafetyCertificate size={48} />
          <h3>Entrega Certificada</h3>
          <p>Tu pedido llega seguro y verificado</p>
        </div>

        <div className="beneficio-card">
          <BsFillBox2HeartFill size={48} />
          <h3>Entrega Discreta</h3>
          <p>Empaques discretos para mayor privacidad</p>
        </div>
      </div>
    </section>
  );
};

export default MainEntrega;
