import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function EnvioModal({ cerrar }) {
  const { setCiudad } = useCart();

  const { showShippingModal, setShowShippingModal } = useCart();

  if (!showShippingModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
        onClick={() => setShowShippingModal(false)}
      >
        <motion.div
          className="bg-black p-6 rounded-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between mb-4">
            <h2 className="text-pink-400 font-bold text-lg">Datos de envío</h2>
            <button onClick={() => setShowShippingModal(false)}>
              <X />
            </button>
          </div>

          <FormularioEnvio onClose={() => setShowShippingModal(false)} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
