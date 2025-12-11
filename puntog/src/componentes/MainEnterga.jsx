import { FaShippingFast } from "react-icons/fa";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { BsFillBox2HeartFill } from "react-icons/bs";
import { BsCashCoin } from "react-icons/bs";

const MainEnterga = () => {
  return (
    <section
      className="w-full h-150  py-10 px-6 bg-linear-to-br items-center from-pink-600 via-pink-500 to-purple-600 text-white  shadow-2xl mt-10 md:flex md:h-60 md:m-auto md:mt-10"
      md:m-auto
    >
      <div className="border border-pink-500 mb-4 p-4 flex text-center h-25 rounded-lg text-[14px] items-center shadow-xl shadow-black/40 hover:scale-110 transition-all duration-500 md:w-65 md:h-35 m-5 ">
        <FaShippingFast size={80} />
        <p className="text-center font-medium ">
          Envios gratis a todo colombia por compras mayores a $ 200.00
        </p>
      </div>

      <div className="border border-pink-500 mb-4 p-4 flex text-center h-25 rounded-lg text-[14px] items-center shadow-2x4 hover:scale-110 transition-all duration-500   md:w-65 md:h-35 m-5  shadow-xl shadow-black/40 ">
        <BsCashCoin size={60} />
        <p className="text-center  font-medium">
          Pagos contraenterga y trasnferencias
        </p>
      </div>

      <div className="border border-pink-500 mb-4 p-4 flex text-center h-25 rounded-lg text-[14px] items-center shadow-2x4 hover:scale-110 transition-all duration-500   md:w-65 md:h-35 m-5 shadow-xl shadow-black/40 ">
        <AiOutlineSafetyCertificate size={60} />
        <p className="text-center font-medium">Entrega Certificada</p>
      </div>

      <div className="border border-pink-500 mb-4 p-4 flex text-center h-25 rounded-lg text-[14px] items-center shadow-24l hover:scale-110 transition-all duration-500  md:w-65 md:h-35 m-5  shadow-xl shadow-black/40 ">
        <BsFillBox2HeartFill size={60} />
        <p className="text-center font-medium">
          Discrecion en la entrega de sus paquetes
        </p>
      </div>
    </section>
  );
};

export default MainEnterga;
