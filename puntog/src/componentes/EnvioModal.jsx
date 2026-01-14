import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import FormularioEnvioModal from "@/componentes/FormularioEnvioModal";

export default function EnvioModal() {
  const { showShippingModal, setShowShippingModal } = useCart();

  return (
    <AnimatePresence>
      {showShippingModal && (
        <motion.div
          className="fixed inset-0 z-10000 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* OVERLAY */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowShippingModal(false)}
          />

          {/* MODAL */}
          <motion.div
            className="relative w-full max-w-md rounded-2xl bg-black p-6 shadow-2xl"
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-red-600 font-bold text-lg">Datos de envío</h2>

              <button
                onClick={() => setShowShippingModal(false)}
                className="text-white/60 hover:text-white transition"
              >
                <X />
              </button>
            </div>

            {/* FORMULARIO */}
            <FormularioEnvioModal />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
